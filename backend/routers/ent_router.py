import requests
import tempfile
import os
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel
from models.agents import Agent
from models.organisations import Organisation
from models.session_exchanges import SessionExchange
from schemas.admin_schemas import AgentUpdateCreateRequest
from services.admin_service import AdminService
from services.agent_management_services import AgentManagementServices
from services.user_services import create_or_get_user
from services.media_service import MediaManagementService
from services.agent_services import AgentServices
from services.parser_service import ParserService
from models.base import get_db_session
from models.sessions import Session as SessionModel, SessionStatusEnum
from models.users import User
from models.uploads import Upload
from models.parsed_results import ParsedResult
from utils.admin_auth import get_user_from_token
from utils.db_helper import get_media_id_from_uuid
import uuid
import logging
import asyncio
from config import config
from sqlalchemy import func
from sqlalchemy.orm import Session

def get_db():
    """Dependency to get database session."""
    with get_db_session() as db:
        yield db

ent_router = APIRouter(prefix="/ent", tags=["enterprise"])
logger = logging.getLogger(__name__)

def ensure_job_agents_exist(jobs: list, org_id: int):
    """
    function to ensure interview_agent and interview_analysis_agent exist for each job.
    creates agents with is_active=True if they are missing.
    """
    try:
        with get_db_session() as db:
            org = db.query(Organisation).filter(Organisation.id == org_id).first()
            if not org:
                logger.warning(f"[ensure_job_agents_exist] No organisation found with id {org_id}, skipping agent creation")
                return
            
            standardized_org_name = org.name.lower().strip()
            
            for job in jobs:
                job_id = job.get("jobId")
                job_title = job.get("title", "")
                
                if not job_id:
                    continue
                
                interview_agent_name = f"{standardized_org_name}_{job_id}_interview_agent"
                analysis_agent_name = f"{standardized_org_name}_{job_id}_interview_analysis_agent"
                
                existing_interview_agent = db.query(Agent).filter(
                    Agent.name.like(f"{interview_agent_name}%"),
                    Agent.org_id == org.id,
                    Agent.is_active == True
                ).first()
                
                existing_analysis_agent = db.query(Agent).filter(
                    Agent.name.like(f"{analysis_agent_name}%"),
                    Agent.org_id == org.id,
                    Agent.is_active == True
                ).first()
                
                if not existing_interview_agent:
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
                    
                    interview_agent_args = {
                        "name": interview_agent_name,
                        "version": "1.0.0",
                        "prompt": default_interview_agent_prompt,
                        "org_id": org.id
                    }
                    
                    try:
                        AgentManagementServices.create_agent(interview_agent_args)
                        logger.info(f"[ensure_job_agents_exist] Created interview agent for job {job_id}")
                    except Exception:
                        logger.exception(f"[ensure_job_agents_exist] Failed to create interview agent for job {job_id}")
                
                if not existing_analysis_agent:
                    default_interview_analysis_agent_prompt = """
            You are an expert interview performance analyst. Your task is to analyze the provided interview interaction and generate a report on the candidate's performance. 

            Report generation guidelines:

            1. Score the candidate based on their confidence when they answered the preliminary questions. The score should be a number below 10, 10 being the highest number.
            2. Give a detailed analysis of why you gave this score.

            NOTE :: Only return the finally analysed report as a small description directly as your response. Dont return anything else. 
            """
                    
                    interview_analysis_agent_args = {
                        "name": analysis_agent_name,
                        "version": "1.0.0",
                        "prompt": default_interview_analysis_agent_prompt,
                        "org_id": org.id
                    }
                    
                    try:
                        AgentManagementServices.create_agent(interview_analysis_agent_args)
                        logger.info(f"[ensure_job_agents_exist] Created analysis agent for job {job_id}")
                    except Exception:
                        logger.exception(f"[ensure_job_agents_exist] Failed to create analysis agent for job {job_id}")
                        
    except Exception:
        logger.exception("[ensure_job_agents_exist] :: caught exception in background task")

def extract_all_jobs(data, current_page=1):
    if not data or not isinstance(data, dict) or not data.get("data"):
        return {
            "jobs": [],
            "total": 0,
            "limit": 10,
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
        "limit" : 10,
        "currentPage": current_page,
        "pageCount": page_count
    }
        
    return result

