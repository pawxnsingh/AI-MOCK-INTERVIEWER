from fastapi import APIRouter, Depends, Query, HTTPException, status, Request
from sqlalchemy.orm import Session
from models.base import get_db_session
from models.organisations import Organisation
from models.users import User, userRoleEnum
from services.admin_service import AdminService
from schemas.admin_schemas import (
    AdminLoginRequest,
    PaginatedUsersResponse, 
    UserSchema, 
    UserWithSessionsSchema,
    UserWithPaymentsSchema,
    PaymentSummaryResponse, 
    SessionSchema, 
    PaymentSchema,
    OrganisationCreateRequest,
    OrganisationResponse,
    PaginatedOrganisationsResponse,
    ExternalUserCreateRequest,
    RecruiterCreateRequest,
    AgentUpdateCreateRequest
)
from typing import List, Optional
from datetime import datetime
import logging
from services.user_services import create_or_get_user, get_user_profile
from utils.admin_auth import get_user_from_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_db():
    """Dependency to get database session."""
    with get_db_session() as db:
        yield db

@router.get("/users", response_model=PaginatedUsersResponse)
def get_all_users(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Number of users per page"),
    sort_by: str = Query("last_login", enum=["last_login", "created_at"], description="Sort by field"),
    start_time: Optional[datetime] = Query(None, description="Filter start time"),
    end_time: Optional[datetime] = Query(None, description="Filter end time")
):
    try:
        result = AdminService.get_all_users(
            db=db,
            page=page,
            limit=limit,
            sort_by=sort_by,
            start_time=start_time,
            end_time=end_time
        )
        return result
        
    except Exception as e:
        logger.exception(f"[admin_router.get_all_users] :: Error retrieving users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve users"
        )

@router.get("/users/{identifier}", response_model=UserSchema)
def get_user_by_identifier(identifier: str, db: Session = Depends(get_db)):
    try:
        user = AdminService.get_user_by_identifier(db=db, identifier=identifier)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"User not found with identifier: {identifier}"
            )
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.get_user_by_identifier] :: Error retrieving user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user"
        )

@router.get("/users/{user_uuid}/sessions", response_model=List[SessionSchema])
def get_user_sessions_and_exchanges(user_uuid: str, db: Session = Depends(get_db)):
    try:
        user = AdminService.get_user_sessions(db=db, user_uuid=user_uuid)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"User not found with UUID: {user_uuid}"
            )
        return user.sessions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.get_user_sessions_and_exchanges] :: Error retrieving sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user sessions"
        )

@router.get("/users/{user_uuid}/payments", response_model=List[PaymentSchema])
def get_user_payments_data(user_uuid: str, db: Session = Depends(get_db)):
    try:
        user = AdminService.get_user_payments(db=db, user_uuid=user_uuid)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"User not found with UUID: {user_uuid}"
            )
        return user.payments
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.get_user_payments_data] :: Error retrieving payments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user payments"
        )

@router.get("/payments/summary", response_model=PaymentSummaryResponse)
def get_payments_summary(db: Session = Depends(get_db)):
    try:
        summary = AdminService.get_payment_totals(db=db)
        return summary
        
    except Exception as e:
        logger.exception(f"[admin_router.get_payments_summary] :: Error retrieving payment summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve payment summary"
        )

# 1. Create a new organisation (INTERNAL only)
@router.post("/create/org", response_model=OrganisationResponse)
def create_organisation(request: Request, org_data: OrganisationCreateRequest, db: Session = Depends(get_db)):
    try:
        user = get_user_from_token(request, db)
        if user.role != "INTERNAL":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only INTERNAL users can create organisations")
        org = AdminService.create_organisation(db, name=org_data.name, api_key=org_data.api_key, created_by=user.id, ats=org_data.ats)
        return org
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.create_organisation] :: Error creating organisation: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# 2. Get all available organisations (INTERNAL only)
@router.get("/org/get-all", response_model=PaginatedOrganisationsResponse)
def get_all_organisations(request: Request, db: Session = Depends(get_db), page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=10)):
    try:
        user = get_user_from_token(request, db)
        if user.role != "INTERNAL":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only INTERNAL users can access all organisations")
        result = AdminService.get_all_organisations(db, page=page, limit=limit)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.get_all_organisations] :: Error retrieving organisations: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# 3. Add new users into an organisation (INTERNAL only)
