from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import stripe
from typing import List
import uuid
from datetime import datetime
from models.base import get_db_session
from models.payments import Payments

from models.users import User
from utils.datetime_helper import StandardDT
from config import config
# from services.payment_service import get_payment_status
# from stripeEndpoints import create_checkout_session
import logging 

logger = logging.getLogger(__name__)


stripe.api_key = config.STRIPE_API_KEY 

def create_checkout_session(price: float, plan_name: str, user_id: str, payment_id: str, plan_id: str, credits: int, email: str, success_url: str, cancel_url: str):
    try:
        stripe_session_create_data = {            
            "payment_method_types":["card"],
            "mode":"payment",
            "customer_email":email,
            "line_items":[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {"name": plan_name},
                        "unit_amount": int(price * 100),  # this is in cents for reference 
                    },
                    "quantity": 1,
                }
            ],
            "metadata":{
                "user_id": user_id,
                "payment_id": payment_id,
                "plan_id": plan_id,
                "credits": credits,
            },
            "success_url":success_url,
            #config.STRIPE_SUCCESS_URL + "?session_id:{CHECKOUT_SESSION_ID}", #"https://test.juggy.ai/success?session_id:{CHECKOUT_SESSION_ID}",
            "cancel_url":cancel_url,
            #config.STRIPE_CANCEL_URL  # "https://test.juggy.ai/cancel",            
        }
         
        logger.info("[payment_router | create_checkout_session ] :: setup stripe_session_create_data = %s", stripe_session_create_data)
        
        # session = stripe.checkout.Session.create(
        #     payment_method_types=["card"],
        #     mode="payment",
        #     customer_email=email,
        #     line_items=[
        #         {
        #             "price_data": {
        #                 "currency": "usd",
        #                 "product_data": {"name": plan_name},
        #                 "unit_amount": int(price * 100),  # this is in cents for reference 
        #             },
        #             "quantity": 1,
        #         }
        #     ],
        #     metadata={
        #         "user_id": user_id,
        #         "payment_id": payment_id,
        #         "plan_id": plan_id,
        #         "credits": credits
        #     },
        #     success_url=success_url,
        #     #config.STRIPE_SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}", #"https://test.juggy.ai/success?session_id={CHECKOUT_SESSION_ID}",
        #     cancel_url=cancel_url
        #     #config.STRIPE_CANCEL_URL  # "https://test.juggy.ai/cancel",
        # )
        
        stripe_session = stripe.checkout.Session.create(**stripe_session_create_data)
        
        logger.info("[payment_router | create_checkout_session] :: created stripe_session = %s", stripe_session)

        return stripe_session
    except Exception: 
        logger.exception("[payment_router | create_checkout_session] :: caught exception ")
        raise 

def get_payment_status(stripe_session_id):
    try:
        stripe_session = stripe.checkout.Session.retrieve(stripe_session_id)
        return stripe_session.payment_status
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")

payment_router = APIRouter(
    tags=["payment system"]
)

@payment_router.get("/pricing/plans", response_model=List[dict])
async def get_pricing_plans(request: Request):
    """Get available pricing plans"""
    # user_token = request.state.bearer_token or None
    plans = [
        {
            "id": "starter",
            "name": "Starter",
            "credits": 60,
            "price": 10.00,
            "description": "Perfect for occasional practice"
        },
        {
            "id": "pro", 
            "name": "Pro",
            "credits": 300,
            "price": 45.00,
            "description": "Best value for serious preparation"
        }
    ]
    return plans

