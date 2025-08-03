import asyncio
import json
import time
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, File, Request, UploadFile, HTTPException, Form
import logging
from fastapi.responses import StreamingResponse
import httpx
from pydantic import BaseModel
from models.agents import Agent
from models.base import get_db_session
from models.parsed_results import ParsedResult
from models.session_exchanges import SessionExchange
from models.sessions import Session, SessionStatusEnum
from models.uploads import Upload
from models.users import User
from services.agent_services import AgentServices
from services.media_service import MediaManagementService
from services.parser_service import ParserService
from services.workflow_services import analyse_interview_workflow, ent_analyse_interview_workflow
from utils.datetime_helper import StandardDT
from utils.llm_helper import generate_with_gemini
from utils.db_helper import get_media_id_from_uuid
from sqlalchemy import func
from config import config

from utils.tools import main_question_setter, retrieve_context

logger = logging.getLogger(__name__)



platform_router = APIRouter(prefix="/platform", tags=["platform"])


# to manage the media upload for the user and then asynchronously parse the media and link into the user
@platform_router.post("/media/upload")
async def media_upload_handler_api(request: Request, file: UploadFile = File(...), user_id: str = Form(...), to_parse: bool = Form(...)):
    try:
        user_uuid = request.state.bearer_token
        logger.info("[platform_router | media_upload_handler_api] :: received bearer token :: ", user_uuid)
        file_content = await file.read()
        
        is_exists, ingest_media_result = MediaManagementService.ingest_media(
            file_binary=file_content,
            file_name=file.filename,
            user_uuid=user_uuid,
            to_parse=to_parse
        )    
        
        media_uuid = ingest_media_result.get("mediaId")
        
        if is_exists:
            return {"message" : "document parsed successfully", "mediaId" : media_uuid }
        
        media_db_id = get_media_id_from_uuid(media_uuid)
        
        parsed_result = ParserService.parse_document(media_id=media_db_id, media_uuid=media_uuid)   
        
        if parsed_result:
            logger.info("[platform_router | media_upload_handler_api] :: media parsed and saved successfully, so deleting the hard copy")
            MediaManagementService.delete_media(media_uuid)
        
        # if not parsed_result: 
        #     return { "message" : "failed to parse the document"}
     
        
        return {"message" : "document parsed successfully", "mediaId" : media_uuid }
     
    except Exception: 
        logger.exception("[platform_router | media_upload_handler_api] :: caught exception")
        raise HTTPException(status_code=500)

@platform_router.post("/media/upload/v2")
async def media_upload_handler_api(request: Request, file: UploadFile = File(...), user_id: str = Form(...), to_parse: bool = Form(...)):
    try:
        user_uuid = request.state.bearer_token
        logger.info("[platform_router | media_upload_handler_api v2] :: received bearer token :: ", user_uuid)
        file_content = await file.read()
        
        is_exists, ingest_media_result = MediaManagementService.ingest_media(
            file_binary=file_content,
            file_name=file.filename,
            user_uuid=user_uuid,
            to_parse=to_parse
        )    
        
        media_uuid = ingest_media_result.get("mediaId")
        
        if is_exists:
            return {"message" : "document parsed successfully", "mediaId" : media_uuid }
        
        media_db_id = get_media_id_from_uuid(media_uuid)
        
        parsed_result = ParserService.parse_document(media_id=media_db_id, media_uuid=media_uuid)   
        
        if parsed_result:
            logger.info("[platform_router | media_upload_handler_api v2] :: media parsed and saved successfully, so deleting the hard copy and embedding into vector database")
            MediaManagementService.delete_media(media_uuid)
            # get structured resume
            resume_structuring_agent_config = {
                "name" : "resume_structuring_agent",
                "context" : {
                    "parsed_resume" : parsed_result
                }
            }
            
            structured_resume, llm_metadata1 = AgentServices.generic_agent(resume_structuring_agent_config)
            
            # todo :: move this into parser service or ingext media only later 
            with get_db_session() as db: 
                parsed_results_data = db.query(ParsedResult).filter(ParsedResult.source_id == media_db_id).first()
                parsed_results_data.structured_result = structured_resume
                db.commit()
        
        # if not parsed_result: 
        #     return { "message" : "failed to parse the document"}
     
        
        return {"message" : "document parsed successfully", "mediaId" : media_uuid }
     
    except Exception: 
        logger.exception("[platform_router | media_upload_handler_api v2] :: caught exception")
        raise HTTPException(status_code=500) 

class otherContextType(BaseModel):
    currentRole : str
    currentCompany: str
    totalProductManagementExperience: str
    totalWorkExperience: str
    targetRole: str
    targetCompany: str
    jobDescription: str
    jobDescriptionLink: str
  
class createInterviewQuestionsApiReq(BaseModel):
    assessmentArea : str
    mediaId : str
    otherContext : otherContextType 
    
# to manage the other text based contexts and web links for the job description of the user and 
# directly generate the questions for the interview and return the questions for reference     
@platform_router.post("/context/upload/v2")
async def context_upload_handler_api(request: Request, req: createInterviewQuestionsApiReq):
    try:
        media_uuid = req.mediaId
        other_context = req.otherContext
        assessment_area = req.assessmentArea or ""
        
        user_uuid = request.state.bearer_token or "" # todo ::  or "" is a temp solution remove later 
        
        response_data = None
        
        with get_db_session() as db:
            user_data = db.query(User).filter(User.uuid == user_uuid).first()
            
            this_session_llm_metadatas = {}
            this_session_contexts = {}
            # in case no media is supplied 
            if not media_uuid or media_uuid == "":
                
                this_session_contexts["candidates_other_contexts"] = other_context.model_dump()
                this_session_contexts["assessment_area"] = assessment_area
                
                name_key = user_uuid + StandardDT.get_iso_dt_string() # no media here so empty session uuid name key with user uuid and current time
                
                session_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name_key))
                
                # create a new session and save the generated questions against it 
                new_session = Session(
                    user_id = user_data.id,
                    uuid = session_uuid,
                    # session_questions = generated_questions,
                    session_metadata = this_session_llm_metadatas,
                    contexts = this_session_contexts,
                    status = SessionStatusEnum.CREATED.value
                )
                
                # to return as response , the session id for the interview and the generated questions 
                response_data = {
                    "sessionId" : session_uuid,
                    # "sessionQuestions" : generated_questions
                }
                
                db.add(new_session)
                db.commit()             
            else: 
        
                media_data = db.query(Upload).filter(Upload.uuid == media_uuid).first()
                parsing_metadata = media_data.parsing_metadata
                
                            
                # if media id is present and its already been parsed 
                if parsing_metadata.get("parsing_status", "") == "COMPLETED":
                    media_db_id = get_media_id_from_uuid(media_uuid)
                    
                    # get the parsed result using the integer ID
                    parsed_results_data = db.query(ParsedResult).filter(ParsedResult.source_id == media_db_id).first()
                    
                    structured_resume = None
                    # this_session_llm_metadatas = {}
                    # this_session_contexts = {}
                    if not parsed_results_data.structured_result: # note :: for v2 this wont hit 
                        # setup the resume structuring agent config 
                        resume_structuring_agent_config = {
                            "name" : "resume_structuring_agent",
                            "context" : {
                                "parsed_resume" : parsed_results_data.raw_result
                            }
                        }

                        this_session_contexts["selected_resume_media_uuid"] = media_uuid 
                        
                        structured_resume, llm_metadata1 = AgentServices.generic_agent(resume_structuring_agent_config)

                        this_session_llm_metadatas["resume_structuring_agent"] = llm_metadata1
                    
                        # caching the structured resume result into hte parsed results data aswell
                        parsed_results_data.structured_result = structured_resume
                    else: 
                        structured_resume = parsed_results_data.structured_result
                        this_session_contexts["selected_resume_media_uuid"] = media_uuid 
                    
                    this_session_contexts["candidates_other_contexts"] = other_context.model_dump()
                    this_session_contexts["assessment_area"] = assessment_area
                    
                    name_key = media_uuid + StandardDT.get_iso_dt_string()
                    
                    session_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name_key))               
                    
                    # create a new session and save the generated questions against it 
                    new_session = Session(
                        user_id = media_data.user_id,
                        uuid = session_uuid,
                        # session_questions = generated_questions,
                        session_metadata = this_session_llm_metadatas,
                        contexts = this_session_contexts,
                        status = SessionStatusEnum.CREATED.value
                    )
                    
                    # to return as response , the session id for the interview and the generated questions 
                    response_data = {
                        "sessionId" : session_uuid,
                        # "sessionQuestions" : generated_questions
                    }
                    
                    db.add(new_session)
                    db.commit()
                else: # note :: media was not parsed but media id was given
                    
                    this_session_contexts["candidates_other_contexts"] = other_context.model_dump()
                    this_session_contexts["assessment_area"] = assessment_area
                    
                    name_key = user_uuid + StandardDT.get_iso_dt_string()
                    
                    session_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name_key))           
                    
                    # create a new session and save the generated questions against it 
                    new_session = Session(
                        user_id = media_data.user_id,
                        uuid = session_uuid,
                        # session_questions = generated_questions,
                        session_metadata = this_session_llm_metadatas,
                        contexts = this_session_contexts,
                        status = SessionStatusEnum.CREATED.value
                    )
                    
                    # to return as response , the session id for the interview and the generated questions 
                    response_data = {
                        "sessionId" : session_uuid,
                        # "sessionQuestions" : generated_questions
                    }
                    
                    db.add(new_session)
                    db.commit()                
                
        # return the generated questions and the created session id 
        return response_data
    
    except Exception: 
        logger.exception("[platform_router | context_upload_handler_api v2] :: caught exception")
        raise HTTPException(status_code=500)

