from sqlalchemy import Column, String, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from models.base import Base
from enum import Enum

from utils.datetime_helper import StandardDT

class SessionStatusEnum(Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    CREATED = 'CREATED'
    ANALYSED = 'ANALYSED'
    TERMINATED = 'TERMINATED'
    

class Session(Base):
    __tablename__ = 'sessions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    uuid = Column(String, nullable=False, unique=True, index=True)
    summary = Column(JSON, nullable=True)
    session_metadata = Column(JSON) # all llm tokens for this session up until the question generation
    session_questions = Column(JSON) # generated questions 
    contexts = Column(JSON) # all the setup context of the user for this session 
    call_id = Column(String)
    status = Column(String)
    used_credits = Column(Integer)
    created_at = Column(DateTime, default=StandardDT.get_iso_dt)
    updated_at = Column(DateTime, default=StandardDT.get_iso_dt, onupdate=StandardDT.get_iso_dt)
    user = relationship("User", back_populates="sessions")
    exchanges = relationship("SessionExchange", back_populates="session")