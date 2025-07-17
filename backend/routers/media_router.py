from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from services.media_service import MediaManagementService
import logging

media_api_router = APIRouter(prefix="/media", tags=["media"])
logger = logging.getLogger(__name__)

@media_api_router.post("/upload")
async def upload_media_api(file: UploadFile = File(...), user_id: str = Form(...), to_parse: bool = Form(...)):
    """
    Upload a file to be ingested by the media management system.
    
    Args:
        file: The file to be uploaded
        
    Returns:
        JSONResponse with the media ID and metadata
    """
    try:
        # Read the file content
        file_content = await file.read()
        
        # Ingest the media file
        result = MediaManagementService.ingest_media(
            file_binary=file_content,
            file_name=file.filename,
            user_uuid=user_id,
            to_parse=to_parse
        )
        
        return result
    except Exception as e:
        logger.exception("[media_api_router | upload_media_api] Error uploading file: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")