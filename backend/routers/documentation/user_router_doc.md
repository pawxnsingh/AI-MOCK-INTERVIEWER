# User Router API Documentation

This document provides a detailed overview of the API endpoints available in the `user_router`. This router handles user-centric operations such as retrieving user profiles and managing referrals.

## Table of Contents
- [GET /user/profile](#get-userprofile)
- [POST /user/referral/link](#post-userreferrallink)
- [GET /user/referral/all](#get-userreferralall)

---

### GET /user/profile
Retrieves the profile information of the currently authenticated user.

- **Authentication**: Bearer Token required. The token is extracted from the request state.
- **Response**:
  - On success, returns a JSON object containing the user's profile details.
  - On failure, returns a 500 Internal Server Error.

### POST /user/referral/link
Links the currently authenticated user with a referral code from another user.

- **Authentication**: Bearer Token required.
- **Request Body**:
  ```json
  {
    "referralCode": "string"
  }
  ```
- **Response**:
  - On success, returns a confirmation message or result object.
  - If `referralCode` is not provided, returns a 400 Bad Request error.
  - On other failures, returns a 500 Internal Server Error.

### GET /user/referral/all
Retrieves a list of all users who have been referred by the currently authenticated user.

- **Authentication**: Bearer Token required.
- **Response**:
  - On success, returns a JSON array of referred user objects.
  - On failure, returns a 500 Internal Server Error.
