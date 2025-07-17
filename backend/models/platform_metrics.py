from sqlalchemy import Column, String, Boolean, Integer, JSON, DateTime
from models.base import Base
from utils.datetime_helper import StandardDT

class PlatformMetrics(Base):
    __tablename__ = 'platform_metrics'

    id = Column(Integer, primary_key=True, autoincrement=True)
    llm_metadata = Column(JSON) # complete metadata of all the llm calls made from all the agents 
    source_metadata = Column(JSON) # source of the origin of metadata if any
    created_at = Column(DateTime, default=StandardDT.get_iso_dt)