def extract_all_candidates(data, job_id, current_page=1):
    if not data or not isinstance(data, dict) or not data.get("data"):
        return {
            "jobs": [],
            "total": 0,
            "limit": 10,
            "currentPage": current_page,
            "pageCount": 0
        }

    candidates = []
    for item in data["data"]:
        candidate_id = item.get("id")
        attributes = item.get("attributes", {})
        email = attributes.get("email")
        first_name = attributes.get("first-name")
        created_at = attributes.get("created-at")
        updated_at = attributes.get("updated-at")
        
        if candidate_id and email and first_name:
            uuid_craft_key = email + job_id
            session_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, uuid_craft_key))  
             
            candidate_obj = {
                "candidateId": candidate_id,
                "candidateName": first_name,
                "candidateEmail": email,
                "createdAt" : created_at,
                "updatedAt" : updated_at,
                "sessionId" : session_uuid
            }
            
            
            with get_db_session() as db: 
                existing_session = db.query(SessionModel).filter(SessionModel.uuid == session_uuid).first()
                if existing_session and existing_session.status == "ANALYSED":
                    candidate_obj["interviewStatus"] = "ANALYSED"
                    candidate_obj["interviewReport"] = existing_session.summary
                    
                    call_id = existing_session.call_id
                    
                    try:
                        header = {
                            "Authorization" : f"Bearer {config.VAPI_PRIVATE_KEY}"
                        } 
                        vapi_res = requests.get(f"https://api.vapi.ai/call/{call_id}", headers=header)

                        parsed_res = vapi_res.json()
                        audio_link = parsed_res.get("recordingUrl")
                        
                        candidate_obj["recordingLink"] = audio_link
                    except Exception: 
                        logger.exception("[ent_router | extract_all_candidates] :: failed to get vapi call recording link, response = %s", vapi_res)
                        
            candidates.append(candidate_obj)
    
    meta = data.get("meta", {})
    total_records = meta.get("record-count", len(candidates))
    page_count = meta.get("page-count", 1)
            
    result = {
        "jobs" : candidates,
        "total" : total_records,
        "limit" : 10,
        "currentPage": current_page,
        "pageCount": page_count
    }
        
    return result


class EntSessionCreateRequest(BaseModel):
    email: str
    jobid: str
    
api_headers = {
    "Authorization" : f"Token token={config.TEAM_TAILER_API_KEY}",
    "X-Api-Version": config.TEAMTAILOR_API_VERSION 
}

def get_candidate_questions_and_answers(candidate_id, job_id):

    answers_url = f"https://api.teamtailor.com/v1/candidates/{candidate_id}/answers"
    answers_resp = requests.get(answers_url, headers=api_headers)
    answers_data = answers_resp.json().get("data", [])

    if answers_data:
        result = []
        for answer_obj in answers_data:
            answer_text = answer_obj["attributes"].get("answer", "")
            question_url = answer_obj["relationships"]["question"]["links"]["related"]
            question_resp = requests.get(question_url, headers=api_headers)
            question_data = question_resp.json().get("data", {})
            question_title = question_data.get("attributes", {}).get("title", "")
            result.append({
                "question": question_title,
                "answer": answer_text
            })
        return result

    questions_url = f"https://api.teamtailor.com/v1/jobs/{job_id}/questions"
    questions_resp = requests.get(questions_url, headers=api_headers)
    questions_data = questions_resp.json().get("data", [])

    if questions_data:
        return [
            {
                "question": q["attributes"].get("title", ""),
                "answer": ""
            }
            for q in questions_data
        ]

    return []
        
def get_job_description(job_data):
    try: 
        parsed_data = job_data.get("data", {"attributes": {}}).get("attributes")
        job_title = parsed_data.get("title", None)
        job_description = parsed_data.get("body", None)
        
        return job_title, job_description
    except Exception:
        logger.exception("[ent_router | get_job_description] :: caught exception")
        return None, None

