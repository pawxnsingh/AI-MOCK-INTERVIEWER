from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from services.user_services import create_or_get_user, get_user_profile
from pydantic import BaseModel
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
        print("bearer token :: ", user_token)
        
        result = get_user_profile(user_token)
        
        print("user profile :: ")
        print(result)
        
        return result 
    except Exception: 
        logger.exception("[user_router | get_user_profile_api] :: caught exception")
        raise HTTPException(status_code=500)
    