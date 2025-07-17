from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from models.base import Base
from utils.datetime_helper import StandardDT


class Upload(Base):
    __tablename__ = 'uploads'

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_name = Column(String, nullable=False)
    uuid = Column(String, nullable=False, unique=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    download_path = Column(String)
    to_parse = Column(Boolean, default=False)
    parsing_metadata = Column(JSON) 
    uploads_metadata = Column(JSON)
    created_at = Column(DateTime, default=StandardDT.get_iso_dt)
    updated_at = Column(DateTime, default=StandardDT.get_iso_dt, onupdate=StandardDT.get_iso_dt)
    user = relationship("User", back_populates="uploads")
    parsed_results = relationship("ParsedResult", back_populates="source", cascade="all, delete-orphan")