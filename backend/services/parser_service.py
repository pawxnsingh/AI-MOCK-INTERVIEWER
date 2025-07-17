import nest_asyncio

nest_asyncio.apply()

from llama_parse import LlamaParse
from services.media_service import MediaManagementService
from pathlib import Path

# sync
# documents = parser.load_data("./my_file.pdf")

# sync batch
# documents = parser.load_data(["./my_file1.pdf", "./my_file2.pdf"])

# async
# documents = await parser.aload_data("./my_file.pdf")

# # async batch
# documents = await parser.aload_data(["./my_file1.pdf", "./my_file2.pdf"])

# file_name = "my_file1.pdf"
# extra_info = {"file_name": file_name}

# with open(f"./{file_name}", "rb") as f:
#     # must provide extra_info with file_name key with passing file object
#     documents = parser.load_data(f, extra_info=extra_info)

# # you can also pass file bytes directly
# with open(f"./{file_name}", "rb") as f:
#     file_bytes = f.read()
#     # must provide extra_info with file_name key with passing file bytes
#     documents = parser.load_data(file_bytes, extra_info=extra_info)

# class ParserService:
    
#     @staticmethod
#     def parse_document(media_uuid: str):
#         """Parse a document synchronously given its media UUID"""
#         media_metadata = MediaManagementService.get_media_metadata(media_uuid)
#         file_path = media_metadata.get("file_path", None)
        
#         if not file_path:
#             raise ValueError(f"No file path found for media UUID: {media_uuid}")
        
#         if not Path(file_path).exists():
#             raise FileNotFoundError(f"File not found at path: {file_path}")
        
#         parsed_result = parser.load_data(file_path)
        
#         return parsed_result
    
#     @staticmethod
#     async def async_parse_document(media_uuid: str):
#         """Parse a document asynchronously given its media UUID"""
#         media_metadata = MediaManagementService.get_media_metadata(media_uuid)
#         file_path = media_metadata.get("file_path", None)
        
#         if not file_path:
#             raise ValueError(f"No file path found for media UUID: {media_uuid}")
        
#         if not Path(file_path).exists():
#             raise FileNotFoundError(f"File not found at path: {file_path}")
        
#         parsed_result = await parser.aload_data(file_path)
        
#         return parsed_result

import asyncio
import uuid
from pathlib import Path
from typing import Dict
from models.base import get_db_session
from models.parsed_results import ParsedResult
from models.uploads import Upload
from config import config
# Simulating a global job registry (in-memory; can be persisted if needed)
job_registry: Dict[str, Dict] = {}

class ParserService:

    @staticmethod
    def parse_document(media_uuid: str):
        parser = LlamaParse(
            api_key=config.LLAMAINDEX_API_KEY,  # can also be set in your env as LLAMA_CLOUD_API_KEY
            result_type="markdown",  # "markdown" and "text" are available
            num_workers=1,  # if multiple files passed, split in `num_workers` API calls
            verbose=True,
            language="en",  # Optionally you can define a language, default=en
        )
        """Synchronous fallback (unchanged)"""
        media_metadata = MediaManagementService.get_media_metadata(media_uuid)
        file_path = media_metadata.get("file_path", None)

        if not file_path:
            raise ValueError(f"No file path found for media UUID: {media_uuid}")
        if not Path(file_path).exists():
            raise FileNotFoundError(f"File not found at path: {file_path}")

        parsed_result_raw = parser.load_data(file_path)
        # parsed_result = parsed_result_raw[0].text
        
        complete_parsed_result = ""
        for pr in parsed_result_raw:
            complete_parsed_result = complete_parsed_result + " " + pr.text
            
        # print("complete parsed result ", complete_parsed_result)
        
        with get_db_session() as db:
            uploaded_data = db.query(Upload).filter(Upload.uuid == media_uuid).first()
            
            new_parsed_result = ParsedResult(
                user_id=uploaded_data.user_id,
                source_id=media_uuid,
                raw_result=complete_parsed_result,
                result_metadata={
                    "hash" : parsed_result_raw[0].hash,
                    "extra_info" : parsed_result_raw[0].extra_info,
                    "model_extra" : parsed_result_raw[0].model_extra
                }
            )
            
            uploaded_data.parsing_metadata = {
                "parsing_status" : "COMPLETED"
            }
            
            db.add(new_parsed_result)
            db.commit()   
                 
        return complete_parsed_result

    @staticmethod
    async def async_parse_document(media_uuid: str):
        """Immediately return job ID and run parsing in background"""
        job_id = str(uuid.uuid4())
        job_registry[job_id] = {"status": "pending", "result": None, "error": None}
        parser = LlamaParse(
            api_key=config.LLAMAINDEX_API_KEY,  # can also be set in your env as LLAMA_CLOUD_API_KEY
            result_type="markdown",  # "markdown" and "text" are available
            num_workers=1,  # if multiple files passed, split in `num_workers` API calls
            verbose=True,
            language="en",  # Optionally you can define a language, default=en
        )
        async def _run_background_parse():
            try:
                media_metadata = MediaManagementService.get_media_metadata(media_uuid)
                file_path = media_metadata.get("file_path", None)

                if not file_path:
                    raise ValueError(f"No file path found for media UUID: {media_uuid}")
                if not Path(file_path).exists():
                    raise FileNotFoundError(f"File not found at path: {file_path}")

                parsed_result_raw = await parser.aload_data(file_path)
                
                with get_db_session() as db:
                    uploaded_data = db.query(Upload).filter(Upload.uuid == media_uuid).first()
                    parsed_result = parsed_result_raw[0].text
                    
                    
                    
                    new_parsed_result = ParsedResult(
                        user_id=uploaded_data.user_id,
                        source_id=media_uuid,
                        raw_result=parsed_result,
                        result_metadata=parsed_result_raw
                    )
                    
                    uploaded_data.parsing_metadata = {
                        "parsing_status" : "COMPLETED",
                        "parsing_job_id" : job_id
                    }
                    
                    db.add(new_parsed_result)
                    db.commit()
                    
                print(f"[Job {job_id}] Parsing complete.")
            except Exception as e:
                
                with get_db_session() as db:
                    uploaded_data = db.query(Upload).filter(Upload.uuid == media_uuid).first()
                    uploaded_data.parsing_metadata = {
                        "parsing_status" : "FAILED",
                        "parsing_job_id" : job_id
                    }
                    db.commit()

                print(f"[Job {job_id}] Failed: {e}")

        # Schedule the background task
        asyncio.create_task(_run_background_parse())

        return job_id

        
        