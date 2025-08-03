from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers.agent_management_router import agent_management_router
from routers.user_router import user_router
from routers.platform_router import platform_router
from routers.ent_router import ent_router
import logging
import sys
# from utils.auth_helper import AuthenticationMiddleware
from routers.auth_router import auth_router
from routers.admin_router import router as admin_router
from utils.path_helpers import get_log_path
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from routers.payment_router import payment_router
from config import config

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

        response = await call_next(request)
        return response

app = FastAPI()

exclude_paths = ["/login", "/register"]

allowed_origins = []
allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
allow_headers=["Authorization", "Content-Type", "Accept", "Origin"]

if config.ENVIRONMENT == "development":
    allowed_origins.append("*")   
elif config.ENVIRONMENT == "production":
    allowed_origins.extend([
        "https://juggy.ai", 
        "https://www.juggy.ai",
        "http://localhost:3000"])
elif config.ENVIRONMENT == "staging":
    allowed_origins.extend([
        "https://test.juggy.ai", 
        "https://www.test.juggy.ai",
        "http://localhost:3000"])
elif config.ENVIRONMENT == "entprise":
    allowed_origins.extend([
        "https://recruiter.juggy.ai", 
        "https://www.recruiter.juggy.ai",
        "http://localhost:3000"])


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=allow_methods,
    allow_headers=allow_headers,
)
# app.add_middleware(AuthenticationMiddleware, exclude_paths=exclude_paths)
app.add_middleware(SessionMiddleware, secret_key='!secret') # todo :: setup in env but not used anywhere currently so less priority

app.add_middleware(BearerTokenMiddleware)

@app.middleware("http")
async def log_requests(req: Request, call_next):
    logging.info("[api hit] :: method = %s , route = %s", req.method, req.url)
    res = await call_next(req)
    return res

app.include_router(agent_management_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(platform_router, prefix="/api")
app.include_router(auth_router)#, prefix="/api")
app.include_router(payment_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(ent_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"system" : "Backend" , "status": "Running", "environment" : config.ENVIRONMENT }