@platform_router.post("/context/upload")
async def context_upload_handler_api(request: Request, req: createInterviewQuestionsApiReq):
    try:
        media_uuid = req.mediaId
        other_context = req.otherContext
        assessment_area = req.assessmentArea or ""
        
        user_uuid = request.state.bearer_token or "" # todo ::  or "" is a temp solution remove later 
        
        response_data = None
        
        with get_db_session() as db:
            user_data = db.query(User).filter(User.uuid == user_uuid).first()
            
            this_session_llm_metadatas = {}
            this_session_contexts = {}
            # in case no media is supplied 
            if not media_uuid or media_uuid == "":
                question_gen_agent_config = {
                    "name" : "question_gen_agent",
                    "context" : {
                        "candidate_resume" : "",
                        "assessment_area" : assessment_area,
                        "candidates_other_contexts" : other_context,
                    }
                } 
                
                this_session_contexts["candidates_other_contexts"] = other_context.model_dump()
                this_session_contexts["assessment_area"] = assessment_area
                
                generated_questions, llm_metadata2 = AgentServices.generic_agent(question_gen_agent_config)
                
                this_session_llm_metadatas["question_gen_agent"] = llm_metadata2
                
                name_key = user_uuid + StandardDT.get_iso_dt_string() # no media here so empty session uuid name key with user uuid and current time
                
                session_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name_key))
                
                # create a new session and save the generated questions against it 
                new_session = Session(
                    user_id = user_data.id,
                    uuid = session_uuid,
                    session_questions = generated_questions,
                    session_metadata = this_session_llm_metadatas,
                    contexts = this_session_contexts,
                    status = SessionStatusEnum.CREATED.value
                )
                
                # to return as response , the session id for the interview and the generated questions 
                response_data = {
                    "sessionId" : session_uuid,
                    "sessionQuestions" : generated_questions
                }
                
                db.add(new_session)
                db.commit()             
            else: 
        
                media_data = db.query(Upload).filter(Upload.uuid == media_uuid).first()
                parsing_metadata = media_data.parsing_metadata
                
                            
                # if media id is present and its already been parsed 
                if parsing_metadata.get("parsing_status", "") == "COMPLETED":
                    media_db_id = get_media_id_from_uuid(media_uuid)
                    
                    # get the parsed result using the integer ID
                    parsed_results_data = db.query(ParsedResult).filter(ParsedResult.source_id == media_db_id).first()
                    
                    structured_resume = None
                    # this_session_llm_metadatas = {}
                    # this_session_contexts = {}
                    if not parsed_results_data.structured_result:
                        # setup the resume structuring agent config 
                        resume_structuring_agent_config = {
                            "name" : "resume_structuring_agent",
                            "context" : {
                                "parsed_resume" : parsed_results_data.raw_result
                            }
                        }

                        this_session_contexts["selected_resume_media_uuid"] = media_uuid 
                        
                        structured_resume, llm_metadata1 = AgentServices.generic_agent(resume_structuring_agent_config)

                        this_session_llm_metadatas["resume_structuring_agent"] = llm_metadata1
                    
                        # caching the structured resume result into hte parsed results data aswell
                        parsed_results_data.structured_result = structured_resume
                    else: 
                        structured_resume = parsed_results_data.structured_result
                        this_session_contexts["selected_resume_media_uuid"] = media_uuid 
                    
                    # setup the question gen agent config 
                    question_gen_agent_config = {
                        "name" : "question_gen_agent",
                        "context" : {
                            "candidate_resume" : structured_resume,
                            "assessment_area" : assessment_area,
                            "candidates_other_contexts" : other_context,
                        }
                    }
                    
                    this_session_contexts["candidates_other_contexts"] = other_context.model_dump()
                    this_session_contexts["assessment_area"] = assessment_area
                    
                    generated_questions, llm_metadata2 = AgentServices.generic_agent(question_gen_agent_config)
                    
                    this_session_llm_metadatas["question_gen_agent"] = llm_metadata2
                    
                    name_key = media_uuid + StandardDT.get_iso_dt_string()
                    
                    session_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name_key))
                    
                    # create a new session and save the generated questions against it 
                    new_session = Session(
                        user_id = media_data.user_id,
                        uuid = session_uuid,
                        session_questions = generated_questions,
                        session_metadata = this_session_llm_metadatas,
                        contexts = this_session_contexts,
                        status = SessionStatusEnum.CREATED.value
                    )
                    
                    # to return as response , the session id for the interview and the generated questions 
                    response_data = {
                        "sessionId" : session_uuid,
                        "sessionQuestions" : generated_questions
                    }
                    
                    db.add(new_session)
                    db.commit()
                else: 
                    # setup the question gen agent config 
                    question_gen_agent_config = {
                        "name" : "question_gen_agent",
                        "context" : {
                            "candidate_resume" : "", # since parsing was not completed, resume is left empty
                            "assessment_area" : assessment_area,
                            "candidates_other_contexts" : other_context,
                        }
                    }
                    
                    this_session_contexts["candidates_other_contexts"] = other_context.model_dump()
                    this_session_contexts["assessment_area"] = assessment_area
                    
                    generated_questions, llm_metadata2 = AgentServices.generic_agent(question_gen_agent_config)
                    
                    this_session_llm_metadatas["question_gen_agent"] = llm_metadata2
                    
                    name_key = user_uuid + StandardDT.get_iso_dt_string()
                    
                    session_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name_key))
                    
                    # create a new session and save the generated questions against it 
                    new_session = Session(
                        user_id = media_data.user_id,
                        uuid = session_uuid,
                        session_questions = generated_questions,
                        session_metadata = this_session_llm_metadatas,
                        contexts = this_session_contexts,
                        status = SessionStatusEnum.CREATED.value
                    )
                    
                    # to return as response , the session id for the interview and the generated questions 
                    response_data = {
                        "sessionId" : session_uuid,
                        "sessionQuestions" : generated_questions
                    }
                    
                    db.add(new_session)
                    db.commit()                
                
        # return the generated questions and the created session id 
        return response_data
    
    except Exception: 
        logger.exception("[platform_router | context_upload_handler_api] :: caught exception")
        raise HTTPException(status_code=500)
    
