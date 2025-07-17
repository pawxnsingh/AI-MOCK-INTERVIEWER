from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR / 'data'
TEMPLATE_DIR = BACKEND_DIR / 'templates'

def get_data_dir() -> Path:
    """Get path to data directory"""
    data_dir_path = Path(DATA_DIR)
    if not data_dir_path.exists():
        data_dir_path.mkdir(parents=True)
    return data_dir_path

def get_db_dir() -> Path:
    """Get path to database directory"""
    db_path = Path(DATA_DIR / 'db')
    if not db_path.exists():
        db_path.mkdir(parents=True)
    return db_path

def get_db_path(db_name: str) -> Path:
    """Get full path to a database file"""
    return get_db_dir() / db_name

def get_logs_dir() -> Path:
    """Get path to logs directory"""
    logs_dir = Path(DATA_DIR / 'logs')
    if not logs_dir.exists():
        logs_dir.mkdir(parents=True)
    return DATA_DIR / 'logs'

def get_log_path(log_file_name: str) -> Path:
    """Get full path to a log file"""
    return get_logs_dir() / log_file_name

