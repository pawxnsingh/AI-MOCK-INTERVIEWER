from sqlalchemy import Column, String, Boolean, Integer, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from models.base import Base
from utils.datetime_helper import StandardDT


class ParsedResult(Base):
    __tablename__ = 'parsed_results'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    source_id = Column(Integer, ForeignKey("uploads.id"), nullable=False)
    raw_result = Column(JSON, nullable=True)
    result_metadata = Column(JSON, nullable=True) # parsing cost etc 
    structured_result = Column(JSON)
    created_at = Column(DateTime, default=StandardDT.get_iso_dt)
    is_deleted = Column(Boolean, default=False)
    user = relationship("User", back_populates="parsed_results")
    source = relationship("Upload", back_populates="parsed_results")