# to link the generated call id with the session id 
@platform_router.post("/ent/session/link")
async def link_callid_to_session_api(request: Request, req : dict):
    try: 
        call_id = req.get("callId")
        session_id = req.get("sessionId")
        
        logger.info("[platform_router | link_callid_to_session_api] :: linking session = %s with callid = %s", session_id, call_id)
        
        response_data = f"linked callid {call_id} to session ({session_id})"
        with get_db_session() as db: 
            session_data = db.query(Session).filter(Session.uuid == session_id).first()
            
            total_elapsed_time = session_data.used_credits
            if not session_data.call_id:
                session_data.call_id = call_id
            else: 
                if total_elapsed_time < 16:
                    logger.info("[platform_router | link_callid_to_session_api ent] :: last session was too short, session able to relink to new call")
                    logger.info("[platform_router | link_callid_to_session_api ent] :: deleting this session old conversation data for reset")
                    del_row_count = db.query(SessionExchange).filter(SessionExchange.session_id == session_data.id).delete()
                    logger.info("[platform_router | link_callid_to_session_api ent] :: deleted %s old exchanges of the session.", del_row_count)
                    session_data.call_id = call_id
                    logger.info("[platform_router | link_callid_to_session_api ent] :: linked new call id to session.")
                else:
                    logger.error("[platform_router | link_callid_to_session_api ent] :: session already linked and completed, cannot reset")
                    response_data = "session already linked and completed, cannot link new call id"
                
            db.commit()
            
        return { "message" : response_data}
    
    except Exception:
        logger.exception("[platform_router | link_callid_to_session_api] :: caught exception")
        raise HTTPException(status_code=500)


@platform_router.post("/session/link")
async def link_callid_to_session_api(request: Request, req : dict):
    try: 
        call_id = req.get("callId")
        session_id = req.get("sessionId")
        
        logger.info("[platform_router | link_callid_to_session_api] :: linking session = %s with callid = %s", session_id, call_id)
        
        with get_db_session() as db: 
            session_data = db.query(Session).filter(Session.uuid == session_id).first()
            
            session_data.call_id = call_id
            db.commit()
                    
        return { "message" : f"linked callid {call_id} to session ({session_id})"}
    
    except Exception:
        logger.exception("[platform_router | link_callid_to_session_api] :: caught exception")
        raise HTTPException(status_code=500)
    

class Message(BaseModel):
    role: str
    content: str
    
class Tool(BaseModel):
    type: str
    function: Dict[str, Any]

class CallMonitor(BaseModel):
    controlUrl: str
    listenUrl: str

class Call(BaseModel):
    id: str
    orgId: str
    createdAt: str
    updatedAt: str
    type: str
    monitor: CallMonitor

class ChatCompletionRequest(BaseModel):
    messages: List[Message]
    stream: Optional[bool] = True
    tools: Optional[List[Tool]] = []
    tool_choice: Optional[str] = "auto"
    destination: Optional[str] = None
    call: Optional[Call] = None 

# vapi request structure example for reference::
# messages=[
#     Message(role='system', content='This is a blank template with minimal defaults, you can change the model, temperature, and messages.'), 
#     Message(role='assistant', content='Hello? Shall we start?'), 
#     Message(role='user', content='Yes.')] 
# stream=True 
# tools=[] 
# tool_choice='auto' 
# destination=None 
# call=Call(id='cdcad813-b071-49e4-b067-14562c8ccd5b', 
#           orgId='6e5bba56-c20d-400f-a8cc-fee0da1cf741', 
#           createdAt='2025-06-12T18:35:51.371Z', 
#           updatedAt='2025-06-12T18:35:51.371Z', 
#           type='webCall', 
#           monitor=CallMonitor(controlUrl='https://phone-call-websocket.aws-us-west-2-backend-production2.vapi.ai/cdcad813-b071-49e4-b067-14562c8ccd5b/control', 
#                               listenUrl='wss://phone-call-websocket.aws-us-west-2-backend-production2.vapi.ai/cdcad813-b071-49e4-b067-14562c8ccd5b/listen'))


# helper function to simulate the streaming response for session termination on credits empty
async def terminate_session_stream():
    try:
        await asyncio.sleep(0.25)  # Simulate processing time

        termination_message = "Session terminated due to insufficient credits or time limit."
        yield f"data: {termination_message}\n\n"

    except Exception as e:
        error_message = f"Session terminated due to an error: {str(e)}"
        yield f"data: {error_message}\n\n"
    finally:
        yield "data: [DONE]\n\n"  # Signal the end of the stream

