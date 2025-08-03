from models.parsed_results import ParsedResult
from models.base import get_db_session
from models.sessions import Session
from utils.db_helper import get_media_id_from_uuid
import logging 
import json
from utils.datetime_helper import StandardDT

logger = logging.getLogger(__name__)

def retrieve_context(session_id: int) -> str:
    """
    Retrieves relevant context from the knowledge base for a given query and session.

    Args:
        session_id: The ID of the current session to scope the search.

    Returns:
        A string containing the retrieved context, or an empty string if no context is found.
    """
    logger.info(f"[tools | retrieve_context] :: Retrieving context for session: {session_id}")
    try:
        with get_db_session() as db: 
            this_session_data = db.query(Session).filter(Session.id == session_id).first()
            session_context = this_session_data.contexts
            context_dict = {}
            if session_context:
                try: 
                    context_dict = json.loads(session_context)
                except Exception: 
                    logger.warning("[tools | retrieve_context] :: could not parse session contexts")
            resume_media_id = context_dict.get('selected_resume_media_uuid', None)
            if not resume_media_id: 
                return context_dict
            
            resume_media_db_id = get_media_id_from_uuid(resume_media_id)
            parsed_result_data = db.query(ParsedResult).filter(ParsedResult.source_id == resume_media_db_id).first()
            context_dict["candidate_resume_data"] = parsed_result_data.structured_result
            return context_dict
        
    except Exception as e:
        logger.exception("[tools | retrieve_context] ::Error retrieving context:")
        return "There was an error retrieving context."




def main_question_setter(
    question: str,
    session_id: int,
    has_used_resume_context: bool,
    last_main_question_type: str
) -> bool:
    """
    Saves any of the newly generated main question of the ongoing interview against the session_id.

    Args:
        question: A newly generated main question for the ongoing interview.
        session_id: the session id of the interview.
        has_used_resume_context: Whether resume context was used for this question.
        last_main_question_type: 'resume' or 'hypothetical' indicating the type of main question.

    Returns:
        bool (True if the question was successfully saved into database or else False)
    """
    logger.info("[tools | main_question_setter] :: main question generated against session = %s, question = %s ", session_id, question)
    logger.info("[tools | main_question_setter] :: has_used_resume_context: %s", has_used_resume_context)
    logger.info("[tools | main_question_setter] :: last_main_question_type: %s", last_main_question_type)
    try: 
        with get_db_session() as db: 
            this_session = db.query(Session).filter(Session.id == session_id).first()
            if not this_session.session_questions:
                this_session.session_questions = [{ "question" : question, "createdAt" : StandardDT.get_iso_dt_string() }]
            else:
                updated_session_questions = [{"question" : question, "createdAt" : StandardDT.get_iso_dt_string() }]
                updated_session_questions.extend(this_session.session_questions or [])
                this_session.session_questions = updated_session_questions
                
            db.commit()
    except Exception as e:
        logger.exception("[tools | main_question_setter] :: Error saving main question:")
        return False

    return True
