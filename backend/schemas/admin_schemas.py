from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class SessionExchangeSchema(BaseModel):
    id: int
    data: Dict[str, Any]
    exchange_metadata: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        orm_mode = True

class SessionSchema(BaseModel):
    id: int
    uuid: str
    summary: Optional[Dict[str, Any]]
    session_metadata: Optional[Dict[str, Any]]
    session_questions: Optional[Dict[str, Any]]
    contexts: Optional[Dict[str, Any]]
    call_id: Optional[str]
    status: Optional[str]
    used_credits: Optional[int]
    created_at: datetime
    updated_at: datetime
    exchanges: List[SessionExchangeSchema] = []

    class Config:
        orm_mode = True

class PaymentSchema(BaseModel):
    id: int
    payment_details: Dict[str, Any]
    created_at: datetime

    class Config:
        orm_mode = True

class UserSchema(BaseModel):
    id: int
    uuid: str
    username: str
    email: str
    phone: Optional[str]
    is_active: bool
    is_deleted: bool
    credits: Optional[int]
    created_at: datetime
    last_login: datetime
    referral_code: Optional[str]
    referred_code: Optional[str]

    class Config:
        orm_mode = True

class UserWithSessionsSchema(UserSchema):
    sessions: List[SessionSchema] = []

    class Config:
        orm_mode = True

class UserWithPaymentsSchema(UserSchema):
    payments: List[PaymentSchema] = []

    class Config:
        orm_mode = True

class PaginatedUsersResponse(BaseModel):
    total: int
    currentPage: int
    limit: int
    users: List[dict]


class OrganisationCreateRequest(BaseModel):
    name: str
    api_key: str
    ats: str

class OrganisationResponse(BaseModel):
    id: int
    name: str
    # api_key: str
    # created_by: int
    createdAt: datetime
    updatedAt: datetime

class PaginatedOrganisationsResponse(BaseModel):
    total: int
    currentPage: int
    limit: int
    organisations: List[OrganisationResponse]

class PaymentSummaryResponse(BaseModel):
    total_amount_pending: float
    total_amount_completed: float

# class AgentUpdateCreateRequest(BaseModel):
#     name: str
#     version: str
#     prompt: str
    # llmConfig: dict
    # org_id: int
class AgentUpdateCreateRequest(BaseModel):
    name: str
    version: str
    prompt: str
    # llmConfig: dict
class ExternalUserCreateRequest(BaseModel):
    recruiterName: str
    recruiterEmail: str
    orgName: str

class RecruiterCreateRequest(BaseModel):
    recruiterName: str
    recruiterEmail: str
    orgName: Optional[str] = None
    
class AdminLoginRequest(BaseModel): 
    email: str
    name: str