# Payment Router API Documentation

This document provides a detailed overview of the API endpoints available in the `payment_router`. This router handles all payment-related functionalities, integrating with Stripe to process payments, manage pricing plans, and handle webhooks.

## Table of Contents
- [GET /pricing/plans](#get-pricingplans)
- [POST /payments/create-checkout-session](#post-paymentscreate-checkout-session)
- [POST /payments/confirm-checkout](#post-paymentsconfirm-checkout)
- [POST /webhook/stripe](#post-webhookstripe)
- [GET /payments/get/transactions](#get-paymentsgettransactions)

---

### GET /pricing/plans
Retrieves the available pricing plans.

- **Response**: A list of plan objects, each containing:
  - `id`: The unique identifier for the plan (e.g., "starter", "pro").
  - `name`: The display name of the plan.
  - `credits`: The number of credits included in the plan.
  - `price`: The price of the plan in USD.
  - `description`: A brief description of the plan.

### POST /payments/create-checkout-session
Creates a Stripe Checkout session for a selected pricing plan.

- **Authentication**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "plan_id": "string",
    "success_url": "string",
    "cancel_url": "string"
  }
  ```
- **Process**:
  1. Validates the `plan_id`.
  2. Creates a payment record in the local database with a `PENDING` status.
  3. Calls the Stripe API to create a checkout session.
- **Response**:
  ```json
  {
    "checkout_url": "string", // The URL for the Stripe Checkout page
    "session_id": "string"   // The ID of the Stripe session
  }
  ```

### POST /payments/confirm-checkout
Confirms a successful payment after the user is redirected from Stripe.

- **Authentication**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "session_id": "string"
  }
  ```
- **Process**:
  1. Verifies the payment status with Stripe using the `session_id`.
  2. If the payment is successful (`paid`), it updates the payment record in the local database to `COMPLETED`.
  3. Adds the purchased credits to the user's account.
- **Response**:
  ```json
  {
    "success": true,
    "credits_added": "integer",
    "message": "string"
  }
  ```

### POST /webhook/stripe
An endpoint to receive and process webhooks from Stripe. This is used for asynchronous event handling, such as confirming payments.

- **Request**: A POST request from Stripe containing an event payload and a `stripe-signature` header.
- **Process**:
  1. Verifies the webhook signature to ensure the request is from Stripe.
  2. Handles the `checkout.session.completed` event.
  3. Updates the payment status and adds credits to the user's account, similar to the `/confirm-checkout` endpoint.
- **Response**: A status confirmation to Stripe.

### GET /payments/get/transactions
Retrieves the payment transaction history for the authenticated user.

- **Authentication**: Bearer Token required.
- **Response**:
  ```json
  {
    "transactions": [
      {
        "createdAt": "datetime",
        "status": "string",
        "amount": "float",
        "currency": "string"
      }
    ]
  }
  ```
