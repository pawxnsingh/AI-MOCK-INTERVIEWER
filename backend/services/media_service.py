import logging
import uuid
import json
import mimetypes
from pathlib import Path
from typing import Dict, Any
from models.users import User
from utils.datetime_helper import StandardDT
import hashlib
from models.uploads import Upload
from models.base import get_db_session
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)

class MediaManagementService:
    MEDIA_MAP_FILE = "data/raw/mediaMap.json"

    @staticmethod
    def ingest_media(file_binary: bytes, file_name: str, user_uuid: str, to_parse: bool = False):
        """
        Ingests a media file by:
        1. Extracting metadata (mime type, created/modified date, etc.)
        2. Creating a deterministic UUID based on file properties
        3. Saving the file to data/raw directory
        4. Returning the UUID on successful save
        
        Args:
            file_binary: The binary content of the file
            file_name: The name of the file
            vendor_id: The ID of the vendor
            
        Returns:
            Dictionary containing the deterministic UUID and metadata
        """
        try:            
            file_hash = hashlib.sha256(file_binary).hexdigest()
            
            mime_type, _ = mimetypes.guess_type(file_name)
            
            if not mime_type:
                mime_type = "application/octet-stream"
                
            now_dt = StandardDT.get_iso_dt()
            created_at = now_dt
            modified_at = now_dt
            
            base_dir = Path("data/raw")

            hash_unique_key = file_hash + user_uuid # linking user uuid with the hash so same file uploaded by different users get attached to only them
            media_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, hash_unique_key))
            
            # Use UUID as filename to prevent duplicates
            save_path = base_dir / f"{media_uuid}-{file_name}"
            
            metadata = {
                "file_name": file_name,
                "mime_type": mime_type,
                "created_at": str(created_at),
                "modified_at": str(modified_at),
                "file_path": str(save_path),
                "file_size": len(file_binary),
                "file_hash": file_hash
            }
            
                   
            if save_path.exists():
                with open(save_path, "rb") as f:
                    existing_hash = hashlib.sha256(f.read()).hexdigest()
                if existing_hash == file_hash:
                    logger.info("[MediaManagementService | ingest_media] File already exists with same content")
                    return True , {
                        "mediaId": media_uuid,
                        "metadata": metadata
                    }
            
            # Write new or modified file
            with open(save_path, "wb") as f:
                f.write(file_binary)

            logger.info("[MediaManagementService | ingest_media] Successfully saved file at: %s", save_path)
            
            # Save media mapping
            MediaManagementService._save_media_mapping(media_uuid, metadata)
            try: 
                with get_db_session() as db:
                    user_data = db.query(User).filter(User.uuid == user_uuid).first()
                    
                    new_upload = Upload(
                        user_id= user_data.id,
                        uuid=media_uuid,
                        file_name=file_name,
                        download_path=str(save_path),
                        to_parse=to_parse,
                        uploads_metadata=metadata
                        )
                    
                    db.add(new_upload)
                    db.commit()
                        
                return False, {
                    "mediaId": media_uuid,
                    "metadata": metadata
                }
            except IntegrityError:
                logger.info("[MediaManagementService | ingest_media] :: media already exists in db so deleting hard copy")
                MediaManagementService.delete_media(media_uuid)
                return True , {
                    "mediaId": media_uuid,
                    "metadata": metadata
                }
            except Exception:
                raise              
            
        except Exception as e:
            logger.exception("[MediaManagementService | ingest_media] Error ingesting media file ")
            MediaManagementService.delete_media(media_uuid)
            raise e

    @staticmethod
    def _save_media_mapping(media_uuid: str, metadata: Dict[str, Any]) -> None:
        """
        Save media file mapping to mediaMap.json
        
        Args:
            media_uuid: The UUID of the media file
            metadata: Dictionary containing file metadata
        """
        try:
            media_map_path = Path(MediaManagementService.MEDIA_MAP_FILE)
            
            media_map_path.parent.mkdir(parents=True, exist_ok=True)
            
            if media_map_path.exists():
                with open(media_map_path, 'r') as f:
                    media_map = json.load(f)
            else:
                media_map = {}
            
            media_map[media_uuid] = metadata
            
            with open(media_map_path, 'w') as f:
                json.dump(media_map, f, indent=2)
                
            logger.info("[MediaManagementService | _save_media_mapping] Updated media mapping for UUID: %s", media_uuid)
            
        except Exception as e:
            logger.exception("[MediaManagementService | _save_media_mapping] Error saving media mapping")
            raise e

    @staticmethod
    def get_media_metadata(media_uuid: str) -> Dict[str, Any]:
        """
        Retrieve media metadata from mediaMap.json by media UUID
        
        Args:
            media_uuid: The UUID of the media file
            
        Returns:
            Dictionary containing the media metadata
            
        Raises:
            FileNotFoundError: If mediaMap.json doesn't exist
            KeyError: If media_uuid is not found in the mapping
        """
        try:
            media_map_path = Path(MediaManagementService.MEDIA_MAP_FILE)
            
            if not media_map_path.exists():
                logger.error("[MediaManagementService | get_media_metadata] Media map file not found")
                raise FileNotFoundError("Media map file not found")
            
            with open(media_map_path, 'r') as f:
                media_map = json.load(f)
            
            if media_uuid not in media_map:
                logger.error("[MediaManagementService | get_media_metadata] Media UUID not found: %s", media_uuid)
                raise KeyError(f"Media UUID not found: {media_uuid}")
            
            return media_map[media_uuid]
            
        except Exception as e:
            logger.exception("[MediaManagementService | get_media_metadata] Error retrieving media metadata")
            raise e

    @staticmethod
    def get_media_file(media_uuid: str) -> bytes:
        """
        Retrieve the binary content of a media file using its UUID
        
        Args:
            media_uuid: The UUID of the media file
            
        Returns:
            bytes: The binary content of the file
            
        Raises:
            FileNotFoundError: If the media file or mediaMap.json doesn't exist
            KeyError: If media_uuid is not found in the mapping
        """
        try:
            metadata = MediaManagementService.get_media_metadata(media_uuid)
            file_path = Path(metadata["file_path"])
            
            if not file_path.exists():
                logger.error("[MediaManagementService | get_media_file] Media file not found at path: %s", file_path)
                raise FileNotFoundError(f"Media file not found at path: {file_path}")
            
            with open(file_path, "rb") as f:
                file_binary = f.read()
                
            file_hash = hashlib.sha256(file_binary).hexdigest()
            if file_hash != metadata["file_hash"]:
                logger.error("[MediaManagementService | get_media_file] File hash mismatch for UUID: %s", media_uuid)
                raise ValueError("File integrity check failed: hash mismatch")
                
            return file_binary
            
        except Exception as e:
            logger.exception("[MediaManagementService | get_media_file] Error retrieving media file")
            raise e

    @staticmethod
    def delete_media(media_uuid: str) -> None:
        """
        Delete a media file and its metadata
        
        Args:
            media_uuid: The UUID of the media file
            vendor_id: The ID of the vendor
            
        Raises:
            FileNotFoundError: If the media file or mediaMap.json doesn't exist
            KeyError: If media_uuid is not found in the mapping or unauthorized access
            ValueError: If unable to delete the file
        """
        try:
            metadata = MediaManagementService.get_media_metadata(media_uuid)
            file_path = Path(metadata["file_path"])
            
            if file_path.exists():
                try:
                    file_path.unlink()  # Delete the file
                except Exception as e:
                    logger.error("[MediaManagementService | delete_media] Failed to delete file: %s", str(e))
                    raise ValueError(f"Failed to delete file: {str(e)}")
                
            media_map_path = Path(MediaManagementService.MEDIA_MAP_FILE)
            with open(media_map_path, 'r') as f:
                media_map = json.load(f)
            
            del media_map[media_uuid]
            
            with open(media_map_path, 'w') as f:
                json.dump(media_map, f, indent=2)
                
            logger.info("[MediaManagementService | delete_media] Successfully deleted media file and metadata for UUID: %s", media_uuid)
            
        except Exception as e:
            logger.exception("[MediaManagementService | delete_media] Error deleting media")
            raise e

    @staticmethod
    def get_media_content(media_uuid: str) -> Dict[str, Any]:
        """
        Get media content as UTF-8 string along with its metadata
        
        Args:
            media_uuid: The UUID of the media file
            vendor_id: The ID of the vendor
            
        Returns:
            Dictionary containing content and metadata
            
        Raises:
            FileNotFoundError: If the media file doesn't exist
            KeyError: If media_uuid is not found or unauthorized access
            UnicodeDecodeError: If the file cannot be decoded as UTF-8
        """
        try:
            metadata = MediaManagementService.get_media_metadata(media_uuid)
            
            file_binary = MediaManagementService.get_media_file(media_uuid)
            
            try:
                content = file_binary.decode('utf-8')
            except UnicodeDecodeError as e:
                logger.error("[MediaManagementService | get_media_content] File is not valid UTF-8: %s", str(e))
                raise ValueError("File content is not valid UTF-8 text")
            
            return {
                "content": content,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.exception("[MediaManagementService | get_media_content] Error getting media content")
            raise e
              