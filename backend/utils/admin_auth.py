from fastapi import Request, HTTPException, status
from models.users import User
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from utils.auth_helper import JWT_SECRET_KEY, ALGORITHM

def get_user_from_token(request: Request, db: Session) -> User:
    token = request.state.bearer_token #request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    try:
        # payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_uuid: str = token #payload.get("sub")
        if not user_uuid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: sub not found")
        user = db.query(User).filter(User.uuid == user_uuid, User.is_deleted == False).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