def fetch_candidate_info(email,jobid):
    logger.info("calling fetch candidate info")
    candidate_api_url = f"https://api.teamtailor.com/v1/jobs/{jobid}/candidates?filter[email]={email}"
    try:

        resp = requests.get(candidate_api_url, timeout=10, headers=api_headers)
        if resp.status_code != 200:
            logger.error(f"[fetch_candidate_info] Failed: {resp.text}")
            raise HTTPException(status_code=502, detail="Failed to fetch candidate info from external API.")
        data = resp.json()
        obj = data.get("data", [])
        if len(obj) < 1:
            logger.error(f"[fetch_candidate_info] :: No data found on ats for the candidate email = {email} and jobid = {jobid}")
            raise HTTPException(status_code=400, detail=f"No data found on ats for the candidate email = {email} and jobid = {jobid}")
        
        pobj = obj[0]
        rdata = {
            "id" : pobj.get("id", None),
            "email" : pobj.get("attributes" , {}).get("email", None),
            "fname" : pobj.get("attributes" , {}).get("first-name", None),
            "lname" : pobj.get("attributes" , {}).get("last-name", None),
            "resume" : pobj.get("attributes" , {}).get("resume", None), 
        }
        username = rdata.get("fname")
        resume_url = rdata.get("resume")
        if not username or not resume_url:
            logger.error(f"[fetch_candidate_info] Missing username or resume link: {data}")
            raise HTTPException(status_code=400, detail="Candidate info incomplete: username or resume link missing.")
        return username, resume_url, rdata.get("id")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[fetch_candidate_info] Exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching candidate info.")

def download_candidate_resume(resume_url):
    try:
        resp = requests.get(resume_url, timeout=15)
        if resp.status_code != 200:
            logger.error(f"[download_resume] Failed: {resp.text}")
            raise HTTPException(status_code=502, detail="Failed to download candidate resume.")
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_file.write(resp.content)
            tmp_file_path = tmp_file.name
        resume_filename = resume_url.split(".pdf")[0].split("/")[-1] + ".pdf"
        return tmp_file_path, resume_filename
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[download_resume] Exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Error downloading candidate resume.")

def parse_candidate_resume(tmp_file_path, resume_filename, user_uuid):
    try:
        with open(tmp_file_path, "rb") as f:
            file_binary = f.read()
        is_exists, ingest_media_result = MediaManagementService.ingest_media(
            file_binary=file_binary,
            file_name=resume_filename,
            user_uuid=user_uuid,
            to_parse=True
        )
        media_uuid = ingest_media_result.get("mediaId")
        if not media_uuid:
            raise Exception("Media upload failed: No mediaId returned.")
        
        # If media already exists, return the media_uuid
        if is_exists:
            return media_uuid
        
        # Parse the document after media ingestion
        media_db_id = get_media_id_from_uuid(media_uuid)
        parsed_result = ParserService.parse_document(media_id=media_db_id, media_uuid=media_uuid)
        
        if parsed_result:
            logger.info("[parse_candidate_resume] :: media parsed and saved successfully, so deleting the hard copy")
            MediaManagementService.delete_media(media_uuid)
        
        return media_uuid
    except Exception as e:
        logger.exception(f"[parse_candidate_resume] Exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Error uploading and parsing candidate resume.")
    finally:
        try:
            os.remove(tmp_file_path)
        except Exception:
            pass

def fetch_job_info(jobid):
    job_api_url = f"https://api.teamtailor.com/v1/jobs/{jobid}" # for job description and tile 
    job_candidate_url = f"https://api.teamtailor.com/v1/jobs/{jobid}" # for candidate resume and any other context 
    job_questions_url = f"https://api.teamtailor.com/v1/jobs/{jobid}" # for the jobs questions if present 
    job_candidate_answers_url = f"https://api.teamtailor.com/v1/jobs/{jobid}" # for the candidate answers if present 
    
    
    try:
        resp = requests.get(job_api_url, timeout=10, headers=api_headers)
        if resp.status_code != 200:
            logger.error(f"[fetch_job_info] Failed: {resp.text}")
            raise HTTPException(status_code=502, detail="Failed to fetch job info from external API.")
        data = resp.json()
        print("job details data ::")
        pdata = data.get("data",{}).get("attributes",{})
        job_title = pdata.get("title")
        job_description = pdata.get("body")
        print("job title and job description :: ")
        print(job_title)
        print(job_description)
        if not job_title or not job_description:
            logger.error(f"[fetch_job_info] Missing job title or description: {data}")
            raise HTTPException(status_code=400, detail="Job info incomplete: title or description missing.")
        return job_title, job_description
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[fetch_job_info] Exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching job info.")