# interview live run agent with chat completion endpoint for vapi to connect to     
@platform_router.post("/v3/chat/completions")
async def stream_interview_response_api(req: ChatCompletionRequest):
    try:
        call_id = None
        # Check if there's a call_id field in the request or any custom fields that might contain it
        if hasattr(req, 'call') and req.call.id:
            # The call_id field might contain call_id information
            call_id = req.call.id   
        
        candidate_latest_message = req.messages[-1].content  
        logger.info("[chat_completions ent] :: latest candidate message = %s", candidate_latest_message)
        
        call_start_time = req.call.createdAt
        
        elapsed_session_time = (StandardDT.get_current_utc_dt()  - StandardDT.get_dt_from_iso(str(call_start_time))).seconds / 60

        logger.info("[chat_completions ent] :: session created at from vapi %s, calculated elapsed time in minutes %s ", call_start_time, elapsed_session_time)

        system_instruction = None
        question_context = None
        user_id = None
        session_id = None
        
        # used up session credits with user credits calculation block
        with  get_db_session() as db:
            session_data = db.query(Session).filter(Session.call_id == str(call_id)).first()
            
            # quickly reject the TERMINATED session
            if session_data.status == SessionStatusEnum.TERMINATED.value:
                logger.info("[chat_completions ent] :: rejecting further processing as session is already terminated")
                return StreamingResponse(terminate_session_stream() , media_type='text/event-stream')
             
            user_data = db.query(User).filter(User.id == session_data.user_id).first()
            session_credits = session_data.used_credits if session_data.used_credits else int(0) # todo :: setup default to 0 on session creation 
            existing_user_credits = user_data.credits if user_data.credits else int(20)
            
            # updating this from <= 1 to -3 giving a 3 minutes/credits extra for the payment to go through before terminating
            # if (existing_user_credits - elapsed_session_time) <= -3:
            #     # then user credits have been used up so expire the session and update user credits to 0 asap
            #     session_data.status = SessionStatusEnum.TERMINATED.value
            #     user_data.credits = 0
            #     session_data.used_credits = round(elapsed_session_time)
            #     db.commit()
            #     logger.info("[chat_completions ent] :: user credits emptied so terminated this session and ending further process")
            #     return StreamingResponse(terminate_session_stream() , media_type='text/event-stream')
            # else: 
            # then user credits will be updated to :: current_user_credits - (elapsed_session_time - prev_session_credits_used)
            user_data.credits = existing_user_credits - (round(elapsed_session_time) - session_credits)
            # updating the session_used_credits to current elapsed_session_time to keep track 
            session_data.used_credits = round(elapsed_session_time)
            parsed_context = session_data.contexts if session_data.contexts else {}
            
            ent_agent_name = session_data.session_metadata.get("interview_agent", "ent_interview_agent") if session_data.session_metadata else str("ent_interview_agent")
            
            logger.info("[chat_completions ent] :: running session for agent = %s", ent_agent_name)
            
            interview_agent = db.query(Agent).filter(Agent.name.startswith(ent_agent_name), Agent.is_active == True).first()
            
            system_instruction = f"""{interview_agent.prompt}
            ---
            context = 
            These are the job details you are currently interviewing for: 
              job_title : {parsed_context.get("job_title" , "")}
              job_description : {parsed_context.get("job_description", "")}
              
            These are the preliminary / pre screening questions and the candidates answers: 
            {parsed_context.get("job_preliminary_question_and_answer_list", [])}
            ---
            
            NOTE: candidates answers might be empty meaning the candidate hasnt answered the questions. If no questions and answers 
            are present then there were no preliminary questions at all. 
            
            
            Total elapsed time in minutes for this session: {elapsed_session_time}

            You have access to the following tools:
            - `retrieve_context`: Use this tool to get the user's resume or other relevant context. You MUST use this tool when the user asks a question related to their resume or personal context.
            - `main_question_setter`: Use this tool to set the main interview question.
            
            ## Always use the "retrieve_context" to get the resume context of the user to generate every question.
            ## When a new or fresh interview question is generated or pulled from the context always silently invoke the "main_question_setter" tool, dont miss this

            The current session_id is: {session_data.id}. You must pass this session_id to the tools when you call them.
            
            Do not generate code snippets. Call the tools directly when needed.
            
            ## NOTE :: Speak only what you would respond to the candidate. Dont include any thought process or tool call mentions in the response.
            """
            # question_context = session_data.session_questions
            session_data.status = SessionStatusEnum.ACTIVE.value
            user_id = session_data.user_id
            session_id = session_data.id
            db.commit()
                    
        # Convert OpenAI-style messages to Gemini format
        gemini_messages = []
        for msg in req.messages:
            role = msg.role
            content = msg.content
            if role == 'user':
                gemini_messages.append({"role": "user", "parts": [{"text": content}]})
            elif role == 'assistant':
                gemini_messages.append({"role": "model", "parts": [{"text": content}]})
            elif role == 'function' or role == 'tool':
                gemini_messages.append({"role": "model", "parts": [{"text": f"Function result: {content}"}]})       
                
        # Set up streaming response
        async def generate():
            try:
                available_functions = {
                    "retrieve_context": retrieve_context,
                    "main_question_setter": main_question_setter
                }

                stream = generate_with_gemini(
                    prompt=gemini_messages,
                    model="gemini-2.0-flash",
                    stream=True,
                    system_instruction=system_instruction,
                    tools=[retrieve_context, main_question_setter],
                    auto_execute_functions=True,
                    available_functions=available_functions
                )
                
                combined_chunks = ""
                per_chunk_llm_metadata = []
                tool_call_started = False
                
                for chunk in stream:
                    try:
                        if hasattr(chunk, 'usage_metadata'):
                            chunk_llm_metadata = {
                                "is_streaming_response" : req.stream,
                                "model_version" : getattr(chunk, 'model_version', 'unknown'),
                                "cached_content_token_count" : chunk.usage_metadata.cached_content_token_count,
                                "candidates_token_count" : chunk.usage_metadata.candidates_token_count,
                                "prompt_token_count" : chunk.usage_metadata.prompt_token_count,
                                "total_token_count" : chunk.usage_metadata.total_token_count,
                            }
                            per_chunk_llm_metadata.append(chunk_llm_metadata)

                        if hasattr(chunk, 'candidates') and chunk.candidates:
                            for candidate in chunk.candidates:
                                if hasattr(candidate, 'content') and candidate.content:
                                    content = candidate.content
                                    if hasattr(content, 'parts') and content.parts:
                                        for part in content.parts:
                                            # Check if this part contains a function call
                                            if hasattr(part, 'function_call') and part.function_call:
                                                logger.info("[FUNCTION CALL HAPPENING]")
                                                function_call = part.function_call
                                                function_name = function_call.name
                                                function_args = function_call.args
                                                
                                                # Start a new tool call if we haven't already
                                                if not tool_call_started:
                                                    tool_call_id = "call_" + str(hash(function_name))[:10]
                                                    current_tool_call = {
                                                        "id": tool_call_id,
                                                        "type": "function",
                                                        "function": {
                                                            "name": function_name,
                                                            "arguments": json.dumps(function_args) if isinstance(function_args, dict) else function_args
                                                        }
                                                    }
                                                    tool_call_started = True
                                                    
                                                    # Create OpenAI-compatible format for tool calls
                                                    openai_tool_chunk = {
                                                        "id": "chatcmpl-" + str(hash(function_name))[:10],
                                                        "object": "chat.completion.chunk",
                                                        "created": int(time.time()),
                                                        "choices": [{
                                                            "index": 0,
                                                            "delta": {"tool_calls": [current_tool_call]},
                                                            "finish_reason": None
                                                        }]
                                                    }
                                                    yield f"data: {json.dumps(openai_tool_chunk)}\n\n"
                                            # Check if this part contains text
                                            elif hasattr(part, 'text') and part.text:
                                                openai_chunk = {
                                                    "id": "chatcmpl-" + str(hash(str(part.text)))[:10],
                                                    "object": "chat.completion.chunk",
                                                    "created": int(time.time()),
                                                    "choices": [{
                                                        "index": 0,
                                                        "delta": {"content": part.text},
                                                        "finish_reason": None
                                                    }]
                                                }
                                                yield f"data: {json.dumps(openai_chunk)}\n\n"
                                                combined_chunks += part.text
                        # Backwards compatibility - try direct text access if needed
                        elif hasattr(chunk, 'text') and chunk.text:
                            openai_chunk = {
                                "id": "chatcmpl-" + str(hash(str(chunk.text)))[:10],
                                "object": "chat.completion.chunk",
                                "created": int(time.time()),
                                "choices": [{
                                    "index": 0,
                                    "delta": {"content": chunk.text},
                                    "finish_reason": None
                                }]
                            }
                            yield f"data: {json.dumps(openai_chunk)}\n\n"
                            combined_chunks += chunk.text

                    except Exception as e:
                        logger.exception("[platform_router | chat_completions ent] | streaming :: Error processing chunk: %s", str(e))
                        continue                               

                logger.info("[platform_router | chat_completions ent] | streaming :: Streaming completed")

                # save this session exchange object for final analysis
                with get_db_session() as db: 
                    new_session_exchange = SessionExchange(
                        user_id = user_id,
                        session_id = session_id,
                        data = {
                            "candidate" : candidate_latest_message,
                            "interviewer" : combined_chunks
                        },
                        exchange_metadata = per_chunk_llm_metadata
                    )
                    
                    db.add(new_session_exchange)
                    db.commit()
                
                
                yield "data: [DONE]\n\n"
                
            except Exception as e:
                logger.exception("[platform_router | chat_completions ent] | streaming :: caught exception")
                error_chunk = {
                    "error": str(e)
                }
                yield f"data: {json.dumps(error_chunk)}\n\n"
                
        return StreamingResponse(generate(), media_type='text/event-stream')
        
    except Exception as error:
        logger.exception("[platform_router | chat_completions ent] :: Error in /chat/completions")
        if req.stream:
            async def error_stream():
                yield f"data: {json.dumps({'error': 'Streaming Error'})}\n\n"
            return StreamingResponse(error_stream(), media_type='text/event-stream')                           