@router.post("/org/add-account")
def add_external_user_to_org(request: Request, user_data: ExternalUserCreateRequest, db: Session = Depends(get_db)):
    try:
        user = get_user_from_token(request, db)
        if user.role != "INTERNAL":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only INTERNAL users can add EXTERNAL users to organisations")
        new_user = AdminService.create_external_user(
            db, 
            username=user_data.recruiterName, 
            email=user_data.recruiterEmail,
            org_name=user_data.orgName)
        
        result = get_user_profile(new_user.uuid)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.add_external_user_to_org] :: Error creating external user: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# 4. Add new recruiter to an organisation (INTERNAL and EXTERNAL roles)
@router.post("/org/add-recruiter")
def add_recruiter_to_org(request: Request, user_data: RecruiterCreateRequest, db: Session = Depends(get_db)):
    try:
        user = get_user_from_token(request, db)
        
        if user.role not in [userRoleEnum.INTERNAL.value, userRoleEnum.EXTERNAL.value]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Only INTERNAL and EXTERNAL users can add recruiters to organisations"
            )
        
        if user.role == userRoleEnum.INTERNAL.value:
            # INTERNAL users must provide orgName
            if not user_data.orgName:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="orgName is required for INTERNAL users"
                )
            
            org_data = db.query(Organisation).filter(
                Organisation.name == user_data.orgName.lower().strip()
            ).first()
            
            if not org_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Organisation not found"
                )
            
            org_id = org_data.id
            
        elif user.role == userRoleEnum.EXTERNAL.value:
            # EXTERNAL users use their own org, ignore orgName from payload
            if not user.org_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User is not linked to any organisation"
                )
            
            org_id = user.org_id
        
        new_recruiter = AdminService.create_recruiter(
            db=db,
            username=user_data.recruiterName,
            email=user_data.recruiterEmail,
            org_id=org_id
        )
        
        result = get_user_profile(new_recruiter.uuid)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.add_recruiter_to_org] :: Error creating recruiter: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/org/get/{org_name}/users/{page}", response_model=PaginatedUsersResponse)
def get_external_users_of_org(request: Request, org_name: str, db: Session = Depends(get_db), page: int = 1):
    try:
        user = get_user_from_token(request, db)
        org_data = db.query(Organisation).filter(Organisation.name == org_name.lower().strip()).first()
        if user.role == "EXTERNAL" and user.org_id != org_data.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="EXTERNAL users can only access their own organisation's users")
        result = AdminService.get_external_users_of_org(db, org_id=org_data.id, page=page, limit=10)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.get_external_users_of_org] :: Error retrieving external users: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# org recruiter signup/login , after oauth, login redirect link to login with email 
# if recruiter is added to an org by an admin then return back the profile directly with message saying if added to an org or not 
# if not in an org then create the user as regular user and return back the profile with message saying if added to an org or not     
@router.post("/login")
def admin_login_api(request: Request, data : AdminLoginRequest, db: Session = Depends(get_db)):
    try:

        email = data.email
        name = data.name 
        
        existing_user = db.query(User).filter(User.email == email.strip()).first()
        user_uuid = None
        if not existing_user: 
            args = {
                "user_google_id": email,
                "email" : email,
                "username" : name
            }
            
            r1 = create_or_get_user(args)
            user_uuid = r1.get("userId", None)
        else: 
            # for adding username if it were missing 
            if not existing_user.username:
                existing_user.username = name.strip()
                db.commit()
                db.refresh(existing_user)
            user_uuid = existing_user.uuid
        
        
        result = get_user_profile(user_uuid)
        
        return result 
    except Exception: 
        logger.exception(f"[admin_router.admin_login_api] :: caught exception")
        raise HTTPException(status_code=500)