def fetch_contexts(jobid, candidateid):
    job_api_url = f"https://api.teamtailor.com/v1/jobs/{jobid}" # for job description and tile 
    job_candidate_questions_url = f"https://api.teamtailor.com/v1/candidates/{candidateid}/questions" # for the jobs questions if present 
    job_candidate_answers_url = f"https://api.teamtailor.com/v1/candidates/{candidateid}/answers" # for the candidate answers if present 
    
    try:
        resp = requests.get(job_api_url, timeout=10, headers=api_headers)
        if resp.status_code != 200:
            logger.error(f"[fetch_job_info] Failed: {resp.text}")
            raise HTTPException(status_code=502, detail="Failed to fetch job info from external API.")
        data = resp.json()
        
        job_title, job_description = get_job_description(data)
        
        qa_map = get_candidate_questions_and_answers(candidateid, jobid)
        
        res = {
            "job_title" : job_title,
            "job_description" : job_description,
            "job_preliminary_question_and_answer_list" : qa_map
        } 
        
        return res

        
    except Exception as e:
        logger.exception(f"[fetch_job_info] Exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching job info.")


def create_candidate_user_entity(username, email):
    try:
        user_args = {
            "username": username,
            "email": email,
            "user_google_id": email
        }
        user_result = create_or_get_user(user_args)
        user_uuid = user_result["userId"]
        with get_db_session() as db:
            user_obj = db.query(User).filter(User.uuid == user_uuid).first()
            user_id = user_obj.id
        return user_id, user_uuid
    except Exception as e:
        logger.exception(f"[get_or_create_user] Exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating or fetching user.")

def create_ent_session(user_id, session_uuid, session_context, session_metadata):
    try:
        with get_db_session() as db:
            existing_session = db.query(SessionModel).filter(SessionModel.uuid == session_uuid).first()
            if existing_session:
                logger.info(f"[create_ent_session] :: Session already exists with uuid: {session_uuid}")
                return False
            
            logger.info(f"[create_ent_session] :: Creating new session with uuid: {session_uuid}")
            new_session = SessionModel(
                user_id=user_id,
                uuid=session_uuid,
                contexts=session_context,
                session_metadata=session_metadata,
                status=SessionStatusEnum.CREATED.value
            )
            db.add(new_session)
            db.commit()
            
            media_uuid = session_context.get("selected_resume_media_uuid")
            if media_uuid:
                media_data = db.query(Upload).filter(Upload.uuid == media_uuid).first()
                if media_data:
                    parsing_metadata = media_data.parsing_metadata
                    
                    if parsing_metadata.get("parsing_status", "") == "COMPLETED":
                        media_db_id = get_media_id_from_uuid(media_uuid)
                        
                        parsed_results_data = db.query(ParsedResult).filter(ParsedResult.source_id == media_db_id).first()
                        
                        if parsed_results_data and not parsed_results_data.structured_result:
                            resume_structuring_agent_config = {
                                "name": "resume_structuring_agent",
                                "context": {
                                    "parsed_resume": parsed_results_data.raw_result
                                }
                            }
                            
                            structured_resume, llm_metadata = AgentServices.generic_agent(resume_structuring_agent_config)
                            
                            parsed_results_data.structured_result = structured_resume
                            db.commit()
                            
                            logger.info(f"[create_ent_session] :: structured resume generated and saved for media_uuid: {media_uuid}")
                        elif parsed_results_data:
                            logger.info(f"[create_ent_session] :: structured resume already exists for media_uuid: {media_uuid}")
                        else:
                            logger.warning(f"[create_ent_session] :: no parsed results found for media_uuid: {media_uuid}")
                    else:
                        logger.warning(f"[create_ent_session] :: media not yet parsed for media_uuid: {media_uuid}")
                else:
                    logger.warning(f"[create_ent_session] :: media data not found for media_uuid: {media_uuid}")
                    
        return True
                    
    except Exception as e:
        logger.exception(f"[create_ent_session] Exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating session.")