@payment_router.post("/payments/create-checkout-session")
async def create_payment_session(request: Request, plan_data: dict):
    """Create Stripe Checkout session"""
    try:
        plan_id = plan_data.get("plan_id")
        success_url = plan_data.get("success_url")
        cancel_url = plan_data.get("cancel_url")
        
        user_uuid = request.state.bearer_token or None
    
        plans = {
            "starter": {"credits": 60, "price": 10.00, "name": "Starter Pack"},
            "pro": {"credits": 300, "price": 45.00, "name": "Pro Pack"}
        }
        
        if plan_id not in plans:
            raise HTTPException(status_code=400, detail="Invalid plan")
        
        plan = plans[plan_id]
        
        # generating a payment uuid 
        payment_id = str(uuid.uuid4())
        
        with get_db_session() as db: 
            user_data = db.query(User).filter(User.uuid == user_uuid).first()
            
            # creating stripe checkout session 
            stripe_session = create_checkout_session(
                price=plan["price"],
                plan_name=plan["name"],
                user_id=user_data.uuid,
                payment_id=payment_id,
                plan_id=plan_id,
                credits=plan["credits"],
                email=user_data.email,
                success_url=success_url,
                cancel_url=cancel_url
            )
            
            payment_details = {
                "payment_id" : payment_id,
                "user_id" : user_data.id,
                "stripe_session_payment_intent" : stripe_session.payment_intent or None,
                "stripe_payment_intent_id" : stripe_session.id or None,
                "amount" : plan["price"],
                "credits" : plan["credits"],
                "plan_name" : plan["name"],
                "status" : "PENDING",
                "currency" : "usd"
            }
        
            # recording the payment on database 
            new_payment = Payments(
                user_id = user_data.id,
                payment_details=payment_details
            )
            
            db.add(new_payment)
            db.commit()
        
        return {
            "checkout_url": stripe_session.url,
            "session_id": stripe_session.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout session creation failed: {str(e)}")

@payment_router.post("/payments/confirm-checkout")
async def confirm_checkout_success(request: Request , session_data: dict):
    """Confirm successful checkout and add credits"""
    try:
        
        stripe_session_id = session_data.get("session_id")
        user_uuid = request.state.bearer_token or None
        if not stripe_session_id:
            raise HTTPException(status_code=400, detail="Session ID required")

        # getting payment status from stripe
        payment_status = get_payment_status(stripe_session_id)
        if payment_status != "paid":
            raise HTTPException(status_code=400, detail="Payment not completed")

        with get_db_session() as db:
            # finding the payment record stored in db
            payment = db.query(Payments).filter(
                Payments.user_id == user_uuid,
                Payments.payment_details["stripe_payment_intent_id"].astext == stripe_session_id
            ).first()

            if not payment:
                raise HTTPException(status_code=404, detail="Payment record not found")

            # updating the payment status on the db 
            payment_details = payment.payment_details or {}
            payment_details["status"] = "COMPLETED"
            payment_details["completed_at"] = StandardDT.get_iso_dt_string()
            payment.payment_details = payment_details

            # adding credits to the user
            user = db.query(User).filter(User.id == user_uuid).first()
            credits = payment_details.get("credits", 0)
            user.credits = (user.credits or 0) + credits

            db.commit()

            return {
                "success": True,
                "credits_added": credits,
                "message": f"Successfully added {credits} credits to your account!"
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout confirmation failed: {str(e)}")

@payment_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try: 
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        logger.info("[payment_router | stripe_webhook] :: stripe webhook request payload = %s, stripe_signature = %s", payload, sig_header)
        # user_uuid = request.state.bearer_token or None

        try:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=config.STRIPE_WEBHOOK_SECRET
            )
            logger.info("[payment_router | stripe_webhook] :: stripe webhook event created = %s", event) 
        except stripe.error.SignatureVerificationError:
            logger.info("[payment_router | stripe_webhook] :: error :: stripe signature verification error")
            raise HTTPException(status_code=400, detail="Invalid signature")

        # handling checkout completion event only1
        if event["type"] == "checkout.session.completed":
            logger.info("[payment_router | stripe_webhook] :: checkout session type is completed")
            session = event["data"]["object"]
            metadata = session.get("metadata", {})

            payment_id = metadata.get("payment_id")
            user_id = metadata.get("user_id") # this is user uuid 
            logger.info("[payment_router | stripe_webhook] :: completed checkout event data :: metadata = %s, payment_id = %s and user_id = %s", metadata, payment_id, user_id)
            with get_db_session() as db:
                user_data = db.query(User).filter(User.uuid == user_id).first()
                
                payment = db.query(Payments).filter(
                    Payments.user_id == user_data.id,
                    Payments.payment_details["payment_id"].astext == payment_id
                ).first()

                if not payment:
                    logger.error("[payment_router | stripe_webhook] :: stripe payment under payment_id = %s and user_id = %s not found in db", payment_id, user_data.id)
                    raise HTTPException(status_code=404, detail="Payment not found")

                payment_details = payment.payment_details or {}
                payment_details["status"] = "COMPLETED"
                payment_details["completed_at"] = StandardDT.get_iso_dt_string()
                payment.payment_details = payment_details

                # update user credits since the checkout event type is completed from the stripe side itself
                credits = int(payment_details.get("credits", 0))
                user_data.credits = (user_data.credits or 0) + credits

                db.commit()

            return {"status": "success"}

        return {"status": "ignored"} # ignoring if the session type from stripe is not yet completed so in db it will still be in pending so should use some 
    # frontend side confirmation api or something like that to confirm the payment
    except Exception: 
        logger.exception("[payment_router | stripe_webhook] :: caught exception ")
        raise # todo :: does stripe need a status : error or something like that or does direct error throw work ? 
   
@payment_router.get("/payments/get/transactions")
async def get_user_payment_transactions_api(req: Request):
    try: 
        user_uuid = 'dc44c0ce-1475-546b-a25a-ec2574517171' # req.state.bearer_token 
        response_data = {}
        with get_db_session() as db: 
            asking_user = db.query(User).filter(User.uuid == user_uuid).first()
            user_transactions_data = db.query(Payments).filter(Payments.user_id == asking_user.id).all()
                        
            response_data["transactions"] = [{
                "createdAt" : ut.created_at,
                "status" : ut.payment_details["status"] or "NA",
                "amount" : ut.payment_details["amount"],
                "currency" : "usd",
            } for ut in user_transactions_data]
            
            return response_data
            
    except Exception: 
        logger.exception("[payment_router | get_user_payment_transactions_api] :: caught exception")
        raise