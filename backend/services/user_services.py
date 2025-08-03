import uuid
from models.organisations import Organisation
from models.users import User, userRoleEnum
from utils.datetime_helper import StandardDT
from typing import Dict, Optional
from models.base import get_db_session
from utils.auth_helper import get_hashed_password
import time
import random
import string
import hashlib

import logging
logger = logging.getLogger(__name__)

def generate_unique_referral_code(email: str, name: str) -> str:
    """
    Generate a unique reference ID using email, name, current timestamp, and random characters.
    """
    timestamp = str(int(time.time() * 1000))
    random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
    base_str = f"{email}-{name}-{timestamp}-{random_str}"
    # Optionally hash for fixed length and obscurity
    ref_id = hashlib.sha256(base_str.encode()).hexdigest()[:10]
    return ref_id

def create_or_get_user(user_data: Dict):
    """
    Create a new user in the database
    
    Args:
        db (Session): Database session
        user_data (Dict): Dictionary containing username and email
        
    Returns:
        Optional[User]: Created user object or None if creation fails
    """
    try:
        logger.info("[user_services | create_or_get_user] :: Called with email=%s, google_id=%s", user_data.get("email"), user_data.get("user_google_id"))

        user_google_id = user_data["user_google_id"]
        user_email = user_data["email"]
        user_name = user_data["username"]

        uuid_craft_key = user_email + user_google_id
        user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, uuid_craft_key))
        logger.info("[user_services | create_or_get_user] :: Generated user_uuid=%s", user_uuid)

        auth_data = {
            "hashed_password": get_hashed_password(user_uuid)
        }

        user_response_details = {}
        response_data = {}

        this_user_refcode = generate_unique_referral_code(user_email, user_name)
        signup_time = StandardDT.get_iso_dt()

        with get_db_session() as db:
            user_already_exists = db.query(User).filter(
                (User.uuid == user_uuid) | (User.email == user_email) | (User.username == user_name)
            ).first()

            if not user_already_exists:
                logger.info("[user_services | create_or_get_user] :: Creating new user: %s", user_email)
                new_user = User(
                    username=user_name,
                    email=user_email,
                    uuid=user_uuid,
                    auth_data=auth_data,
                    created_at=signup_time,
                    last_login=signup_time,
                    is_active=True,
                    is_deleted=False,
                    credits=int(20),
                    referral_code=this_user_refcode,
                    role=userRoleEnum.USER.value
                )
                db.add(new_user)
                db.commit()
                user_response_details = {
                    "id": user_uuid,
                    "name": new_user.username,
                    "email": new_user.email,
                    "credits": new_user.credits,
                    "role": new_user.role
                }
                response_data["userId"] = user_uuid
                response_data["user"] = user_response_details
                logger.info("[user_services | create_or_get_user] :: New user created and committed: %s", user_email)
            else:
                if not user_already_exists.referral_code:
                    user_already_exists.referral_code = this_user_refcode
                user_already_exists.last_login = signup_time
                db.commit()
                user_response_details = {
                    "id": user_already_exists.uuid,
                    "name": user_already_exists.username,
                    "email": user_already_exists.email,
                    "credits": user_already_exists.credits,
                    "role": user_already_exists.role or userRoleEnum.USER.value
                }
                response_data["userId"] = user_already_exists.uuid
                response_data["user"] = user_response_details
                logger.info("[user_services | create_or_get_user] :: Existing user found and updated: %s", user_email)

        logger.info("[user_services | create_or_get_user] :: Returning response for userId=%s", user_uuid)
        return response_data

    except Exception as e:
        logger.exception("[user_services | create_or_get_user] :: Exception occurred: %s", str(e))
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
            
            org_id = existing_user_data.org_id or None
            org_name = None
            if org_id:
                org_data = db.query(Organisation).filter(Organisation.id == org_id).first()
                org_name = org_data.name
            
            # craft the response first before updating the last login again 
            user_response_details = {
                "id" : user_uuid,
                "name" : existing_user_data.username,
                "email" : existing_user_data.email,
                "credits" : existing_user_data.credits,
                "role" : existing_user_data.role or userRoleEnum.USER.value,
                "referralCode" : existing_user_data.referral_code,
                "referredCode" : existing_user_data.referral_code,
                "createdAt" : existing_user_data.created_at,
                "lastLoginAt" : existing_user_data.last_login,
                "orgId" : org_id,
                "orgName": org_name
            }
            
            response_data["user"] = user_response_details
            existing_user_data.last_login = StandardDT.get_iso_dt()
            db.commit()
             
        return response_data
    
    except Exception as e:
        raise e

def link_referral_code(user_uuid: str, to_refer_code: str):
    try:
        
        response_data = {}
        with get_db_session() as db:
            existing_user_data = db.query(User).filter(User.uuid == user_uuid).first() 
            
            if not existing_user_data: 
                raise ValueError()
            
            if not existing_user_data.referred_code:
                existing_user_data.referred_code = to_refer_code
                response_data = {"message" : "Success"}
                db.commit()
            else: 
                # considering a referral code already was linked
                if not existing_user_data.referral_code == to_refer_code:
                    response_data = {"message" : "A referral code was already linked to this account, cannot add a new one"}
                else: 
                    response_data = {"message" : "Success"}
             
        return response_data
    
    except Exception as e:
        raise e
    
def get_all_referred_users(user_uuid: str):
    try: 
        
        response_data = {} 
        with get_db_session() as db: 
            this_user = db.query(User).filter(User.uuid == user_uuid).first()
            
            this_user_referral_code = this_user.referral_code
            
            all_referred_users = db.query(User).filter(User.referred_code == this_user_referral_code).all()
            
            response_data = {
                "code" : this_user_referral_code,
                "totalReferrals" : len(all_referred_users) or 0,
                "totalEarnings" : 0,
                "referrals" : [
                    {
                        "email" : referred_user.email,
                        "createdAt" : referred_user.created_at
                    } 
                    
                    for referred_user in all_referred_users
                ]
            }
            
        return response_data
    
    except Exception: 
        raise
