from passlib.context import CryptContext
import os
from datetime import datetime, timedelta
from typing import Union, Any
from jose import jwt
from utils.datetime_helper import StandardDT
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi import FastAPI, Request, HTTPException
from jose.exceptions import JWTError

ACCESS_TOKEN_EXPIRE_MINUTES = 300  # in minutes
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # days
ALGORITHM = "HS256"
JWT_SECRET_KEY = "321321" #os.environ['JWT_SECRET_KEY'] 
JWT_REFRESH_SECRET_KEY = "123123" #os.environ['JWT_REFRESH_SECRET_KEY']

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return password_context.hash(password)

def verify_password(password: str, hashed_pass: str) -> bool:
    return password_context.verify(password, hashed_pass)

def create_access_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    now = StandardDT.get_current_timestamp()
    if expires_delta is not None:
        exp = now + expires_delta
    else:
        exp = now + ACCESS_TOKEN_EXPIRE_MINUTES * 60  # convert minutes to seconds

    to_encode = {"exp": exp, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: int = None) -> str:
    now = StandardDT.get_current_timestamp()
    if expires_delta is not None:
        exp = now + expires_delta
    else:
        exp = now + REFRESH_TOKEN_EXPIRE_MINUTES * 60  # convert minutes to seconds

    to_encode = {"exp": exp, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, ALGORITHM)
    return encoded_jwt


class AuthenticationMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: FastAPI,
        exclude_paths: list[str] = None # paths to exclude from authentication
    ):
        super().__init__(app)
        self.exclude_paths = exclude_paths or []

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ):
        if request.url.path in self.exclude_paths:
            return await call_next(request)

        token = request.headers.get("Authorization")
        if not token:
            raise HTTPException(status_code=401, detail="Missing token")

        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token: sub not found")
            # Attach user_id to the request state for further use in the route
            request.state.user_id = user_id
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

        response = await call_next(request)
        return response
    
if __name__ == "__main__": 
    r1 = get_hashed_password("abc123")
    print("hash : ", r1)
    r2 = verify_password("abc", r1)
    print("is verified : ", r2)
    r2 = verify_password("abc123", r1)
    print("is verified : ", r2)
    
    r3 = create_access_token(r1)
    print("access token :: ", r3)
    
    r4 = create_refresh_token(r1)
    print("refresh token :: ", r4)
    