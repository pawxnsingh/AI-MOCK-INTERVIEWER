from services.agent_services import AgentServices
import logging


logger = logging.getLogger(__name__)



def interview_preparation_workflow(args: dict):
    try:
        logger.info(f"[interview_preparation_workflow] :: received input data :: {args}")
        
        parsed_resume = args.get("parsed_resume", None)
        other_context = args.get("other_context", None)
        
        structured_resume = None
        
        if parsed_resume:
            resume_structuring_agent_config = {
                "name" : "resume_structuring_agent",
                "context" : {
                    "parsed_resume" : parsed_resume
                }
            }
            
            structured_resume, _ = AgentServices.generic_agent(resume_structuring_agent_config)
        
        question_gen_agent_config = {
            "name" : "question_gen_agent",
            "context" : {
                "candidate_resume" : structured_resume,
                "candidates_other_contexts" : other_context,
            }
        }
        
        generated_questions, _ = AgentServices.generic_agent(question_gen_agent_config)
        
        return generated_questions
    
    except Exception:
        logger.exception('[interview_preparation_workflow] :: caught exception')
        raise
    
    
def live_interview_workflow(args: dict):
    try:
        main_question = args.get("mainQuestion")
        previous_conversation_list = args.get("previousConversationList", [])
        candidate_reply = args.get("candidateReply")
        
        live_interviewer_agent_config = {
            "name" : "interviewer_agent",
            "context" : {
                "interview_main_question" : main_question,
                "previous_conversation" : previous_conversation_list,
                "candidate_reply" : candidate_reply
            }
        }
        
        result, _ = AgentServices.generic_agent(live_interviewer_agent_config)
        
        previous_conversation_list.append({
            "candidate" : candidate_reply,
            "interviewer" : result
        })
                
        return previous_conversation_list
    except Exception:
        logger.exception("[live_interview_workflow] :: caught exception")
        raise
    
def analyse_interview_workflow(args: dict): 
    try: 
        
        interview_analysis_agent_config = {
            "name" : "interview_analysis_agent",
            "context" : args
        }
        
        result, _ = AgentServices.generic_agent(interview_analysis_agent_config) # save this llm metadata in session
        
        return result 
    except Exception:
        logger.exception("[analyse_interview_workflow] :: caught exception")
        raise 