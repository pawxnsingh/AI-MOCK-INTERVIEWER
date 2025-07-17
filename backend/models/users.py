from sqlalchemy import Column, String, Boolean, Integer, JSON, DateTime
from sqlalchemy.orm import relationship
from models.base import Base
from utils.datetime_helper import StandardDT

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    uuid = Column(String, nullable=False, unique=True)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True, index=True)
    auth_data = Column(JSON, nullable=True)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    credits = Column(Integer)
    created_at = Column(DateTime, default=StandardDT.get_iso_dt())
    last_login = Column(DateTime, default=StandardDT.get_iso_dt())
    payment_details = Column(JSON, nullable=True)

    uploads = relationship("Upload", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    session_exchanges = relationship("SessionExchange", back_populates="user")
    parsed_results = relationship("ParsedResult", back_populates="user")
    metrics = relationship("UserMetrics", back_populates="user")
    payments = relationship("Payments", back_populates="user", cascade="all, delete-orphan")