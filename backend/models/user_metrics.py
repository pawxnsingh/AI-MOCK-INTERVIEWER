from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from models.base import Base
from utils.datetime_helper import StandardDT

class UserMetrics(Base):
    __tablename__ = 'user_metrics'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    metrics = Column(JSON)
    created_at = Column(DateTime, default=StandardDT.get_iso_dt)
    user = relationship("User", back_populates="metrics")