@platform_router.post("/v2/chat/completions")
async def stream_interview_response_api(req: ChatCompletionRequest):
    try:
        call_id = None
        # Check if there's a call_id field in the request or any custom fields that might contain it
        if hasattr(req, 'call') and req.call.id:
            # The call_id field might contain call_id information
            call_id = req.call.id   
        
        candidate_latest_message = req.messages[-1].content  
        logger.info("[chat_completions v2] :: latest candidate message = %s", candidate_latest_message)
        
        call_start_time = req.call.createdAt
        
        elapsed_session_time = (StandardDT.get_current_utc_dt()  - StandardDT.get_dt_from_iso(str(call_start_time))).seconds / 60
        
        logger.info("[chat_completions v2] :: session created at from vapi %s, calculated elapsed time in minutes %s ", call_start_time, elapsed_session_time)
        
        system_instruction = None
        question_context = None
        user_id = None
        session_id = None
        
        # used up session credits with user credits calculation block
        with  get_db_session() as db:
            session_data = db.query(Session).filter(Session.call_id == str(call_id)).first()
            
            # quickly reject the TERMINATED session
            if session_data.status == SessionStatusEnum.TERMINATED.value:
                logger.info("[chat_completions v2] :: rejecting further processing as session is already terminated")
                return StreamingResponse(terminate_session_stream() , media_type='text/event-stream')
             
            user_data = db.query(User).filter(User.id == session_data.user_id).first()
            session_credits = session_data.used_credits if session_data.used_credits else int(0)
            existing_user_credits = user_data.credits
            
            # updating this from <= 1 to -3 giving a 3 minutes/credits extra for the payment to go through before terminating
            if (existing_user_credits - elapsed_session_time) <= -3:
                # then user credits have been used up so expire the session and update user credits to 0 asap
                session_data.status = SessionStatusEnum.TERMINATED.value
                user_data.credits = 0
                session_data.used_credits = round(elapsed_session_time)
                db.commit()
                logger.info("[chat_completions v2] :: user credits emptied so terminated this session and ending further process")
                return StreamingResponse(terminate_session_stream() , media_type='text/event-stream')
            else: 
                # then user credits will be updated to :: current_user_credits - (elapsed_session_time - prev_session_credits_used)
                user_data.credits = existing_user_credits - (round(elapsed_session_time) - session_credits)
                # updating the session_used_credits to current elapsed_session_time to keep track 
                session_data.used_credits = round(elapsed_session_time)
                            
            interview_agent = db.query(Agent).filter(Agent.name.startswith("interviewer_agent"), Agent.is_active == True).first()
            system_instruction = f"""{interview_agent.prompt}

            You have access to the following tools:
            - `retrieve_context`: Use this tool to get the user's resume or other relevant context. You MUST use this tool when the user asks a question related to their resume or personal context.
            - `main_question_setter`: Use this tool to set the main interview question.
            
            ## When a new or fresh interview question is generated or pulled from the context always silently invoke the "main_question_setter" tool, dont miss this

            The current session_id is: {session_data.id}. You must pass this session_id to the tools when you call them.
            Do not generate code snippets. Call the tools directly when needed.
            
            ## NOTE :: Speak only what you would respond to the candidate. Dont include any thought process or tool call mentions in the response.
            """
            # question_context = session_data.session_questions
            session_data.status = SessionStatusEnum.ACTIVE.value
            user_id = session_data.user_id
            session_id = session_data.id
            db.commit()
                    
        # Convert OpenAI-style messages to Gemini format
        gemini_messages = []
        for msg in req.messages:
            role = msg.role
            content = msg.content
            if role == 'user':
                gemini_messages.append({"role": "user", "parts": [{"text": content}]})
            elif role == 'assistant':
                gemini_messages.append({"role": "model", "parts": [{"text": content}]})
            elif role == 'function' or role == 'tool':
                gemini_messages.append({"role": "model", "parts": [{"text": f"Function result: {content}"}]})       
                
        # Set up streaming response
        async def generate():
            try:
                available_functions = {
                    "retrieve_context": retrieve_context,
                    "main_question_setter": main_question_setter
                }

                stream = generate_with_gemini(
                    prompt=gemini_messages,
                    model="gemini-2.0-flash",
                    stream=True,
                    system_instruction=system_instruction,
                    tools=[retrieve_context, main_question_setter],
                    auto_execute_functions=True,
                    available_functions=available_functions
                )
                
                combined_chunks = ""
                per_chunk_llm_metadata = []
                tool_call_started = False
                
                for chunk in stream:
                    try:
                        if hasattr(chunk, 'usage_metadata'):
                            chunk_llm_metadata = {
                                "is_streaming_response" : req.stream,
                                "model_version" : getattr(chunk, 'model_version', 'unknown'),
                                "cached_content_token_count" : chunk.usage_metadata.cached_content_token_count,
                                "candidates_token_count" : chunk.usage_metadata.candidates_token_count,
                                "prompt_token_count" : chunk.usage_metadata.prompt_token_count,
                                "total_token_count" : chunk.usage_metadata.total_token_count,
                            }
                            per_chunk_llm_metadata.append(chunk_llm_metadata)

                        if hasattr(chunk, 'candidates') and chunk.candidates:
                            for candidate in chunk.candidates:
                                if hasattr(candidate, 'content') and candidate.content:
                                    content = candidate.content
                                    if hasattr(content, 'parts') and content.parts:
                                        for part in content.parts:
                                            # Check if this part contains a function call
                                            if hasattr(part, 'function_call') and part.function_call:
                                                logger.info("[FUNCTION CALL HAPPENING]")
                                                function_call = part.function_call
                                                function_name = function_call.name
                                                function_args = function_call.args
                                                
                                                # Start a new tool call if we haven't already
                                                if not tool_call_started:
                                                    tool_call_id = "call_" + str(hash(function_name))[:10]
                                                    current_tool_call = {
                                                        "id": tool_call_id,
                                                        "type": "function",
                                                        "function": {
                                                            "name": function_name,
                                                            "arguments": json.dumps(function_args) if isinstance(function_args, dict) else function_args
                                                        }
                                                    }
                                                    tool_call_started = True
                                                    
                                                    # Create OpenAI-compatible format for tool calls
                                                    openai_tool_chunk = {
                                                        "id": "chatcmpl-" + str(hash(function_name))[:10],
                                                        "object": "chat.completion.chunk",
                                                        "created": int(time.time()),
                                                        "choices": [{
                                                            "index": 0,
                                                            "delta": {"tool_calls": [current_tool_call]},
                                                            "finish_reason": None
                                                        }]
                                                    }
                                                    yield f"data: {json.dumps(openai_tool_chunk)}\n\n"
                                            # Check if this part contains text
                                            elif hasattr(part, 'text') and part.text:
                                                openai_chunk = {
                                                    "id": "chatcmpl-" + str(hash(str(part.text)))[:10],
                                                    "object": "chat.completion.chunk",
                                                    "created": int(time.time()),
                                                    "choices": [{
                                                        "index": 0,
                                                        "delta": {"content": part.text},
                                                        "finish_reason": None
                                                    }]
                                                }
                                                yield f"data: {json.dumps(openai_chunk)}\n\n"
                                                combined_chunks += part.text
                        # Backwards compatibility - try direct text access if needed
                        elif hasattr(chunk, 'text') and chunk.text:
                            openai_chunk = {
                                "id": "chatcmpl-" + str(hash(str(chunk.text)))[:10],
                                "object": "chat.completion.chunk",
                                "created": int(time.time()),
                                "choices": [{
                                    "index": 0,
                                    "delta": {"content": chunk.text},
                                    "finish_reason": None
                                }]
                            }
                            yield f"data: {json.dumps(openai_chunk)}\n\n"
                            combined_chunks += chunk.text

                    except Exception as e:
                        logger.exception("[platform_router | chat_completions v2] | streaming :: Error processing chunk: %s", str(e))
                        continue                               

                logger.info("[platform_router | chat_completions v2] | streaming :: Streaming completed")
                                
                # save this session exchange object for final analysis 
                with get_db_session() as db: 
                    new_session_exchange = SessionExchange(
                        user_id = user_id,
                        session_id = session_id,
                        data = {
                            "candidate" : candidate_latest_message,
                            "interviewer" : combined_chunks
                        },
                        exchange_metadata = per_chunk_llm_metadata
                    )
                    
                    db.add(new_session_exchange)
                    db.commit()
                
                
                yield "data: [DONE]\n\n"
                
            except Exception as e:
                logger.exception("[platform_router | chat_completions v2] | streaming :: caught exception")
                error_chunk = {
                    "error": str(e)
                }
                yield f"data: {json.dumps(error_chunk)}\n\n"
                
        return StreamingResponse(generate(), media_type='text/event-stream')
        
    except Exception as error:
        logger.exception("[platform_router | chat_completions v2] :: Error in /chat/completions")
        if req.stream:
            async def error_stream():
                yield f"data: {json.dumps({'error': 'Streaming Error'})}\n\n"
            return StreamingResponse(error_stream(), media_type='text/event-stream')                           

