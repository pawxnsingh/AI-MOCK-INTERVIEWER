import uuid
import requests
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, func, cast, Integer, and_
from models.users import User, userRoleEnum
from models.sessions import Session as SessionModel
from models.payments import Payments
from typing import Optional, Dict, Any
from datetime import datetime
import logging
from models.agents import Agent, AGENT_NAME_SEPARATOR
from models.organisations import Organisation
from services.agent_management_services import AgentManagementServices
from config import config
logger = logging.getLogger(__name__)

api_headers = {
    "Authorization" : f"Token token={config.TEAM_TAILER_API_KEY}",
    "X-Api-Version": config.TEAMTAILOR_API_VERSION 
}

def extract_all_jobs(data, current_page=1):
    if not data or not isinstance(data, dict) or not data.get("data"):
        return {
            "jobs": [],
            "total": 0,
            "limit": 0,
            "currentPage": current_page,
            "pageCount": 0
        }

    jobs = []
    for item in data["data"]:
        job_id = item.get("id")
        attributes = item.get("attributes", {})
        title = attributes.get("title")
        body = attributes.get("body")
        created_at = attributes.get("created-at")
        updated_at = attributes.get("updated-at")
        recruiter_email = attributes.get("recruiter-email")
        
        if job_id and title and body:
            jobs.append({
                "jobId": job_id,
                "title": title,
                "description": body,
                "createdAt" : created_at,
                "updatedAt" : updated_at,
                "recruiterEmail" : recruiter_email
            })
    
    meta = data.get("meta", {})
    total_records = meta.get("record-count", len(jobs))
    page_count = meta.get("page-count", 1)
            
    result = {
        "jobs" : jobs,
        "total" : total_records,
        "limit" : len(jobs),
        "currentPage": current_page,
        "pageCount": page_count
    }
        
    return result
