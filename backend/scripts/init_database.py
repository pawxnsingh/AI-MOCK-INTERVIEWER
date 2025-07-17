import sys
import os

# Add the project root to the Python path to allow importing modules like 'models' and 'utils'
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

from models.base import Base, engine, DATABASE_NAME # Import DATABASE_NAME
from utils.path_helpers import get_db_path, get_db_dir # Import path helpers

# Import all your models here to ensure they are registered with SQLAlchemy's metadata
from models.users import User
from models.uploads import Upload
from models.sessions import Session
from models.session_exchanges import SessionExchange
from models.parsed_results import ParsedResult
from models.platform_metrics import PlatformMetrics
from models.user_metrics import UserMetrics
from models.agents import Agent
# Ensure all models defined in models/__init__.py are imported if they define tables

def initialize_database():
    """
    Initializes the database by creating all tables defined in the models.
    Ensures the database directory exists.
    """
    # Ensure the database directory exists
    db_dir = get_db_dir()
    if not db_dir.exists():
        print(f"Database directory not found. Creating: {db_dir}")
        db_dir.mkdir(parents=True, exist_ok=True)

    db_file_path = get_db_path(DATABASE_NAME)
    print(f"Attempting to initialize database at: {db_file_path}")

    print("Creating database tables...")
    # The engine is already configured with the correct database URL in models/base.py
    Base.metadata.create_all(bind=engine)
    print(f"Database tables created successfully (if they didn't exist) for {DATABASE_NAME}.")

if __name__ == "__main__":
    print("Initializing database schema...")
    initialize_database()
    print("Database initialization process complete.")