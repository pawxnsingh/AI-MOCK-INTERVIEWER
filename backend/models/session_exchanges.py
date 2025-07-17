from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from models.base import Base
from enum import Enum

from utils.datetime_helper import StandardDT


class SessionExchange(Base):
    __tablename__ = 'session_exchanges'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    session_id = Column(Integer, ForeignKey('sessions.id'))
    data = Column(JSON) # exchange data for this instance { user : ... , assistant : ... }
    exchange_metadata = Column(JSON) # agent specific metadata like tool call info etc 
    created_at = Column(DateTime, default=StandardDT.get_iso_dt)
    user = relationship("User", back_populates="session_exchanges")
    session = relationship("Session", back_populates="exchanges")

