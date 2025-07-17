from contextlib import contextmanager
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, declarative_base
from utils.path_helpers import get_db_path

Base = declarative_base()
DATABASE_NAME = 'juggyai.db'

def get_database_url() -> str:
    """Get the database URL for the single database."""
    return f"sqlite:///{get_db_path(DATABASE_NAME)}"


engine = create_engine(get_database_url())
SessionLocal = sessionmaker(bind=engine)


def init_db():
    """Initialize database and create all tables."""
    Base.metadata.create_all(bind=engine)
    return engine


@contextmanager
def get_db_session():
    """Context manager for database sessions."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