@platform_router.post("/chat/completions")
async def stream_interview_response_api(req: ChatCompletionRequest):
    try:
        call_id = None
        # Check if there's a call_id field in the request or any custom fields that might contain it
        if hasattr(req, 'call') and req.call.id:
            # The call_id field might contain call_id information
            call_id = req.call.id   
        
        candidate_latest_message = req.messages[-1].content  
        logger.info("[chat_completions] :: latest candidate message = %s", candidate_latest_message)
        
        call_start_time = req.call.createdAt
        
        elapsed_session_time = (StandardDT.get_current_utc_dt()  - StandardDT.get_dt_from_iso(str(call_start_time))).seconds / 60
        
        logger.info("[chat_completions] :: session created at from vapi %s, calculated elapsed time in minutes %s ", call_start_time, elapsed_session_time)
        
        system_instruction = None
        question_context = None
        user_id = None
        session_id = None
        
        # used up session credits with user credits calculation block
        with  get_db_session() as db:
            session_data = db.query(Session).filter(Session.call_id == str(call_id)).first()
            
            # quickly reject the TERMINATED session
            if session_data.status == SessionStatusEnum.TERMINATED.value:
                logger.info("[chat_completions] :: rejecting further processing as session is already terminated")
                return StreamingResponse(terminate_session_stream() , media_type='text/event-stream')
             
            user_data = db.query(User).filter(User.id == session_data.user_id).first()
            session_credits = session_data.used_credits if session_data.used_credits else int(0) # todo :: setup default to 0 on session creation 
            existing_user_credits = user_data.credits
            
            # updating this from <= 1 to -3 giving a 3 minutes/credits extra for the payment to go through before terminating
            if (existing_user_credits - elapsed_session_time) <= -3:
                # then user credits have been used up so expire the session and update user credits to 0 asap
                session_data.status = SessionStatusEnum.TERMINATED.value
                user_data.credits = 0
                session_data.used_credits = round(elapsed_session_time)
                db.commit()
                logger.info("[chat_completions] :: user credits emptied so terminated this session and ending further process")
                return StreamingResponse(terminate_session_stream() , media_type='text/event-stream')
            else: 
                # then user credits will be updated to :: current_user_credits - (elapsed_session_time - prev_session_credits_used)
                user_data.credits = existing_user_credits - (round(elapsed_session_time) - session_credits)
                # updating the session_used_credits to current elapsed_session_time to keep track 
                session_data.used_credits = round(elapsed_session_time)
                            
            interview_agent = db.query(Agent).filter(Agent.name.startswith("interviewer_agent"), Agent.is_active == True).first()
            system_instruction = interview_agent.prompt
            question_context = session_data.session_questions
            session_data.status = SessionStatusEnum.ACTIVE.value
            user_id = session_data.user_id
            session_id = session_data.id
            db.commit()
            
        # Convert OpenAI-style messages to Gemini format
        gemini_messages = []
        for msg in req.messages:
            role = msg.role
            content = msg.content
            if role == 'user':
                gemini_messages.append({"role": "user", "parts": [{"text": content}]})
            elif role == 'assistant':
                gemini_messages.append({"role": "model", "parts": [{"text": content}]})
            elif role == 'function' or role == 'tool':
                gemini_messages.append({"role": "model", "parts": [{"text": f"Function result: {content}"}]})       
                
        # Set up streaming response
        async def generate():
            try:
                
                agent_context = {
                    "interview_questions" : question_context,
                    "ongoing_interview_exchanges" : gemini_messages
                }
                
                stream = generate_with_gemini(
                    prompt=f"This interview context = \n {agent_context}",
                    model="gemini-2.0-flash",
                    stream=True,
                    system_instruction=system_instruction,
                )
                
                combined_chunks = ""
                per_chunk_llm_metadata = []
                
                for chunk in stream:
                    try:
                        chunk_llm_metadata = {
                            "is_streaming_response" : req.stream,
                            "model_version" : chunk.model_version,
                            "cached_content_token_count" : chunk.usage_metadata.cached_content_token_count,
                            "candidates_token_count" : chunk.usage_metadata.candidates_token_count,
                            "prompt_token_count" : chunk.usage_metadata.prompt_token_count,
                            "total_token_count" : chunk.usage_metadata.total_token_count,
                        }

                        per_chunk_llm_metadata.append(chunk_llm_metadata)          

                        if hasattr(chunk, 'candidates') and chunk.candidates:
                            for candidate in chunk.candidates:
                                if hasattr(candidate, 'content') and candidate.content:
                                    content = candidate.content
                                    if hasattr(content, 'parts') and content.parts:
                                        for part in content.parts:
                                            # Check if this part contains text
                                            if hasattr(part, 'text') and part.text:
                                                openai_chunk = {
                                                    "id": "chatcmpl-" + str(hash(str(part.text)))[:10],
                                                    "object": "chat.completion.chunk",
                                                    "created": int(time.time()),
                                                    "choices": [{
                                                        "index": 0,
                                                        "delta": {"content": part.text},
                                                        "finish_reason": None
                                                    }]
                                                }
                                                yield f"data: {json.dumps(openai_chunk)}\n\n"
                                                combined_chunks = combined_chunks + part.text
                        # Backwards compatibility - try direct text access if needed
                        elif hasattr(chunk, 'text') and chunk.text:
                            openai_chunk = {
                                "id": "chatcmpl-" + str(hash(str(chunk.text)))[:10],
                                "object": "chat.completion.chunk",
                                "created": int(time.time()),
                                "choices": [{
                                    "index": 0,
                                    "delta": {"content": chunk.text},
                                    "finish_reason": None
                                }]
                            }
                            yield f"data: {json.dumps(openai_chunk)}\n\n"
                    except Exception as e:
                        logger.exception("[platform_router | chat_completions] | streaming :: Error processing chunk: %s", str(e))
                        # Continue with the next chunk instead of stopping
                        continue                               

                logger.info("[platform_router | chat_completions] | streaming :: Streaming completed")
                                
                # save this session exchange object for final analysis 
                with get_db_session() as db: 
                    new_session_exchange = SessionExchange(
                        user_id = user_id,
                        session_id = session_id,
                        data = {
                            "candidate" : candidate_latest_message,
                            "interviewer" : combined_chunks
                        },
                        exchange_metadata = per_chunk_llm_metadata
                    )
                    
                    db.add(new_session_exchange)
                    db.commit()
                
                
                yield "data: [DONE]\n\n"
                
            except Exception as e:
                logger.exception("[platform_router | chat_completions] | streaming :: caught exception")
                error_chunk = {
                    "error": str(e)
                }
                yield f"data: {json.dumps(error_chunk)}\n\n"
                
        return StreamingResponse(generate(), media_type='text/event-stream')
        
    except Exception as error:
        logger.exception("[platform_router | chat_completions] :: Error in /chat/completions")
        if req.stream:
            async def error_stream():
                yield f"data: {json.dumps({'error': 'Streaming Error'})}\n\n"
            return StreamingResponse(error_stream(), media_type='text/event-stream')                           