@ent_router.post("/session/create")
async def ent_session_create_api(req: EntSessionCreateRequest):
    """
    Create a new session for a candidate by fetching candidate and job info, uploading resume, and storing all context.
    """
    try: 
        email = req.email
        jobid = req.jobid
        # todo :: accept org name or org id aswell here so that this becomes multitenant and all users session is linked to an org aswell now 
        username, resume_download_url, candidate_id = fetch_candidate_info(email, jobid)

        user_id, user_uuid = create_candidate_user_entity(username, email)

        tmp_file_path, resume_filename = download_candidate_resume(resume_download_url)

        media_uuid = parse_candidate_resume(tmp_file_path, resume_filename, user_uuid)

        name_key = email + jobid

        session_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name_key))

        job_context = fetch_contexts(jobid, candidate_id)
        
        org_name = None
        with get_db_session() as db: 
            org_agent = db.query(Agent).filter(Agent.name.contains(str(jobid))).first()
            org_id = org_agent.org_id if org_agent else None
            if org_id: 
                org_data = db.query(Organisation).filter(Organisation.id == org_id).first()
                if org_data and org_data.name:
                    org_name = org_data.name

        session_context = {
            **job_context,
            "candidate_email": email,
            "candidate_username": username,
            "selected_resume_media_uuid": media_uuid,
            "job_id": jobid
        }

        session_metadata = {
            "email": email,
            "jobid": jobid,
            "candidate_id": candidate_id,
            "interview_agent" : f"{org_name}_{jobid}_interview_agent" if org_name else "ent_interview_agent",
            "analysis_agent" : f"{org_name}_{jobid}_interview_analysis_agent" if org_name else "ent_interview_analysis_agent"
            # todo :: add org name here or org id 
        }
        is_session_created = create_ent_session(user_id, session_uuid, session_context, session_metadata)
        
        if not is_session_created:
            logger.error(f"[ent_session_create_api] :: Session with uuid {session_uuid} already exists.")
            raise HTTPException(status_code=400, detail=f"Session with id {session_uuid} already exists.")
        
        return {"sessionId": session_uuid, "userToken": user_uuid }
    except HTTPException as e:
        logger.error(f"[ent_session_create_api] HTTPException: {str(e.detail)}")
        raise e
    except Exception as e:
        logger.exception(f"[ent_session_create_api] Exception: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating enterprise session.")
    
    
@ent_router.get("/jobs/get-all/{user_email}")
async def get_user_applied_jobs_api(user_email: str, res: Response, page: int = Query(1, ge=1, description="Page number for pagination")):
    try:
        candidate_id = ""
        application_id = ""
        get_user_details_url = f"https://api.teamtailor.com/v1/candidates?filter[email]={user_email}"
        get_user_job_applications_url = f"https://api.teamtailor.com/v1/candidates/{candidate_id}/job-applications"
        get_job_details_url = f"https://api.teamtailor.com/v1/job-applications/{application_id}/job"
        
        r1 = requests.get(get_user_details_url, timeout=10, headers=api_headers)

        d1 = r1.json()
        response_data = {"detail" : "No user found for the given email on ats"}
        pd1_raw = d1.get("data",[])
        if len(pd1_raw) == 0:
            res.status_code = 400
            logger.error("[ent_router | get_user_applied_jobs_api] :: No user found for the given email on ats")
            return response_data

        pd1 = pd1_raw[0].get("id",None)
    
        job_applications_url = f"https://api.teamtailor.com/v1/candidates/{pd1}/job-applications?page%5Bnumber%5D={page}&page%5Bsize%5D=10"
        r2 = requests.get(job_applications_url, headers=api_headers)
        d2 = r2.json()
        pd2 = [val.get("id",None) for val in d2.get("data",[])]
        
        job_data = []
        for jid in pd2:
            if not jid: 
                continue
            r3 = requests.get(f"https://api.teamtailor.com/v1/job-applications/{jid}/job", headers=api_headers)
            d3 = r3.json()
            pd3 = d3.get("data",{})
            job_data.append(pd3)
            
        
        modded_arg = {
            "data" : job_data,
            "meta" : d2.get("meta", {})
        }
            
        response_data = extract_all_jobs(modded_arg, current_page=page)
        
        return response_data
         
    except Exception: 
        logger.exception("[ent_router | get_user_applied_jobs_api] :: caught exception")
        raise HTTPException(status_code=500)
    
@ent_router.delete("/temp/session/{session_uuid}")
async def reset_session_for_test_api(session_uuid : str):
    try:
        with get_db_session() as db: 
            existing_session = db.query(SessionModel).filter(SessionModel.uuid == session_uuid).first()
            del_conv_count = db.query(SessionExchange).filter(SessionExchange.session_id == existing_session.id).delete()
            db.delete(existing_session)
            db.commit()
        
        return {"message" : f"deleted session = {session_uuid}"} 
    except Exception: 
        logger.exception("[ent_router | get_all_available_jobs_api] :: caught exception")
        raise HTTPException(status_code=500)
    
