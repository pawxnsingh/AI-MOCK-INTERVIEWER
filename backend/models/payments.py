from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from models.base import Base
from utils.datetime_helper import StandardDT

class Payments(Base):
    __tablename__ = 'user_payments'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    payment_details = Column(JSON)
    created_at = Column(DateTime, default=StandardDT.get_iso_dt)
    user = relationship("User", back_populates="payments")
    
# example payment_details for reference ::  
# {
#   "payment_id": "f9b1e9ff-5e35-4c01-9529-f7cb5ca7d683",
#   "user_id": 6,
#   "stripe_session_payment_intent": null,
#   "stripe_payment_intent_id": "cs_test_a1YiIvwD7Izov98IliNu6wJGjchyrRdEFwF6Hi3nOA6ZnjlQuQSGhNpTbb",
#   "amount": 10,
#   "credits": 60,
#   "plan_name": "Starter Pack",
#   "status": "PENDING",
#   "currency" : "usd" 
# }