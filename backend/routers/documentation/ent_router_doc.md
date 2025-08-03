# Enterprise Router API Documentation

This document provides a detailed overview of the API endpoints available in the `ent_router`. This router is designed for enterprise clients, offering functionalities for integrating with Applicant Tracking Systems (ATS) like TeamTailor, managing jobs and candidates, and handling enterprise-level interview sessions.

## Table of Contents
- [Job Management Endpoints](#job-management-endpoints)
  - [GET /jobs/get-all/{user_email}](#get-jobsget-alluser_email)
  - [GET /jobs/get-all](#get-jobsget-all)
- [Candidate Management Endpoints](#candidate-management-endpoints)
  - [GET /jobs/{job_id}/candidates](#get-jobsjob_idcandidates)
- [Session Management Endpoints](#session-management-endpoints)
  - [POST /session/create](#post-sessioncreate)
  - [DELETE /temp/session/{session_uuid}](#delete-tempsessionsession_uuid)
- [Agent Management Endpoints](#agent-management-endpoints)
  - [GET /agents/{org_name}](#get-agentsorg_name)
  - [GET /agents/{org_name}/{job_id}](#get-agentsorg_namejob_id)
  - [POST /org/{org_name}/agents](#post-orgorg_nameagents)
  - [PATCH /org/{org_name}/agents/{agent_id}/activate](#patch-orgorg_nameagentsagent_idactivate)
- [Dashboard Endpoints](#dashboard-endpoints)
  - [GET /dashboard/stats](#get-dashboardstats)

---

## Job Management Endpoints

### GET /jobs/get-all/{user_email}
Retrieves all jobs a specific user has applied for from the ATS.

- **Path Parameter**: `user_email`
- **Response**: A paginated list of job objects.

### GET /jobs/get-all
Retrieves all available jobs from the ATS.

- **Authentication**: Bearer Token required.
- **Response**: A paginated list of job objects.

---

## Candidate Management Endpoints

### GET /jobs/{job_id}/candidates
Retrieves all candidates who have applied for a specific job.

- **Authentication**: Bearer Token required.
- **Path Parameter**: `job_id`
- **Response**: A paginated list of candidate objects.

---

## Session Management Endpoints

### POST /session/create
Creates a new interview session for a candidate for a specific job. This involves fetching data from the ATS, creating a user entity, and setting up the session context.

- **Request Body**:
  ```json
  {
    "email": "string",
    "jobid": "string"
  }
  ```
- **Response**:
  ```json
  {
    "sessionId": "string",
    "userToken": "string"
  }
  ```

### DELETE /temp/session/{session_uuid}
Deletes a session, intended for testing purposes.

- **Path Parameter**: `session_uuid`
- **Response**: A confirmation message.

---

## Agent Management Endpoints

### GET /agents/{org_name}
Retrieves all agents belonging to a specific organization.

- **Authentication**: Bearer Token required.
- **Path Parameter**: `org_name`
- **Response**: A paginated list of agent objects.

### GET /agents/{org_name}/{job_id}
Retrieves all agents associated with a specific job within an organization.

- **Authentication**: Bearer Token required.
- **Path Parameters**: `org_name`, `job_id`
- **Response**: A paginated list of agent objects.

### POST /org/{org_name}/agents
Creates or updates an agent for a specific organization.

- **Authentication**: Bearer Token required.
- **Path Parameter**: `org_name`
- **Request Body**: `AgentUpdateCreateRequest`
- **Response**: The created or updated agent object.

### PATCH /org/{org_name}/agents/{agent_id}/activate
Sets a specific agent as active for an organization.

- **Authentication**: Bearer Token required.
- **Path Parameters**: `org_name`, `agent_id`
- **Response**: A status message.

---

## Dashboard Endpoints

### GET /dashboard/stats
Retrieves dashboard statistics for the authenticated user's organization.

- **Authentication**: Bearer Token required.
- **Response**: An object containing stats like `totalJobs`, `totalInterviews`, etc.
