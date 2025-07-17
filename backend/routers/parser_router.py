from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from services.parser_service import ParserService
from pydantic import BaseModel
import logging

parser_api_router = APIRouter(prefix="/parser", tags=["parser"])
logger = logging.getLogger(__name__)

class ParseDocumentRequest(BaseModel):
    mediaId: str

@parser_api_router.post("/parse")
async def parse_document_api(request: ParseDocumentRequest):
    """
    Parse a document using its media ID
    
    Args:
        request: ParseDocumentRequest containing mediaId
        
    Returns:
        JSONResponse with parsed document data
    """
    try:
        parsed_result = ParserService.parse_document(media_uuid=request.mediaId)
        # data = parsed_result[0]
        
        print("=======================")
        print(parsed_result)
        print("=======================")
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Document parsed successfully",
                "mediaId": request.mediaId,
                "parsedData": parsed_result
            }
        )
    except ValueError as e:
        logger.error("[ParserRouter | parse_document_api] Value error: %s", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except FileNotFoundError as e:
        logger.error("[ParserRouter | parse_document_api] File not found: %s", str(e))
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("[ParserRouter | parse_document_api] Error parsing document: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to parse document: {str(e)}")