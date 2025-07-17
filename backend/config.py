import os
from pathlib import Path
from dotenv import load_dotenv

class Config:
    def __init__(self):
        load_dotenv()
        # Determine the base directory
        self.BACKEND_DIR = Path(__file__).resolve().parent
        
        # Set environment file paths - check multiple possible locations
        self.env_files = [
            self.BACKEND_DIR / '.env',
            self.BACKEND_DIR / '.env.local',
            self.BACKEND_DIR.parent / '.env',
            self.BACKEND_DIR.parent / '.env.local',
        ]
        
        # Load environment variables from the first file that exists
        # self._load_env()
        
        
        self.LLAMAINDEX_API_KEY = os.getenv("LLAMAINDEX_API_KEY")
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        
        self.STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")
        self.STRIPE_SUCCESS_URL= os.getenv("STRIPE_SUCCESS_URL")
        self.STRIPE_CANCEL_URL = os.getenv("STRIPE_CANCEL_URL")
        self.STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
        
        self.GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
        self.GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        self.GOOGLE_ACCESS_TOKEN_URL = os.getenv("GOOGLE_ACCESS_TOKEN_URL")
        self.GOOGLE_AUTHORIZE_URL = os.getenv("GOOGLE_AUTHORIZE_URL")
        self.GOOGLE_USERINFO_ENDPOINT = os.getenv("GOOGLE_USERINFO_ENDPOINT")
        self.GOOGLE_SERVER_METADATA_URL = os.getenv("GOOGLE_SERVER_METADATA_URL")
        self.GOOGLE_LOGIN_REDIRECT_URL = os.getenv("GOOGLE_LOGIN_REDIRECT_URL")
        self.GOOGLE_POST_AUTH_REDIRECT_URL = os.getenv("GOOGLE_POST_AUTH_REDIRECT_URL")
        


config = Config()
