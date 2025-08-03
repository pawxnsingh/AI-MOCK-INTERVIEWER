# Agent Management Router API Documentation

This document provides a detailed overview of the API endpoints available in the `agent_management_router`. This router is responsible for the lifecycle management of AI agents within the platform, including their creation, update, deletion, and retrieval.

## Table of Contents
- [POST /agents/create](#post-agentscreate)
- [PUT /agents/update](#put-agentsupdate)
- [DELETE /agents/delete](#delete-agentsdelete)
- [GET /agents/](#get-agents)
- [GET /agents/set-active/{agent_uuid}](#get-agentsset-activeagent_uuid)

---

### POST /agents/create
Creates a new agent with a specified name, prompt, version, and LLM configuration.

- **Request Body**:
  ```json
  {
    "name": "string",
    "prompt": "string",
    "version": "string",
    "llmConfig": {}
  }
  ```
- **Response**:
  - On success, returns a JSON object with the details of the newly created agent.
  - On failure, returns a 500 Internal Server Error with an error message.

### PUT /agents/update
Updates an existing agent's configuration based on the provided data.

- **Request Body**: A dictionary containing the fields to be updated for the agent.
- **Response**:
  - On success, returns a JSON object with the update status and information.
  - On failure, returns a 500 Internal Server Error with an error message.

### DELETE /agents/delete
Deletes an agent from the system using its UUID.

- **Request Body**:
  ```json
  {
    "agentUuid": "string"
  }
  ```
- **Response**:
  - On success, returns a confirmation message.
  - If the agent is not found, returns a 404 Not Found error.
  - On other failures, returns a 500 Internal Server Error.

### GET /agents/
Retrieves a list of all agents currently available in the database.

- **Response**:
  - On success, returns a JSON array of agent objects.
  - On failure, returns a 500 Internal Server Error.

### GET /agents/set-active/{agent_uuid}
Sets a specific version of an agent as the active one.

- **Path Parameter**:
  - `agent_uuid`: The UUID of the agent to be set as active.
- **Response**:
  - On success, returns a confirmation message.
  - On failure, returns a 500 Internal Server Error.
