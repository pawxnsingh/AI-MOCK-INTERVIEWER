from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers.media_router import media_api_router
from routers.parser_router import parser_api_router
from routers.agent_management_router import agent_management_router
from routers.user_router import user_router
from routers.workflow_router import workflow_router
from routers.test_router import test_router
from routers.platform_router import platform_router
import logging
import sys
# from utils.auth_helper import AuthenticationMiddleware
from routers.auth_router2 import auth_router
from utils.path_helpers import get_log_path
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from routers.payment_router import payment_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(get_log_path('backend.log')),
        logging.StreamHandler(sys.stdout)
    ]
)

class BearerTokenMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # skippin for auth 
        if request.url.path.startswith("/auth"):
            return await call_next(request)
        
        if request.url.path.startswith("/api/platform/chat/completions"):
            return await call_next(request)
        
        if request.url.path.startswith("/api/webhook"):
            return await call_next(request)

        # todo :: re add the jwt token 
        # extract Authorization header for all other api endpoints 
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            request.state.bearer_token = token  # attach token to request state
        else:
            request.state.bearer_token = None 
            print("no auth token")

        response = await call_next(request)
        return response

app = FastAPI()

exclude_paths = ["/login", "/register"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(AuthenticationMiddleware, exclude_paths=exclude_paths)
app.add_middleware(SessionMiddleware, secret_key='!secret') # todo :: setup in env but not used anywhere currently so less priority

app.add_middleware(BearerTokenMiddleware)

@app.middleware("http")
async def log_requests(req: Request, call_next):
    logging.info("[api hit] :: method = %s , route = %s", req.method, req.url)
    res = await call_next(req)
    return res

app.include_router(media_api_router, prefix="/api")
app.include_router(parser_api_router, prefix="/api")
app.include_router(agent_management_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(workflow_router, prefix="/api")
app.include_router(test_router, prefix="/api")
app.include_router(platform_router, prefix="/api")
app.include_router(auth_router)#, prefix="/api")
app.include_router(payment_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"system" : "Backend" , "status": "Running"}