@platform_router.get("/session/end/{session_uuid}")
async def end_active_session_api(request: Request, session_uuid : str):
    try:
        
        with get_db_session() as db:
            session_data = db.query(Session).filter(Session.uuid == session_uuid).first()
            session_data.status = SessionStatusEnum.COMPLETED.value
            db.commit() 
        
        return {"messsage" : f"session {session_uuid} successfully ended"}
    except Exception:
        logger.exception("[platform_router | end_active_sesion_api] :: caught exception")
        raise HTTPException(status_code=500)

async def get_note_sender_userid() -> Optional[str]:
    try:
        async with httpx.AsyncClient() as client:
            logger.info("[platform_router | get_note_sender_userid] :: fetching teamtailor users")
            response = await client.get(
                "https://api.teamtailor.com/v1/users",
                headers={
                    "Authorization": f"Token token={config.TEAM_TAILER_API_KEY}",
                    "X-Api-Version": config.TEAMTAILOR_API_VERSION
                }
            )
            
            if response.status_code >= 300:
                logger.error("[platform_router | get_note_sender_userid] :: teamtailor users API failed with status code: %s", response.status_code)
                return None
                
            users_data = response.json()
            data = users_data.get("data", [])
            
            if not data:
                logger.warning("[platform_router | get_note_sender_userid] :: no users found in teamtailor response")
                return None
            
            for user in data:
                email = user.get("attributes", {}).get("email", "")
                if email and "@juggy.ai" in email:
                    logger.info("[platform_router | get_note_sender_userid] :: found @juggy.ai user with id: %s", user.get("id"))
                    return user.get("id")
            
            first_user_id = data[0].get("id")
            logger.info("[platform_router | get_note_sender_userid] :: no @juggy.ai user found, using first user with id: %s", first_user_id)
            return first_user_id
            
    except Exception as e:
        logger.exception("[platform_router | get_note_sender_userid] :: caught exception while fetching teamtailor users")
        return None

# to analyse as session and generate the interview report
@platform_router.get("/ent/session/analyse/{session_uuid}")
async def analyse_session_data_api(request: Request, session_uuid : str):
    try: 
        analysed_result = None
        candidate_id = None
        
        logger.info("[platform_router | analyse_session_data_api] :: analysing session data for session_uuid: %s", session_uuid)
        
        with get_db_session() as db:
            selected_session = db.query(Session).filter(Session.uuid == session_uuid).first()
            all_session_exchange_data = db.query(SessionExchange).filter(SessionExchange.session_id == selected_session.id).order_by(SessionExchange.created_at).all()
            
            interview_exchanges = [this_exchange.data for this_exchange in all_session_exchange_data]
            
            args = {
                "context" : {
                    "interview_flow" : interview_exchanges,
                    "interview_main_questions" : selected_session.session_questions,
                },
                "name" : selected_session.session_metadata.get("analysis_agent","ent_interview_analysis_agent") if selected_session.session_metadata else "ent_interview_analysis_agent"
            }
            
            result = ent_analyse_interview_workflow(args) 
            logger.info("[platform_router | analyse_session_data_api] :: analysis report created")
            analysed_result = result #f"The overall Score for the candidate from the screening interview is {result["overall_score"]} / 100"
            candidate_id = selected_session.session_metadata.get("candidate_id") if selected_session.session_metadata else None

        if not candidate_id:
            logger.error("[platform_router | analyse_session_data_api] :: candidate_id not found in session metadata")
            return
        
        note_sender_user_id = await get_note_sender_userid()
        
        if note_sender_user_id:
            teamtailor_payload = {
                "data": {
                    "type": "notes",
                    "attributes": {
                        "note": analysed_result,
                        "private-note": True
                    },
                    "relationships": {
                        "candidate": {
                            "data": {
                                "id": candidate_id,
                                "type": "candidates"
                            }
                        },
                        "user": {
                            "data": {
                                "id": note_sender_user_id,
                                "type": "users"
                            }
                        }
                    }
                }
            }

            async with httpx.AsyncClient() as client:
                logger.info("[platform_router | analyse_session_data_api] :: sending analysis to teamtailor")
                response = await client.post(
                    "https://api.teamtailor.com/v1/notes",
                    headers={
                        "Authorization": f"Token token={config.TEAM_TAILER_API_KEY}",
                        "X-Api-Version": config.TEAMTAILOR_API_VERSION,
                        "Content-Type": "application/vnd.api+json"
                    },
                    json=teamtailor_payload
                )
                logger.info("[platform_router | analyse_session_data_api] :: teamtailor response status code: %s", response.status_code)
                if response.status_code >= 300:
                    logger.exception("[platform_router | analyse_session_data_api] :: failed to send session summary to teamtailor, session id = %s", session_uuid)
                    
        else:
            logger.error("[platform_router | analyse_session_data_api] :: no user id found to send the session summary report to teamtailor")

        with get_db_session() as db:
            selected_session = db.query(Session).filter(Session.uuid == session_uuid).first()
            selected_session.status = SessionStatusEnum.ANALYSED.value
            selected_session.summary = analysed_result
            db.commit()
            
        return {"message": "analysis completed successfully."}
    except Exception:
        logger.exception("[platform_router | analyse_session_data_api] :: caught exception")
        raise HTTPException(status_code=500)
 
