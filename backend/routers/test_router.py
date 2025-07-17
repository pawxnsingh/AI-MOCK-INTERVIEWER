import json
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from starlette.responses import StreamingResponse
import logging
import time
from models.base import get_db_session
from models.agents import Agent

from models.uploads import Upload
from models.parsed_results import ParsedResult
from models.sessions import Session
from models.session_exchanges import SessionExchange
from services.agent_services import AgentServices
from utils.llm_helper import generate_with_gemini
from utils.datetime_helper import StandardDT
import requests


test_router = APIRouter(prefix="/tester", tags=["tester"])
logger = logging.getLogger(__name__)

@test_router.post("/gemini-stream")
async def gemini_stream(request: Request):
    body = await request.json()
    main_prompt = "You are an expert product manager interview agent. Your goal is to ask the given question and let the candidate give an answer. The candidate might give a partial answer or might ask followup question, now based on these you should intellegently walk the candidate through the question based on their followup question or partial answer on how to proceed from here onwards just alike an expert product manager interviewer but always sticking to the topic. You need to keep the interview engaging and not boring. Your tone should be friendly and mentoring.\n\n  You will get the main interview question and previously exchanged conversation between you and the candidate as context always with the candidates current reply. \n  \n#### Note: always try to answer back in short and precise sentences of about max 5 sentences."
    data = body.get("data", "")
    
    prompt = main_prompt + f"context : {data}"
    if not prompt:
        return {"error": "Missing prompt"}

    gen = generate_with_gemini(
        prompt=prompt,
        model="gemini-2.0-flash",
        stream=True,
    )

    async def event_generator():
        try:
            async for msg in gen:
                text = getattr(msg, "text", None)
                if text is None:
                    candidate = msg.candidates[0]
                    text = "".join(part.text for part in candidate.content.parts)
                yield text
        except Exception as e:
            logger.error("Error in Gemini stream: %s", e)
            return

    return StreamingResponse(
        event_generator(),
        media_type="text/plain; charset=utf-8",
        headers={
            "Transfer-Encoding": "chunked",
            "X-Accel-Buffering": "no",
        },
    )

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

@test_router.post("/chat")
async def chat_completions(req: ChatCompletionRequest):
    try:
        call_id = None
        # Check if there's a call_id field in the request or any custom fields that might contain it
        if hasattr(req, 'call') and req.call.id:
            # The call_id field might contain call_id information
            call_id = req.call.id   
            
        # get the controlUrl from monitor 
        call_control_url = req.call.monitor.controlUrl if req.call and req.call.monitor else None  
        
        current_candidate_message = req.messages[-1]
        
        question_gen_agent_config = {
            "name" : "interviewer_agent",
            "context" : {
                "interview_main_question" : "",
                "previous_conversation" : [],
                "candidate_reply" : current_candidate_message
            }
        }        
        
        system_instruction = None
        
        with  get_db_session() as db:
            interview_agent = db.query(Agent).filter(Agent.name.startswith("interviewer_agent"), Agent.is_active == True).first()
            system_instruction = interview_agent.prompt
            
            
        
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
                print('gemini message :: ', gemini_messages)
                
                stream = generate_with_gemini(
                    prompt=gemini_messages,
                    model="gemini-2.0-flash",
                    stream=True,
                    system_instruction=system_instruction,
                )
                
                combined_chunks = []
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
                                                combined_chunks.append(part.text)
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
                        logger.exception("[chat_completions] | streaming :: Error processing chunk: %s", str(e))
                        # Continue with the next chunk instead of stopping
                        continue                               

                logger.info("[chat_completions] | streaming :: Streaming completed")
                yield "data: [DONE]\n\n"
                
            except Exception as e:
                logger.exception("[chat_completions] | streaming :: caught exception")
                error_chunk = {
                    "error": str(e)
                }
                yield f"data: {json.dumps(error_chunk)}\n\n"
                
        # Return streaming response
        return StreamingResponse(generate(), media_type='text/event-stream')
        
    except Exception as error:
        logger.exception("[chat_completions] :: Error in /chat/completions")
        if req.stream:
            async def error_stream():
                yield f"data: {json.dumps({'error': 'Streaming Error'})}\n\n"
            return StreamingResponse(error_stream(), media_type='text/event-stream')                           
 
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
    mediaId : str
    otherContext : otherContextType

@test_router.post("/interview/prepare")  
async def create_interview_questions_api(req: createInterviewQuestionsApiReq):
    try:
        # goal :: create a new session id and craft all the questions for the session and save in the session metadata
        media_uuid = req.mediaId
        other_context = req.otherContext
        
        response_data = None
        
        with get_db_session() as db:
            media_data = db.query(Upload).filter(Upload.uuid == media_uuid).first()
            parsing_metadata = media_data.parsing_metadata
            
            if parsing_metadata.get("parsing_status", "") == "COMPLETED":
                # get the parsed result 
                parsed_results_data = db.query(ParsedResult).filter(ParsedResult.source_id == media_uuid).first()
                
                # setup the resume structuring agent config 
                resume_structuring_agent_config = {
                    "name" : "resume_structuring_agent",
                    "context" : {
                        "parsed_resume" : parsed_results_data.raw_result
                    }
                }
            
                structured_resume, _ = AgentServices.generic_agent(resume_structuring_agent_config)
                
                # setup the question gen agent config 
                question_gen_agent_config = {
                    "name" : "question_gen_agent",
                    "context" : {
                        "candidate_resume" : structured_resume,
                        "candidates_other_contexts" : other_context,
                    }
                }
                
                
                generated_questions, _ = AgentServices.generic_agent(question_gen_agent_config)
                
                name_key = media_uuid + StandardDT.get_iso_dt_string()
                
                session_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name_key))
                
                # create a new session and save the generated questions against it 
                new_session = Session(
                    user_id = media_data.user_id,
                    uuid = session_uuid,
                    session_metadata = generated_questions,
                    status = "CREATED"
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
    
    except Exception as e:
        raise HTTPException(status_code=500)
    
class startInterviewSessionApiReq(BaseModel):
    sessionId : str
    selectedQuestion : str
    
@test_router.post("/start/session")
async def start_interview_session_api(req: startInterviewSessionApiReq):
    try:
        # goal :: get the session id and the selected question , this should create the vapi call, initialize the interview agent 
        # then return the call id for the frontend to connect with the interview agent backend via vapi 
        
        session_id = req.sessionId
        selected_question = req.selectedQuestion
        
        create_call_url = "https://api.vapi.ai/call"
        headers =  {
            'Authorization': 'Bearer 6f39bb6f-599b-45d2-95f3-c548a6626395',
            'Content-Type': 'application/json'
        }
        
        
        # note :: required vapi body :: "Couldn't Get Assistant. Need Either `assistant`, `assistantId`, `squad`, Or `squadId`.",
        
        data = {
            "assistantId": "cfd12150-2c72-4bea-b9f7-ff19d8d7b83c",
            # "phoneNumberId": "13773804-41b4-4e6b-afca-4ea3ae3e1fc9",          
            # "metadata": {
            #     "sessionId" : session_id,
            #     "selectedQuestion" : selected_question
            # }
        }
        
        try: 
            raw_response = requests.post(url=create_call_url, headers=headers, data=json.dumps(data))
            
            result = raw_response.json()
            
            print("vapi call start response :: ")
            print("------------------")
            print(result)
            print("------------------")
            
            return result 
        except Exception as e: 
            return {"message": "failed to start vapi call", "error" : str(e)}
        
    except Exception: 
        raise HTTPException(status_code=500)
    
    
