from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse
from authlib.integrations.starlette_client import OAuth
from services.user_services import create_or_get_user
from config import config

import logging
logger = logging.getLogger(__name__)

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
    logger.info("[auth_router | /login] :: Called. Query params: %s", dict(request.query_params))
    redirect_uri = config.GOOGLE_LOGIN_REDIRECT_URL #GOOGLE_REDIRECT_URI
    logger.info("[auth_router | /login] :: Redirecting to Google OAuth with redirect_uri=%s", redirect_uri)
    return await oauth.google.authorize_redirect(request, redirect_uri)


@auth_router.get('/')
async def auth(request: Request):
    logger.info("[auth_router | /auth/] :: Called. Query params: %s", dict(request.query_params))
    try:
        logger.info("[auth_router | /auth/] :: Attempting to exchange code for token...")
        token = await oauth.google.authorize_access_token(request)
        logger.info("[auth_router | /auth/] :: Token exchange successful. Token keys: %s", list(token.keys()) if token else None)

        logger.info("[auth_router | /auth/] :: Fetching user info from Google...")
        user_details = await oauth.google.userinfo(token=token)
        logger.info("[auth_router | /auth/] :: User info fetched: email=%s, sub=%s, name=%s", user_details.get("email"), user_details.get("sub"), user_details.get("name"))

        user_google_id = user_details["sub"]
        user_email = user_details["email"]
        user_name = user_details["name"]
        args = {
            "username": user_name,
            "email": user_email,
            "user_google_id": user_google_id
        }

        logger.info("[auth_router | /auth/] :: Calling create_or_get_user with email=%s, google_id=%s", user_email, user_google_id)
        result = create_or_get_user(args)
        logger.info("[auth_router | /auth/] :: User creation/retrieval successful. userId=%s", result.get("userId"))

        redirect_url = f"{config.GOOGLE_POST_AUTH_REDIRECT_URL}?token={result['userId']}"
        logger.info("[auth_router | /auth/] :: Redirecting to: %s", redirect_url)
        return RedirectResponse(url=redirect_url)
    except Exception as e:
        logger.exception("[auth_router | /auth/] :: Exception occurred: %s", str(e))
        redirect_url = f"{config.GOOGLE_POST_AUTH_REDIRECT_URL}?error=auth_failed"
        return RedirectResponse(url=redirect_url)
