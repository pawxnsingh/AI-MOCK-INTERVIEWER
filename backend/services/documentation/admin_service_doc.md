# Admin Service Documentation

This document provides a detailed overview of the `AdminService` class, which encapsulates the business logic for administrative operations. It interacts with the database to manage users, organizations, payments, and agents.

## Table of Contents
- [Agent Management](#agent-management)
  - [`update_or_create_agent`](#update_or_create_agent)
  - [`get_agents_of_org`](#get_agents_of_org)
- [User and Organization Management](#user-and-organization-management)
  - [`get_external_users_of_org`](#get_external_users_of_org)
  - [`create_external_user`](#create_external_user)
  - [`create_recruiter`](#create_recruiter)
  - [`get_all_organisations`](#get_all_organisations)
  - [`create_organisation`](#create_organisation)
- [User Data Retrieval](#user-data-retrieval)
  - [`get_all_users`](#get_all_users)
  - [`get_user_by_identifier`](#get_user_by_identifier)
  - [`get_user_sessions`](#get_user_sessions)
  - [`get_user_payments`](#get_user_payments)
- [Payment Analytics](#payment-analytics)
  - [`get_payment_totals`](#get_payment_totals)

---

## Agent Management

### `update_or_create_agent`
Updates an existing agent or creates a new one if it doesn't exist.

- **Parameters**:
  - `db`: Database session.
  - `name`, `version`, `prompt`, `llmConfig`, `org_id`: Agent attributes.
- **Returns**: A tuple containing the agent object and the action performed ("updated" or "created").

### `get_agents_of_org`
Retrieves a paginated list of agents belonging to a specific organization.

- **Parameters**:
  - `db`: Database session.
  - `org_id`: The ID of the organization.
  - `page`, `limit`: Pagination parameters.
  - `job_id`: Optional job ID to filter agents.
- **Returns**: A dictionary with paginated agent data.

---

## User and Organization Management

### `get_external_users_of_org`
Retrieves a paginated list of external users for a given organization.

- **Parameters**: `db`, `org_id`, `page`, `limit`.
- **Returns**: A dictionary with paginated user data.

### `create_external_user`
Creates a new user with the `EXTERNAL` role and associates them with an organization.

- **Parameters**: `db`, `username`, `email`, `org_name`.
- **Returns**: The newly created user object.

### `create_recruiter`
Creates a new user with the `RECRUITER` role and associates them with an organization.

- **Parameters**: `db`, `username`, `email`, `org_id`.
- **Returns**: The newly created user object.

### `get_all_organisations`
Retrieves a paginated list of all organizations.

- **Parameters**: `db`, `page`, `limit`.
- **Returns**: A dictionary with paginated organization data.

### `create_organisation`
Creates a new organization and pre-populates it with agents based on jobs from an ATS.

- **Parameters**: `db`, `name`, `api_key`, `created_by`, `ats`.
- **Returns**: The newly created organization object.

---

## User Data Retrieval

### `get_all_users`
Retrieves a paginated and filterable list of all users.

- **Parameters**: `db`, `page`, `limit`, `sort_by`, `start_time`, `end_time`.
- **Returns**: A dictionary with paginated user data.

### `get_user_by_identifier`
Fetches a user by their username or email.

- **Parameters**: `db`, `identifier`.
- **Returns**: A user object or `None`.

### `get_user_sessions`
Retrieves a user along with all their associated interview sessions and exchanges.

- **Parameters**: `db`, `user_uuid`.
- **Returns**: A user object with loaded session data.

### `get_user_payments`
Retrieves a user along with all their payment records.

- **Parameters**: `db`, `user_uuid`.
- **Returns**: A user object with loaded payment data.

---

## Payment Analytics

### `get_payment_totals`
Calculates the total amount for pending and completed payments.

- **Parameters**: `db`.
- **Returns**: A dictionary with `total_amount_pending` and `total_amount_completed`.
