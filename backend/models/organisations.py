from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from utils.datetime_helper import StandardDT

class Organisation(Base):
    __tablename__ = 'organisations'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    ats = Column(String)
    api_key = Column(String, nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=StandardDT.get_iso_dt())
    updated_at = Column(DateTime, default=StandardDT.get_iso_dt())

    creator = relationship("User", foreign_keys=[created_by], backref="created_organisations")
    users = relationship("User", back_populates="organisation", foreign_keys="User.org_id")
    agents = relationship("Agent", back_populates="organisation")