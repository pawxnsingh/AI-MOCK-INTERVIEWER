import uuid
from models.agents import AGENT_NAME_SEPARATOR, Agent
import logging
from models.base import get_db_session
from utils.datetime_helper import StandardDT

logger = logging.getLogger(__name__)



class AgentManagementServices:
    
    @staticmethod
    def create_agent(args: dict):
        try:
            name = args.get("name")
            received_version = args.get("version", "1.0.0")
            prompt = args.get("prompt")
            
            version = received_version if received_version and received_version != "" else "1.0.0"
       
            llm_config = args.get("llmConfig",{
                "temperature" : 0.5,
                "model" : "gemini-2.0-flash",
                "provider" : "google"
            })
                        
            standardized_agent_name = f"{name}{AGENT_NAME_SEPARATOR}{version}"
            agent_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name=standardized_agent_name))
                
            new_agent = Agent(
                name=standardized_agent_name,
                uuid=agent_uuid,
                prompt=prompt,
                config=llm_config,
                is_active=False
            )
            
            with get_db_session() as db:
                is_agent_exists = db.query(Agent).filter(
                    Agent.name == new_agent.name, 
                    Agent.uuid == new_agent.uuid
                    ).first()
                
                if not is_agent_exists:                        
                    db.add(new_agent)
                    db.commit()
                    return True, {"message" : f"new agent {name} with version tag {version} created", "agent uuid" : agent_uuid}
                else:
                    return False, {"message" : f"agent with {name} and verion tag {version} already exists"}

        except Exception as e:
            logger.exception("[create_agent] :: caught exception")
            return


    @staticmethod
    def update_agent(args: dict):
        try:
            name = args.get("name", None)
            received_version = args.get("version", None)
            prompt = args.get("prompt", None)
            llm_config = args.get("llmConfig", None)
            
            version = received_version if received_version and received_version != "" else None
            
            if not name and not version:
                return False , {"message" : f"agent name and version is required"}
            
            standardized_agent_name = f"{str(name).strip()}{AGENT_NAME_SEPARATOR}{str(version).strip()}"
            agent_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name=standardized_agent_name))
            
            with get_db_session() as db:
                existing_agent = db.query(Agent).filter(Agent.uuid == agent_uuid).first()
                if existing_agent:
                    existing_agent.prompt = prompt if prompt != None else existing_agent.prompt
                    existing_agent.config = llm_config if llm_config != None else existing_agent.config
                    
                    db.commit()
                    return True, {"message" : f"agent successfully updated"}
                else:
                    existing_agent_name = db.query(Agent).filter(
                        Agent.name.startswith(str(name).strip())
                    ).all()
                    
                    if existing_agent_name and len(existing_agent_name) != 0:
                        # then create the new veriosn of this agent
                        args = {
                            "name" : name,
                            "prompt" : prompt,
                            "version" : version,
                            "llmConfig" : llm_config
                        }
                        AgentManagementServices.create_agent(args)
                        return True, {"message" : f"new version = {version} for agent = {name} created."}
                    
                    return False, {"message" : f"agent with {name} doesnt exist, create a new one instead"}    
            
        except Exception as e:
            logger.exception("[update_agent] :: caught exception")
            return

    @staticmethod
    def delete_agent(args: dict):
        """Delete an agent by id."""
        try:
            agent_uuid = args.get("agentUuid" ,None)
            with get_db_session() as db:
                agent = db.query(Agent).filter(Agent.uuid == agent_uuid).first()
                
                if not agent:
                    raise ValueError(f"Agent with id {agent_uuid} not found")
                
                # if its an active agent then cancel deleting
                if agent.is_active:
                    raise ValueError(f"this agent is currently active, so cannot delete unless another version is set as active")
                
                db.delete(agent)
                db.commit()
                return True
        except Exception as e:
            logger.exception("[AgentServices.delete_agent] :: caught exception")
            raise

    @staticmethod
    def get_agents():
        try:
            with get_db_session() as db:
                all_agents_data = db.query(Agent).all()
                all_agents = {}
                for agent in all_agents_data:
                    agent_name = agent.name.split(AGENT_NAME_SEPARATOR)[0]
                    agent_version = agent.name.split(AGENT_NAME_SEPARATOR)[1]
                    agent_data = {
                        "version" : agent_version,
                        "prompt" : agent.prompt,
                        "config" : agent.config,
                        "agentId" : agent.uuid,
                        "isActive" : agent.is_active,
                        "createdAt" : StandardDT.get_timestamp_from_iso_dt(agent.created_at),
                        "updatedAt" : StandardDT.get_timestamp_from_iso_dt(agent.updated_at)
                    }
                    
                    if not all_agents.get(agent_name, None): 
                        all_agents[agent_name] = [agent_data]
                    else: 
                        all_agents[agent_name].append(agent_data)

                return all_agents
        except Exception as e:
            logger.exception("[AgentServices.get_agent] :: caught exception")
            raise
        
    @staticmethod
    def set_agent_as_active(args: dict):
        try: 
            agent_name = args.get("name", None)
            agent_version = args.get("version", None)
            agent_uuid = args.get("agentUuid", None)
            
            if not agent_uuid:
                if agent_name and agent_version:
                    standardized_agent_name = f"{str(agent_name).strip()}{AGENT_NAME_SEPARATOR}{agent_version.strip()}"
                    agent_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, name=standardized_agent_name))
                else: 
                    return False, {"message" : "either agentId or agent name and version are required"}
             
            with get_db_session() as db:
                selected_agent = db.query(Agent).filter(Agent.uuid == agent_uuid).first()
                
                if not selected_agent:
                    return False, {"message" : f"No agent found, so keeping the default agent as active"}
                else: 
                    currently_active_agent = db.query(Agent).filter(
                        Agent.name.startswith(selected_agent.name.split(AGENT_NAME_SEPARATOR)[0]),
                        Agent.is_active == True
                        ).first()
                    
                    if currently_active_agent:
                        currently_active_agent.is_active = False
                        
                    selected_agent.is_active = True
                
                db.commit()
                         
            return True, {"message" : "Agent set as active"}        
        except Exception:
            logger.exception("[AgentServices.set_agent_as_active] :: caught exception")
            raise