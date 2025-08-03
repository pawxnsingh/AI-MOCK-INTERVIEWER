from fastapi import APIRouter, HTTPException, Request
from services.user_services import create_or_get_user, get_all_referred_users, get_user_profile, link_referral_code
import logging 

logger = logging.getLogger(__name__)

user_router = APIRouter(prefix="/user", tags=["user"])

# class signupOrLoginReq(BaseModel):
#     username: str
#     email: str
#     password: str

# @user_router.post("/signup")
# async def create_new_user_api(req: signupOrLoginReq):
#     try:
#         args = {
#             "username" : req.username,
#             "email" : req.email,
#             "password" : req.password
#         }
#         new_user = create_or_get_user(args)
#         if not new_user:
#             logger.exception("[user_router | create_new_user_api] :: User creation failed.")
#             raise HTTPException(status_code=400, detail="User creation failed.")
        
#         return new_user
    
#     except Exception:
#         logger.exception("[user_router | create_new_user_api] :: caught exception")
#         raise HTTPException(status_code=500)
    
# @user_router.post("/login")
# async def user_login_api(req: signupOrLoginReq):
#     try: 
#         args = {
#             "username" : req.username,
#             "email" : req.email,
#             "password" : req.password
#         }
        
        
        
#         return 
#     except Exception: 
#         logger.exception("[user_router | user_login_api] :: caught exception")
#         raise HTTPException(status_code=500)
    
@user_router.get("/profile")
async def get_user_profile_api(request: Request):
    try: 
        user_token = request.state.bearer_token or None
        
        result = get_user_profile(user_token)
                
        return result 
    except Exception: 
        logger.exception("[user_router | get_user_profile_api] :: caught exception")
        raise HTTPException(status_code=500)

@user_router.post("/referral/link")
async def link_users_referral_code_api(request: Request, req: dict): 
    try: 
        user_token = request.state.bearer_token
        to_refer_code = req.get("referralCode", None)
        
        if not to_refer_code: 
            raise HTTPException(status_code=400)
        
        result = link_referral_code(user_token, to_refer_code)
        
        return result
    except Exception:
        logger.exception("[user_router | link_users_referral_code] :: caught exception")
        raise HTTPException(status_code=500)
        
@user_router.get("/referral/all")
async def get_all_referred_users_api(request : Request):
    try: 
        user_token = request.state.bearer_token
        
        result = get_all_referred_users(user_token)
        
        return result 
    except Exception: 
        logger.exception("[user_router | gert_all_referred_users_api] :: caught exception")
        raise HTTPException(status_code=500)            