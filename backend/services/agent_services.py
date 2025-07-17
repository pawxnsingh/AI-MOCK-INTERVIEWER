import json
from models.base import get_db_session
from utils.agent_return_types import AgentTypesEnum
from utils.llm_helper import generate_with_gemini
from models.agents import Agent
import logging

logger = logging.getLogger(__name__)


class AgentServices:
    
    @staticmethod
    def generic_agent(args: dict):
        try:
            agent_uuid = args.get("uuid", None)
            agent_name = args.get("name", None)
            input_context = args.get("context", None)

            agent_prompt = None
            response_type = None
            
            with get_db_session() as db:
                selected_agent = None
                
                if agent_name and not agent_uuid:
                    selected_agent = db.query(Agent).filter(
                    Agent.name.startswith(agent_name), 
                    Agent.is_active == True,
                    ).first()
                    
                    if not selected_agent:
                        logger.error("[generic_agent] :: Agent by name = %s does not exist", agent_name)
                        raise ValueError(f"Agent by name = {agent_name} does not exist")
                                
                else:
                    selected_agent = db.query(Agent).filter(Agent.uuid == agent_uuid).first()
                    if not selected_agent:
                        logger.error("[generic_agent] :: Agent by uuid = %s does not exist", agent_uuid)
                        raise ValueError(f"Agent by uuid = {agent_uuid} does not exist")
                            
                agent_prompt = selected_agent.prompt #if not input_context else f"{selected_agent.prompt}\n\n context = {input_context}"
                agent_name = selected_agent.name
                
                try:
                    response_type = AgentTypesEnum[agent_name.split("~@~")[0]]
                except Exception:
                    logger.info("[generic_agent] :: No response type defined for agent = %s, returning pure text response from llm", agent_name)
                
            logger.info("[generic_agent] :: calling agent : %s", agent_name)
            
            raw_response = None
            
            if response_type: 
                raw_response = generate_with_gemini(
                system_instruction=agent_prompt,
                stream=False,
                prompt=f"context = {input_context}",
                response_format=response_type.value
                )
            else :
                raw_response = generate_with_gemini(
                system_instruction=agent_prompt,
                stream=False,
                prompt=f"context = {input_context}",
                )      
            
            llm_response_metadata = {
                "is_streaming_response" : False,
                "model_version" : raw_response.model_version,
                "cached_content_token_count" : raw_response.usage_metadata.cached_content_token_count,
                "candidates_token_count" : raw_response.usage_metadata.candidates_token_count,
                "prompt_token_count" : raw_response.usage_metadata.prompt_token_count,
                "total_token_count" : raw_response.usage_metadata.total_token_count,
            }
            
            llm_result = None
            
            try:
                llm_result = json.loads(raw_response.text)
            except Exception:
                llm_result = raw_response.text
                
            return llm_result , llm_response_metadata
        
                        
        except Exception:
            logger.exception("[generic_agent] :: caught exception ")
            raise
        
        