@platform_router.get("/session/analyse/{session_uuid}")
async def analyse_session_data_api(request: Request, session_uuid : str):
    try: 
        
        analysed_result = None
        with get_db_session() as db:
            selected_session = db.query(Session).filter(Session.uuid == session_uuid).first()
            all_session_exchange_data = db.query(SessionExchange).filter(SessionExchange.session_id == selected_session.id).order_by(SessionExchange.created_at).all()
            
            last_session_data = db.query(Session).filter(Session.user_id == selected_session.user_id, Session.created_at < selected_session.created_at).order_by(Session.created_at).first()

            interview_exchanges = [this_exchange.data for this_exchange in all_session_exchange_data]
            
            args = {
                "interview_flow" : interview_exchanges,
                "interview_main_questions" : selected_session.session_questions
            }
            
            result = analyse_interview_workflow(args) 
            
            analysed_result = {
                **result,
                "last_interview_values": {
                    "patience": last_session_data.summary["patience"] or 0,
                    "preparedness": last_session_data.summary["preparedness"] or 0,
                    "confidence": last_session_data.summary["confidence"] or 0,
                    "fluency": last_session_data.summary["fluency"] or 0
                } if last_session_data else {}
            }
            
            selected_session.status = SessionStatusEnum.ANALYSED.value
            selected_session.summary = analysed_result
            db.commit()
            
        return analysed_result
    except Exception:
        logger.exception("[platform_router | analyse_session_data_api] :: caught exception")
        raise HTTPException(status_code=500)
    
    
# to get all the active session list 
@platform_router.get("/session/to-analyse")
async def get_all_active_sessions_api(request: Request):
    try:
        user_uuid = request.state.bearer_token
        response_data = []
        with get_db_session() as db:
            user_data = db.query(User).filter(User.uuid == user_uuid).first()
            all_session_data = db.query(Session).filter(Session.user_id == user_data.id , Session.status != SessionStatusEnum.ANALYSED.value).all()
            
            for session_data in all_session_data:
                response_data.append({
                    "sessionId" : session_data.uuid,
                    "sessionStatus" : session_data.status,
                    "sessionMainQuestions" : session_data.session_questions,
                })
            
        return response_data
    
    except Exception: 
        logger.exception("[platform_router | get_all_active_sessions_api] :: caught exception")
        raise HTTPException(status_code=500)
        
# get all the existing uploaded media of the user 
@platform_router.get("/media/get/{userId}")
async def get_all_existing_user_media_api(request: Request, userId : str):
    try: 
        user_uuid = request.state.bearer_token
        response_data = []
        with get_db_session() as db: 
            user_data = db.query(User).filter(User.uuid == userId).first()
            all_user_media = db.query(Upload).filter(Upload.user_id == user_data.id).all()
            
            for user_media in all_user_media:
                response_data.append({
                    "fileName" : user_media.file_name,
                    "mediaId" : user_media.uuid
                })
                
        return response_data
    except Exception: 
        logger.exception("[platform_router | get_all_existing_user_media] :: caught exception")
        raise HTTPException(status_code=500)
            
            
# get current session status api 
@platform_router.get("/session/status/{session_id}")
async def get_session_status_api(request: Request, session_id : str): 
    try: 
        user_uuid = request.state.bearer_token
        current_status = None
        session_used_credits = None
        session_start_time = None
        user_credits = None
        session_questions = None
        with get_db_session() as db: 
            session_data = db.query(Session).filter(Session.uuid == session_id).first() 
            user_data = db.query(User).filter(User.id == session_data.user_id).first()
            current_status = session_data.status
            session_used_credits = session_data.used_credits
            user_credits = user_data.credits
            session_start_time = session_data.created_at
            session_questions = session_data.session_questions
            
            
        return {
            "sessionStatus" : current_status, 
            "sessionUsedCredits" : session_used_credits, 
            "sessionStartTime" : session_start_time, 
            "userCredits" : user_credits,
            "sessionQuestions" : session_questions
        }
         
    except Exception: 
        logger.exception("[platform_router | get_session_status_api] :: caught exception")
        raise HTTPException(status_code=500)


@platform_router.get("/session/get/{current_page}")
async def get_dashboard_data_api(request: Request, current_page : int): 
    try: 
        session_fetch_limit = 5
        user_uuid =  request.state.bearer_token
        response_data = {}
        with get_db_session() as db: 
            asking_user = db.query(User).filter(User.uuid == user_uuid).first() 
            all_user_sessions = db.query(Session).filter(
                Session.user_id == asking_user.id
                ).order_by(Session.created_at.desc()).limit(
                    session_fetch_limit
                    ).offset(
                        (current_page - 1) * session_fetch_limit
                        )
            total_sessions_count = db.query(func.count(Session.id)).filter(Session.user_id == asking_user.id).scalar()
            
            response_data["interview_sessions"] = [{
                "sessionId" : user_session.uuid,
                "sessionStatus" : user_session.status,
                "sessionCredits" : user_session.used_credits,
                "sessionContext" : user_session.contexts,
                "sessionMainQuestions" : user_session.session_questions, 
                "sessionSummary" : user_session.summary,
                "createdAt" : user_session.created_at,
                } for user_session in all_user_sessions] 
            
            response_data["totalPages"] = (int(total_sessions_count or 0) // session_fetch_limit)
            
        return response_data
    except Exception: 
        logger.exception("[platform_router | get_dashboard_data_api ] :: caught exception ")
        raise
    
@platform_router.get("/session/get/exchanges/{session_uuid}")
async def get_session_exchanges_api(req: Request, session_uuid : str):
    try:
        user_uuid =  req.state.bearer_token
        response_data = None
        
        with get_db_session() as db:
            asking_user = db.query(User).filter(User.uuid == user_uuid).first()
            selected_session = db.query(Session).filter(Session.uuid == session_uuid).first()
            all_session_exchanges = db.query(SessionExchange).filter(
                SessionExchange.user_id == asking_user.id,
                SessionExchange.session_id == selected_session.id
                ).order_by(SessionExchange.created_at).all()           
            
            aggregated_exchange_data = [{
                "exchangePiece" : session_exchange_piece.data,
                "createdAt" : session_exchange_piece.created_at,
                } for session_exchange_piece in all_session_exchanges]
            
        response_data = {
            "sessionId" : session_uuid,
            "sessionExchanges" : aggregated_exchange_data,
        }
            
        return response_data   
                 
    except Exception: 
        logger.exception("[platform_router | get_session_exchanges_api] :: caught exception")
        raise