@ent_router.get("/jobs/get-all")
async def get_all_available_jobs_api(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db), page: int = Query(1, ge=1, description="Page number for pagination")):
    try: 
        get_jobs_url = f"https://api.teamtailor.com/v1/jobs?page%5Bnumber%5D={page}&page%5Bsize%5D=10"
        
        resp = requests.get(get_jobs_url, timeout=10, headers=api_headers)
        if resp.status_code != 200:
            logger.error(f"[get_all_available_jobs_api] Failed: {resp.text}")
            raise HTTPException(status_code=502, detail="Failed to fetch job info from external API.")
        data = resp.json() 
        result = extract_all_jobs(data, current_page=page)
        
        try:
            user = get_user_from_token(request, db)
            if user.org_id and result.get("jobs"):
                background_tasks.add_task(ensure_job_agents_exist, result["jobs"], user.org_id)
                logger.info(f"[get_all_available_jobs_api] Background task scheduled for org_id: {user.org_id}")
            else:
                logger.info("[get_all_available_jobs_api] User has no org_id, skipping background task")
        except Exception:
            logger.exception("[get_all_available_jobs_api] Failed to get user info, skipping background task")
        
        return result 
    except Exception: 
        logger.exception("[ent_router | get_all_available_jobs_api] :: caught exception")
        raise HTTPException(status_code=500)    
 
class PaginatedAgentsResponse(BaseModel):
    total: int
    currentPage: int
    limit: int
    agents: list
    
# 4. Get all available agents of an org (INTERNAL and EXTERNAL)
@ent_router.get("/agents/{org_name}", response_model=PaginatedAgentsResponse)
def get_agents_of_org(request: Request, org_name: str, db: Session = Depends(get_db), page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=10)):
    try:
        user = get_user_from_token(request, db)
        if user.role == "USER":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="user not authorized")
        org_data = db.query(Organisation).filter(Organisation.name == org_name.lower().strip()).first()
        
        result = AdminService.get_agents_of_org(db, org_id=org_data.id, page=page, limit=limit)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.get_agents_of_org] :: Error retrieving agents: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@ent_router.get("/agents/{org_name}/{job_id}", response_model=PaginatedAgentsResponse)
def get_all_agents_of_job_api(request: Request, org_name: str, job_id : int, db: Session = Depends(get_db)):
    try:
        user = get_user_from_token(request, db)
        if user.role == "USER":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="user not authorized")
        org_data = db.query(Organisation).filter(Organisation.name == org_name.lower().strip()).first()
        
        result = AdminService.get_agents_of_org(db, org_id=org_data.id, page=1, limit=10, job_id=job_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.get_agents_of_org] :: Error retrieving agents: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# 5. Update/create agent version (INTERNAL and EXTERNAL)
@ent_router.post("/org/{org_name}/agents")
def update_or_create_agent(request: Request, org_name: str, agent_data: AgentUpdateCreateRequest, db: Session = Depends(get_db)):
    try:
        org_data = db.query(Organisation).filter(Organisation.name == org_name.lower().strip()).first()
        user = get_user_from_token(request, db)
        if user.role == "EXTERNAL" and user.org_id != org_data.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="EXTERNAL users can only update/create agents for their own organisation")
        if user.role not in ["INTERNAL", "EXTERNAL"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only INTERNAL or EXTERNAL users can update/create agents")
        # agent, action = AdminService.update_or_create_agent(db, name=agent_data.name, version=agent_data.version, prompt=agent_data.prompt, llmConfig=agent_data.llmConfig, org_id=org_id)
        # return {"status": action, "agent": {
        #     "id": agent.id,
        #     "uuid": agent.uuid,
        #     "name": agent.name,
        #     "prompt": agent.prompt,
        #     "config": agent.config,
        #     "is_active": agent.is_active,
        #     "org_id": agent.org_id
        # }}
        
        args = {
            "name" : agent_data.name,
            "prompt" : agent_data.prompt,
            "version" : agent_data.version,
            "org_id" : org_data.id
        }
        isSuccess, result = AgentManagementServices.update_agent(args)
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.update_or_create_agent] :: Error updating/creating agent: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# 6. Set an agent as active (INTERNAL and EXTERNAL)
@ent_router.patch("/org/{org_name}/agents/{agent_id}/activate", response_model=dict)
def set_agent_as_active(request: Request, org_name: str, agent_id: str, db: Session = Depends(get_db)):
    try:
        user = get_user_from_token(request, db)
        org_data = db.query(Organisation).filter(Organisation.name == org_name.lower().strip()).first()
        if user.role == "EXTERNAL" and user.org_id != org_data.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="EXTERNAL users can only activate agents for their own organisation")
        result, msg = AgentManagementServices.set_agent_as_active({"agentUuid" : agent_id})
        return {"status": "success" if result else "failed", "message": msg}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"[admin_router.set_agent_as_active] :: Error setting agent as active: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@ent_router.get("/jobs/{job_id}/candidates")
