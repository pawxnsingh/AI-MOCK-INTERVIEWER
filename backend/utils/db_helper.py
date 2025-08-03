import logging
from typing import Optional
from fastapi import HTTPException
from models.base import get_db_session
from models.uploads import Upload

logger = logging.getLogger(__name__)

def get_media_id_from_uuid(media_uuid: str) -> int:
    with get_db_session() as db:
        upload = db.query(Upload).filter(Upload.uuid == media_uuid).first()
        
        if not upload:
            logger.error(f"Media not found for UUID: {media_uuid}")
            raise HTTPException(status_code=404, detail=f"Media not found for UUID: {media_uuid}")
        
        return upload.id

def get_media_uuid_from_id(media_id: int) -> str:
    with get_db_session() as db:
        upload = db.query(Upload).filter(Upload.id == media_id).first()
        
        if not upload:
            logger.error(f"Media not found for ID: {media_id}")
            raise HTTPException(status_code=404, detail=f"Media not found for ID: {media_id}")
        
        return upload.uuid

def get_upload_by_uuid(media_uuid: str) -> Optional[Upload]:
    with get_db_session() as db:
        return db.query(Upload).filter(Upload.uuid == media_uuid).first()

def get_upload_by_id(media_id: int) -> Optional[Upload]:
    with get_db_session() as db:
        return db.query(Upload).filter(Upload.id == media_id).first()