class AdminService:
    
    @staticmethod
    def update_or_create_agent(db: Session, name: str, version: str, prompt: dict, llmConfig: dict, org_id: int):
       
        standardized_agent_name = f"{name}{AGENT_NAME_SEPARATOR}{version}"
        existing_agent = db.query(Agent).filter(Agent.name == standardized_agent_name).first()
        
        if existing_agent:
            
            existing_agent.prompt = prompt
            existing_agent.config = llmConfig
            existing_agent.org_id = org_id
            db.commit()
            db.refresh(existing_agent)
            return existing_agent, "updated"
        else:
            
            agent_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name=standardized_agent_name))
            new_agent = Agent(
                name=standardized_agent_name,
                uuid=agent_uuid,
                prompt=prompt,
                config=llmConfig,
                is_active=False,
                org_id=org_id
            )
            db.add(new_agent)
            db.commit()
            db.refresh(new_agent)
            return new_agent, "created"
        
    @staticmethod
    def update_or_create_agent_for_org(db: Session, org_id: int, name: str, version: str, prompt: dict, llmConfig: dict):
        
        if name != "interview_agent" or name != "interview_analysis_agent":
            raise Exception("only 'interview_agent' and 'interview_analysis_agent' are allowed names")
        
        org_data = db.query(Organisation).filter(Organisation.id == org_id).first()
        modified_name = f"{org_data.name}_{name}"
       
        standardized_agent_name = f"{modified_name}{AGENT_NAME_SEPARATOR}{version}"
        agent_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name=standardized_agent_name))
        
        existing_agent = db.query(Agent).filter(Agent.name == standardized_agent_name, Agent.org_id == org_id).first()
        if existing_agent:
            existing_agent.prompt = prompt
            existing_agent.config = llmConfig
            db.commit()
            db.refresh(existing_agent)
            return existing_agent, "updated"
       
        global_agent = db.query(Agent).filter(Agent.name == standardized_agent_name).first()
        
        if global_agent:
            raise Exception("Agent name and version must be globally unique")
       
        new_agent = Agent(
            name=standardized_agent_name,
            uuid=agent_uuid,
            prompt=prompt,
            config=llmConfig,
            is_active=False,
            org_id=org_id
        )
        db.add(new_agent)
        db.commit()
        db.refresh(new_agent)
        
        return new_agent, "created"
    
    @staticmethod
    def get_agents_of_org(db: Session, org_id: int, page: int = 1, limit: int = 10, job_id: int = None):
        
        query = db.query(Agent).filter(Agent.org_id == org_id)
        total = query.count()
        
        agents = query.order_by(Agent.created_at.desc()).offset((page - 1) * limit).limit(limit).all() if not job_id else query.order_by(Agent.created_at.desc()).all()
        
        org_data = db.query(Organisation).filter(Organisation.id == org_id).first()
        agent_list = []
        
        for agent in agents:
            if not agent:
                continue
            name_parts = agent.name.split(AGENT_NAME_SEPARATOR)
            
            org_job_id = name_parts[0].split("_")[1]
             
            if not job_id:
                agent_list.append({
                    "id": agent.uuid,
                    "name": name_parts[0],
                    "version": name_parts[1] if len(name_parts) > 1 else "",
                    "prompt": agent.prompt,
                    # "config": agent.config,
                    "isActive": agent.is_active,
                    "createdAt": agent.created_at,
                    "updatedAt": agent.updated_at,
                    "orgId": agent.org_id,
                    "orgName" : org_data.name
                })
            else: 
                if int(job_id) == int(org_job_id):
                    agent_list.append({
                        "id": agent.uuid,
                        "name": name_parts[0],
                        "version": name_parts[1] if len(name_parts) > 1 else "",
                        "prompt": agent.prompt,
                        # "config": agent.config,
                        "isActive": agent.is_active,
                        "createdAt": agent.created_at,
                        "updatedAt": agent.updated_at,
                        "orgId": agent.org_id,
                        "orgName" : org_data.name
                    })  
                 
            
        return {
            "total": total,
            "currentPage": page,
            "limit" : 10,
            "agents": agent_list
        }
        
    @staticmethod
    def get_external_users_of_org(db: Session, org_id: int, page: int = 1, limit: int = 10):
        
        query = db.query(User).filter(User.org_id == org_id, User.is_deleted == False)
        total = query.count()
        users = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        
        return {
            "total": total,
            "currentPage": page,
            "limit" : 10,
            "users": [{
                "id" : user.uuid,
                "name" : user.username,
                "email" : user.email,
                "credits" : user.credits,
                "role" : user.role,
                "referralCode" : user.referral_code,
                "referredCode" : user.referral_code,
                "createdAt" : user.created_at,
                "lastLoginAt" : user.last_login
            } 
                      
            for user in users]
        }
        
    @staticmethod
    def create_external_user(db: Session, username: str, email: str, org_name: str):

        org_data = db.query(Organisation).filter(Organisation.name == org_name.lower().strip()).first()
        
        if not org_data:
            raise Exception("Organisation not found")

        existing = db.query(User).filter(User.email == email).first()
        
        if existing:
            existing.org_id=org_data.id
            existing.role = userRoleEnum.EXTERNAL.value
            db.commit()
            db.refresh(existing)
            return existing
        
        else:
            uuid_craft_key = f"{email}-{org_data.name}"
            
            user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, uuid_craft_key))
            
            user = User(
                username=username,
                email=email,
                # phone=phone,
                uuid=user_uuid,
                role=userRoleEnum.EXTERNAL.value,
                org_id=org_data.id,
                is_active=True,
                is_deleted=False,
                credits=int(20),
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
    
    @staticmethod
    def create_recruiter(db: Session, username: str, email: str, org_id: int):
        org_data = db.query(Organisation).filter(Organisation.id == org_id).first()
        if not org_data:
            raise Exception("Organisation not found")

        existing = db.query(User).filter(User.email == email).first()
        
        if existing:
            existing.org_id = org_data.id
            existing.role = userRoleEnum.RECRUITER.value
            db.commit()
            db.refresh(existing)
            return existing
        else:
            uuid_craft_key = f"{email}-{org_data.name}-recruiter"
            user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, uuid_craft_key))
            
            user = User(
                username=username,
                email=email,
                uuid=user_uuid,
                role=userRoleEnum.RECRUITER.value,
                org_id=org_data.id,
                is_active=True,
                is_deleted=False,
                credits=int(20),
            )
            
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        
    
    @staticmethod
    def get_all_organisations(db: Session, page: int = 1, limit: int = 10):
        
        query = db.query(Organisation)
        total = query.count()
        organisations = query.order_by(Organisation.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        
        return {
            "total": total,
            "currentPage": page,
            "limit": limit,
            "organisations": [{
                "id" : org.id,
                "name" : org.name,
                "createdAt" : org.created_at,
                "updatedAt" : org.updated_at
                } for org in organisations]
        }

    @staticmethod
    def create_organisation(db: Session, name: str, api_key: str, created_by: int, ats: str):

        standardized_org_name = name.lower().strip()
        existing = db.query(Organisation).filter(Organisation.name == standardized_org_name).first()
        
        if existing:
            raise Exception("Organisation name already exists")
        
        
        org = Organisation(
            name=standardized_org_name,
            api_key=api_key,
            created_by=created_by,
            ats=ats
        )
        
        
        db.add(org)
        db.commit()
        db.refresh(org)
        
        all_jobs = []
        page = 1
        
        while True:
            get_jobs_url = f"https://api.teamtailor.com/v1/jobs?page%5Bnumber%5D={page}&page%5Bsize%5D=10"
            resp = requests.get(get_jobs_url, timeout=10, headers=api_headers)
            if resp.status_code != 200:
                logger.error(f"[create_organisation] Failed to fetch jobs from page {page}: {resp.text}")
                break
                
            data = resp.json()
            jobs_res = extract_all_jobs(data, current_page=page)
            page_jobs = jobs_res.get("jobs", [])
            
            if not page_jobs:
                break
                
            all_jobs.extend(page_jobs)
            
            page_count = jobs_res.get("pageCount", 1)
            if page >= page_count:
                break
                
            page += 1
        
        for job in all_jobs:
            
            job_id = job.get("jobId")
            job_title = job.get("title")
            
            
            default_interview_agent_prompt = f"""
            You are an expert interviewer interviewing for {job_title}. Your goal is to conduct interviews to select the best candidate for the position. 
            You will have access to the previous conversation history at all times to move forward with the interview on each conversation exchange. 
            The candidate might give a partial answer or might ask followup question, now based on these you should intelligently walk the candidate through the currently asked question based on their followup question or partial answer on how to proceed from here onward just like an expert interviewer but always sticking to the topic. You need to keep the interview engaging and not boring. Your tone should be friendly and mentoring. 

            #### INTERVIEW GUIDE TO FOLLOW: 
            1. start the interview by confirming the answers to the preliminary questions. If the answers are present, ask follow-up questions for each preliminary question to ensure that the candidate has genuinely answered the preliminary questions by themselves and not with the help of AI. If no answers are found but the questions are present then ask answers for these questions first. In case there are no preliminary questions at all then skip to 2. 
            2. Once the preliminary questions and answers are sorted, start the actual interview for the given job description and ask questions based on the candidates resume. 
            3. keep track of the interview time. Make sure to close an interview within 30 minutes to at most 40 minutes. 
            4. when the interview reaches an elapsed time of 25 minutes remind the candidate of the short time left and instead of asking new questions, try to close the interview in a polite manner.  

            #### Note: always try to answer back in short and precise sentences of at most 2 sentences and move on to the next question as soon as you get a good enough answer. Try to close a question within 3 to 4 exchanges and move to the next question.
            """

            default_interview_analysis_agent_prompt = """
            You are an expert interview performance analyst. Your task is to analyze the provided interview interaction and generate a report on the candidate's performance. 

            Report generation guidelines:

            1. Score the candidate based on their confidence when they answered the preliminary questions. The score should be a number below 10, 10 being the highest number.
            2. Give a detailed analysis of why you gave this score.

            NOTE :: Only return the finally analysed report as a small description directly as your response. Dont return anything else. 
            """            
            
            interview_agent_args ={
                "name" : f"{standardized_org_name}_{job_id}_interview_agent",
                "version" : "1.0.0",
                "prompt" : default_interview_agent_prompt,
                "org_id" : org.id
            } 
            
            interview_analysis_agent_args = {
                "name" : f"{standardized_org_name}_{job_id}_interview_analysis_agent",
                "version" : "1.0.0",
                "prompt" : default_interview_analysis_agent_prompt,
                "org_id" : org.id
            }
            
            try:
                AgentManagementServices.create_agent(interview_agent_args)
            except Exception:
                logger.exception("[AdminService.create_organisation] :: failed to create interview agent")
            
            try: 
                AgentManagementServices.create_agent(interview_analysis_agent_args)
            except Exception:
                logger.exception("[AdminService.create_organisation] :: failed to create interview analysis agent")
        
        
        return {
            "id" : org.id, 
            "name" : org.name,
            "createdAt" : org.created_at,
            "updatedAt" : org.updated_at
        }
    
    @staticmethod
    def get_all_users(
        db: Session, 
        page: int = 1, 
        limit: int = 20, 
        sort_by: str = "last_login",
        start_time: Optional[datetime] = None, 
        end_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        try:
            query = db.query(User).filter(User.is_deleted == False)

            if sort_by == "created_at":
                filter_column = User.created_at
                sort_column = User.created_at
            else:
                filter_column = User.last_login
                sort_column = User.last_login
            
            if start_time:
                query = query.filter(filter_column >= start_time)
            if end_time:
                query = query.filter(filter_column <= end_time)

            total = query.count()
            
            users = query.order_by(desc(sort_column)).offset((page - 1) * limit).limit(limit).all()
            
            return {
                "total": total, 
                "currentPage": page, 
                "limit": limit, 
                "users": users
            }
            
        except Exception as e:
            logger.exception(f"[AdminService.get_all_users] :: Error retrieving users: {str(e)}")
            raise

    @staticmethod
    def get_user_by_identifier(db: Session, identifier: str) -> Optional[User]:
        try:
            return db.query(User).filter(
                and_(
                    or_(User.username == identifier, User.email == identifier),
                    User.is_deleted == False
                )
            ).first()
            
        except Exception as e:
            logger.exception(f"[AdminService.get_user_by_identifier] :: Error retrieving user: {str(e)}")
            raise

    @staticmethod
    def get_user_sessions(db: Session, user_uuid: str) -> Optional[User]:
        try:
            return db.query(User).options(
                joinedload(User.sessions).joinedload(SessionModel.exchanges)
            ).filter(
                and_(
                    User.uuid == user_uuid,
                    User.is_deleted == False
                )
            ).first()
            
        except Exception as e:
            logger.exception(f"[AdminService.get_user_sessions] :: Error retrieving user sessions: {str(e)}")
            raise

    @staticmethod
    def get_user_payments(db: Session, user_uuid: str) -> Optional[User]:
        try:
            return db.query(User).options(
                joinedload(User.payments)
            ).filter(
                and_(
                    User.uuid == user_uuid,
                    User.is_deleted == False
                )
            ).first()
            
        except Exception as e:
            logger.exception(f"[AdminService.get_user_payments] :: Error retrieving user payments: {str(e)}")
            raise

    @staticmethod
    def get_payment_totals(db: Session) -> Dict[str, float]:
        try:

            pending_subquery = db.query(
                func.sum(
                    cast(
                        func.json_extract(Payments.payment_details, '$.amount'), 
                        Integer
                    )
                )
            ).filter(
                func.json_extract(Payments.payment_details, '$.status') == 'PENDING'
            ).scalar()
            
            completed_subquery = db.query(
                func.sum(
                    cast(
                        func.json_extract(Payments.payment_details, '$.amount'), 
                        Integer
                    )
                )
            ).filter(
                func.json_extract(Payments.payment_details, '$.status') == 'COMPLETED'
            ).scalar()
            
            pending_total = float(pending_subquery or 0)
            completed_total = float(completed_subquery or 0)
            
            return {
                "total_amount_pending": pending_total,
                "total_amount_completed": completed_total
            }
            
        except Exception as e:
            logger.exception(f"[AdminService.get_payment_totals] :: Error calculating payment totals: {str(e)}")
            raise
