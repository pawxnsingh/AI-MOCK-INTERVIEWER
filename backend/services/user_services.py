import uuid
from models.users import User
from utils.datetime_helper import StandardDT
from typing import Dict, Optional
from models.base import get_db_session
from utils.auth_helper import get_hashed_password

def create_or_get_user(user_data: Dict) -> Optional[User]:
    """
    Create a new user in the database
    
    Args:
        db (Session): Database session
        user_data (Dict): Dictionary containing username and email
        
    Returns:
        Optional[User]: Created user object or None if creation fails
    """
    try:
        
        # {
        # "username" : user_name,
        # "email" : user_email, 
        # "user_auth_domain" : user_auth_domain,
        # "user_google_id" : user_google_id
        # }
        
        user_google_id = user_data["user_google_id"]
        user_email = user_data["email"]
        
        uuid_craft_key = user_email + user_google_id
        user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, uuid_craft_key))
        
        auth_data = {
            "hashed_password" : get_hashed_password(user_uuid)
        }
        
        user_response_details = {}
        response_data = {
            "userId" : user_uuid # todo :: replace with jwt token later
        }
        
        new_user = User(
            username=user_data["username"],
            email=user_data["email"],
            uuid=user_uuid,
            auth_data=auth_data,
            created_at=StandardDT.get_iso_dt(),
            last_login=StandardDT.get_iso_dt(),
            is_active=True,
            is_deleted=False,
            credits=int(20)
        )
        
        with get_db_session() as db:
            user_already_exists = db.query(User).filter(User.uuid == user_uuid).first() 
            
            if not user_already_exists:
                user_response_details = {
                    "id" : user_uuid,
                    "name" : new_user.username,
                    "email" : new_user.email,
                    "credits" : new_user.credits,
                    "role" : "user"
                }
                response_data["user"] = user_response_details
                db.add(new_user)
                db.commit()
            else: 
                 # log user already exists 
                 user_response_details = {
                     "id" : user_uuid,
                     "name" : user_already_exists.username,
                     "email" : user_already_exists.email,
                     "credits" : user_already_exists.credits,
                     "role" : "user"
                 }
                 
                 response_data["user"] = user_response_details
                 
                 pass     
             
        return response_data
    
    except Exception as e:
        raise e


def get_user_profile(user_uuid: str):
    try:
                
        user_response_details = {}
        response_data = {
            "userId" : user_uuid # todo :: replace with jwt token later
        }
        
        
        with get_db_session() as db:
            existing_user_data = db.query(User).filter(User.uuid == user_uuid).first() 
            
            if not existing_user_data: 
                raise ValueError()
            
            user_response_details = {
                "id" : user_uuid,
                "name" : existing_user_data.username,
                "email" : existing_user_data.email,
                "credits" : existing_user_data.credits,
                "role" : "user"
            }
            
            response_data["user"] = user_response_details
            
            pass     

             
        return response_data
    
    except Exception as e:
        raise e