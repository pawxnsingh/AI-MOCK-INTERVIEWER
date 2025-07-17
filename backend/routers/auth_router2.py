from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
import os
from authlib.integrations.starlette_client import OAuth
from models.base import get_db_session
from models.users import User
from services.user_services import create_or_get_user
from config import config


# from utils.auth_helper import (
#     create_access_token,
#     create_refresh_token,
#     JWT_REFRESH_SECRET_KEY,
#     ALGORITHM,
# )

auth_router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)


oauth = OAuth()

oauth.register(
    name='google',
    client_id=config.GOOGLE_CLIENT_ID,
    client_secret=config.GOOGLE_CLIENT_SECRET, 
    access_token_url=config.GOOGLE_ACCESS_TOKEN_URL,
    authorize_url=config.GOOGLE_AUTHORIZE_URL,
    userinfo_endpoint=config.GOOGLE_USERINFO_ENDPOINT,
    server_metadata_url=config.GOOGLE_SERVER_METADATA_URL, 
    client_kwargs={
        "scope": "openid email profile"
    },
)

@auth_router.get('/login', tags=['authentication'])
async def login(request: Request):
    redirect_uri = config.GOOGLE_LOGIN_REDIRECT_URL #GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@auth_router.route('/')
async def auth(request: Request):

    token = await oauth.google.authorize_access_token(request)
    user_details = await oauth.google.userinfo(token=token)
    
    # user_auth_domain = user_details['hd'] # http://localhost:8000/auth, test.juggy.ai/auth, juggy.ai
    user_google_id = user_details["sub"]
    user_email = user_details["email"]
    user_name = user_details["name"]
    
    args = {
        "username" : user_name,
        "email" : user_email, 
        # "user_auth_domain" : user_auth_domain,
        "user_google_id" : user_google_id
    }
    
    result = create_or_get_user(args)
        
    return RedirectResponse(url=f"{config.GOOGLE_POST_AUTH_REDIRECT_URL}?token={result["userId"]}" )#f"http://localhost:3000/auth/success?token={result["userId"]}") #redirect_url) 


# todo :: setup logout logic in backend aswell 
# @auth_router.get('/logout', tags=['authentication']) 
# async def logout(request: Request):

#     return RedirectResponse(url='http://localhost:8000/health')

# @auth_router.get("/home")
# async def home(request: Request):
#     # user = {"name " : "tester", "email" : "sumukh@juggy.ai"}
#     # if user is not None:
#     #     email = user['email']
#     #     html = (
#     #         f'<pre>Email: {email}</pre><br>'
#     #         '<a href="/docs">documentation</a><br>'
#     #         '<a href="/logout">logout</a>'
#     #     )
#     #     return HTMLResponse(html)
#     return HTMLResponse('<a href="/login">login</a>')