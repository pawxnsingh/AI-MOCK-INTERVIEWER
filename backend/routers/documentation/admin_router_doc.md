# Admin Router API Documentation

This document provides a detailed overview of the API endpoints available in the `admin_router`. This router is designed for administrative purposes, allowing for the management of users, organizations, payments, and other core components of the platform. Access to these endpoints is restricted to users with specific roles (e.g., `INTERNAL`, `EXTERNAL`).

## Table of Contents
- [User Management Endpoints](#user-management-endpoints)
  - [GET /users](#get-users)
  - [GET /users/{identifier}](#get-usersidentifier)
  - [GET /users/{user_uuid}/sessions](#get-usersuser_uuidsessions)
  - [GET /users/{user_uuid}/payments](#get-usersuser_uuidpayments)
- [Payment Management Endpoints](#payment-management-endpoints)
  - [GET /payments/summary](#get-paymentssummary)
- [Organization Management Endpoints](#organization-management-endpoints)
  - [POST /create/org](#post-createorg)
  - [GET /org/get-all](#get-orgget-all)
  - [POST /org/add-account](#post-orgadd-account)
  - [POST /org/add-recruiter](#post-orgadd-recruiter)
  - [GET /org/get/{org_name}/users/{page}](#get-orggetorg_nameuserspage)
- [Authentication Endpoints](#authentication-endpoints)
  - [POST /login](#post-login)

---

## User Management Endpoints

### GET /users
Retrieves a paginated list of all users in the system.

- **Authentication**: Admin token required.
- **Query Parameters**:
  - `page`: Page number for pagination (default: 1).
  - `limit`: Number of users per page (default: 20).
  - `sort_by`: Field to sort by (`last_login` or `created_at`, default: `last_login`).
  - `start_time`: Optional start time for filtering.
  - `end_time`: Optional end time for filtering.
- **Response**: `PaginatedUsersResponse` object.

### GET /users/{identifier}
Retrieves a single user by their unique identifier (e.g., UUID or email).

- **Authentication**: Admin token required.
- **Path Parameter**:
  - `identifier`: The unique identifier of the user.
- **Response**: `UserSchema` object.

### GET /users/{user_uuid}/sessions
Retrieves all interview sessions for a specific user.

- **Authentication**: Admin token required.
- **Path Parameter**:
  - `user_uuid`: The UUID of the user.
- **Response**: A list of `SessionSchema` objects.

### GET /users/{user_uuid}/payments
Retrieves all payment records for a specific user.

- **Authentication**: Admin token required.
- **Path Parameter**:
  - `user_uuid`: The UUID of the user.
- **Response**: A list of `PaymentSchema` objects.

---

## Payment Management Endpoints

### GET /payments/summary
Provides a summary of all payments, including total revenue and transaction counts.

- **Authentication**: Admin token required.
- **Response**: `PaymentSummaryResponse` object.

---

## Organization Management Endpoints

### POST /create/org
Creates a new organization. Restricted to `INTERNAL` users.

- **Authentication**: `INTERNAL` user token required.
- **Request Body**: `OrganisationCreateRequest`
  ```json
  {
    "name": "string",
    "api_key": "string",
    "ats": "string"
  }
  ```
- **Response**: `OrganisationResponse` object.

### GET /org/get-all
Retrieves a paginated list of all organizations. Restricted to `INTERNAL` users.

- **Authentication**: `INTERNAL` user token required.
- **Query Parameters**:
  - `page`: Page number (default: 1).
  - `limit`: Number of items per page (default: 10).
- **Response**: `PaginatedOrganisationsResponse` object.

### POST /org/add-account
Adds a new external user (`EXTERNAL` role) to an organization. Restricted to `INTERNAL` users.

- **Authentication**: `INTERNAL` user token required.
- **Request Body**: `ExternalUserCreateRequest`
  ```json
  {
    "recruiterName": "string",
    "recruiterEmail": "string",
    "orgName": "string"
  }
  ```
- **Response**: User profile of the newly created user.

### POST /org/add-recruiter
Adds a new recruiter (`RECRUITER` role) to an organization. Accessible by `INTERNAL` and `EXTERNAL` users.

- **Authentication**: `INTERNAL` or `EXTERNAL` user token required.
- **Request Body**: `RecruiterCreateRequest`
  ```json
  {
    "recruiterName": "string",
    "recruiterEmail": "string",
    "orgName": "string" // Required for INTERNAL users
  }
  ```
- **Response**: User profile of the newly created recruiter.

### GET /org/get/{org_name}/users/{page}
Retrieves a paginated list of users belonging to a specific organization.

- **Authentication**: `INTERNAL` or `EXTERNAL` user token required.
- **Path Parameters**:
  - `org_name`: The name of the organization.
  - `page`: The page number.
- **Response**: `PaginatedUsersResponse` object.

---

## Authentication Endpoints

### POST /login
Handles the login process for admin and recruiter users. It creates a new user if one does not exist with the provided email.

- **Request Body**: `AdminLoginRequest`
  ```json
  {
    "email": "string",
    "name": "string"
  }
  ```
- **Response**: User profile object.
