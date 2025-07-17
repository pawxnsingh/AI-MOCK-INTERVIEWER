from sqlalchemy import Column, String, Boolean, Integer, JSON, DateTime
from models.base import Base
from utils.datetime_helper import StandardDT

AGENT_NAME_SEPARATOR = "~@~"

class Agent(Base):
    __tablename__ = 'agents'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    uuid = Column(String, nullable=False, unique=True, index=True)
    prompt = Column(JSON, nullable=True)
    config = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=StandardDT.get_iso_dt)
    updated_at = Column(DateTime, default=StandardDT.get_iso_dt, onupdate=StandardDT.get_iso_dt)