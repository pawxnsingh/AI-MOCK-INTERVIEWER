from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pydantic import BaseModel

from services.workflow_services import analyse_interview_workflow, interview_preparation_workflow, live_interview_workflow


workflow_router = APIRouter()

class interviewPreparationWorklowReq(BaseModel):
    parsed_resume: str
    other_context: dict

@workflow_router.post("/workflow/interview/prepare/test")
def interview_preparation_workflow_api(req: interviewPreparationWorklowReq):
    try:
        args = {
            "parsed_resume" : req.parsed_resume,
            "other_context" : req.other_context
        }
        result = interview_preparation_workflow(args)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class liveInterviewRunApiReq(BaseModel):
    mainQuestion: str
    previousConversationList: list[dict]
    candidateReply: str    
    
@workflow_router.post("/workflow/interview/run/test")
async def live_interview_run_api(req : liveInterviewRunApiReq):
    try: 
        
        args = {
            "mainQuestion" : req.mainQuestion,
            "previousConversationList" : req.previousConversationList,
            "candidateReply" : req.candidateReply
        }
        result = live_interview_workflow(args)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

class analyseInterviewWorkflowApiReq(BaseModel):
    mainQuestion : str
    interviewExchanges: list[dict]    
    
@workflow_router.post("/workflow/analyse-interview/test")
async def analyse_interview_workflow_api(req: analyseInterviewWorkflowApiReq):
    try: 
        
        args = {
            "interviewExchanges" : req.interviewExchanges,
            "mainQuestion" : req.mainQuestion
        }
        
        result = analyse_interview_workflow(args)
        
        return result 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    