from typing import Optional
from fastapi import APIRouter, HTTPException
from services.agent_management_services import AgentManagementServices
import logging
from pydantic import BaseModel

agent_management_router = APIRouter(prefix="/agents", tags=["agents"])
logger = logging.getLogger(__name__)


class createAgentApiReq(BaseModel):
    name: str
    prompt: str
    version: str
    llmConfig: Optional[dict]

@agent_management_router.post("/create")
async def create_agent_api(req: createAgentApiReq):
    """
    Create a new agent with the specified configuration.
    
    Args:
        request: CreateAgentRequest containing agent details
        
    Returns:
        JSONResponse with success status and agent information
    """
    try:
        args = {
            "name" : req.name,
            "prompt" : req.prompt,
            "version" : req.version,
            "llmConfig" : req.llmConfig
        }
        
        logger.info("[create_agent_api] :: received args = %s", args)
        _, result = AgentManagementServices.create_agent(args)
        
        if result is None:
            raise HTTPException(status_code=500, detail="Internal server error occurred while creating agent")
        
        return result
            
    except Exception as e:
        logger.exception("[create_agent_api] :: caught exception")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@agent_management_router.put("/update")
async def update_agent_api(request: dict):
    """
    Update an existing agent's configuration.
    
    Args:
        request: UpdateAgentRequest containing updated agent details
        
    Returns:
        JSONResponse with success status and update information
    """
    try:
        args = request
        _, result = AgentManagementServices.update_agent(args)
        
        if result is None:
            raise HTTPException(status_code=500, detail="Internal server error occurred while updating agent")
        
        return result
            
    except Exception as e:
        logger.exception("[update_agent_api] :: caught exception")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@agent_management_router.delete("/delete")
async def delete_agent_api(request: dict):
    """
    Delete an agent by UUID.
    
    Args:
        request: DeleteAgentRequest containing agent UUID
        
    Returns:
        JSONResponse with success status
    """
    try:
        args = request
        result = AgentManagementServices.delete_agent(args)
        
        if result:
            return result
        else:
            raise HTTPException(status_code=404, detail="Agent not found")
            
    except ValueError as ve:
        logger.error(f"[delete_agent_api] :: Agent not found: {str(ve)}")
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        logger.exception("[delete_agent_api] :: caught exception")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@agent_management_router.get("/")
async def get_all_agents_api():
    """
    Retrieve all agents from the database.
    
    Returns:
        JSONResponse with list of all agents
    """
    try:
        agents = AgentManagementServices.get_agents()
        
        return agents
        
    except Exception as e:
        logger.exception("[get_all_agents_api] :: caught exception")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@agent_management_router.get("/set-active/{agent_uuid}")
async def set_agent_as_active_api(agent_uuid: str):
    try:
        args = {"agentUuid" : agent_uuid}
        _, result = AgentManagementServices.set_agent_as_active(args)
        
        return result
        
    except Exception as e: 
        logger.exception("[set_agent_as_active_api] :: caught exception")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")