async def get_all_candidates_of_job_api(request: Request, job_id: str, db: Session = Depends(get_db), page: int = Query(1, ge=1, description="Page number for pagination")):
    try: 
        user = get_user_from_token(request, db)
        org_data = db.query(Organisation).filter(Organisation.id == user.org_id).first()
        
        if user.role == "EXTERNAL" and user.org_id != org_data.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="EXTERNAL users can only activate agents for their own organisation")
    
        job_candidates_url = f"https://api.teamtailor.com/v1/jobs/{job_id}/candidates?page%5Bnumber%5D={page}&page%5Bsize%5D=10"
       
        resp = requests.get(job_candidates_url, timeout=10, headers=api_headers)
        if resp.status_code != 200:
            logger.error(f"[get_all_candidates_of_job_api] Failed: {resp.text}")
            raise HTTPException(status_code=502, detail="Failed to fetch job info from external API.")
        data = resp.json()         
        result = extract_all_candidates(data, job_id, current_page=page)
        
        
        return result
      
    except Exception: 
        logger.exception("[ent_router | get_all_candidates_of_job_api] :: caught exception")
        raise HTTPException(status_code=500)
    
@ent_router.get("/dashboard/stats")
async def get_ent_dashboard_stats_api(request: Request, db: Session = Depends(get_db)): 
    try:
        user = get_user_from_token(request, db)
        if not user.org_id:
            raise HTTPException(status_code=400, detail="User does not belong to any organisation.")

        org_data = db.query(Organisation).filter(Organisation.id == user.org_id).first()
        if not org_data:
            raise HTTPException(status_code=400, detail="Organisation not found.")

        total_jobs = 0
        
        try:
            jobs_url = "https://api.teamtailor.com/v1/jobs"
            resp = requests.get(jobs_url, headers=api_headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                meta = data.get("meta", {})
                total_jobs = meta.get("record-count", 0)
            else:
                logger.error(f"[get_ent_dashboard_stats_api] TeamTailor jobs API failed: {resp.text}")
        except Exception as e:
            logger.exception(f"[get_ent_dashboard_stats_api] Exception fetching totalJobs: {str(e)}")

        
        total_interviews = 0
        
        try:
            total_interviews = db.query(SessionModel).filter(
                func.json_extract(SessionModel.session_metadata, '$.job_id').isnot(None),
                func.json_extract(SessionModel.session_metadata, '$.job_id') != ''
            ).count()
        except Exception as e:
            logger.exception(f"[get_ent_dashboard_stats_api] Exception fetching totalInterviews: {str(e)}")

        active_candidates = 0
        
        try:
            
            candidate_ids = db.query(
                func.distinct(func.json_extract(SessionModel.session_metadata, '$.candidate_id'))
            ).filter(
                func.json_extract(SessionModel.session_metadata, '$.candidate_id').isnot(None),
                func.json_extract(SessionModel.session_metadata, '$.candidate_id') != ''
            ).all()
            
            active_candidates = len([cid[0] for cid in candidate_ids if cid[0] is not None])
        except Exception as e:
            logger.exception(f"[get_ent_dashboard_stats_api] Exception fetching activeCandidates: {str(e)}")

        total_recruiters = 0
        try:
            total_recruiters = db.query(User).filter(User.org_id == user.org_id).count()
        except Exception as e:
            logger.exception(f"[get_ent_dashboard_stats_api] Exception fetching totalRecruiters: {str(e)}")

        stats = {
            "totalJobs": total_jobs,
            "totalInterviews": total_interviews,
            "activeCandidates": active_candidates,
            "totalRecruiters": total_recruiters
        }
        
        return {"stats": stats}
        
    except Exception:
        logger.exception("[ent_router | get_entdashboard_stats_api] :: caught exception")
        raise HTTPException(status_code=500)