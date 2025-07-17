## API Endpoints Documentation

### Agent Management API Endpoints

#### 1. Create Agent

*   **Endpoint:** `/api/agents/create`
*   **Method:** POST
*   **Description:** Creates a new agent with the specified configuration.

    **Request Body:**

    ```json
    {
      "name": "AgentName",
      "prompt": "AgentPrompt",
      "version": "1.0",
      "llmConfig": {
        "temperature": 0.5,
        "model": "gemini-2.0-flash",
        "provider": "google"
      }
    }
    ```

    **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/agents/create" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "AgentName",
      "prompt": "AgentPrompt",
      "version": "1.0",
      "llmConfig": {
        "temperature": 0.5,
        "model": "gemini-2.0-flash",
        "provider": "google"
      }
    }'
    ```

    **Response (Success):**

    ```json
    {
      "message": "new agent AgentName with version tag 1.0 created",
      "agent uuid": "agent_uuid"
    }
    ```

    **Response (Failure - Agent Exists):**

    ```json
    {
      "message": "agent with AgentName and version tag 1.0 already exists"
    }
    ```

    **Response (Internal Server Error):**

    ```json
    {
      "detail": "Internal server error: error details"
    }
    ```

#### 2. Update Agent

*   **Endpoint:** `/api/agents/update`
*   **Method:** PUT
*   **Description:** Updates an existing agent's configuration.

    **Request Body:**

    ```json
    {
      "name": "AgentName",
      "version": "1.0",
      "prompt": "UpdatedAgentPrompt",
      "llmConfig": {
        "temperature": 0.7
      }
    }
    ```

    **cURL Example:**

    ```bash
    curl -X PUT "http://localhost:8000/api/agents/update" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "AgentName",
      "version": "1.0",
      "prompt": "UpdatedAgentPrompt",
      "llmConfig": {
        "temperature": 0.7
      }
    }'
    ```

    **Response (Success):**

    ```json
    {
      "message": "agent successfully updated"
    }
    ```

    **Response (Failure - Agent Not Found):**

    ```json
    {
      "message": "agent with AgentName and version tag 1.0 doesnt exist"
    }
    ```

    **Response (Internal Server Error):**

    ```json
    {
      "detail": "Internal server error: error details"
    }
    ```

#### 3. Delete Agent

*   **Endpoint:** `/api/agents/delete`
*   **Method:** DELETE
*   **Description:** Deletes an agent by UUID.

    **Request Body:**

    ```json
    {
      "agentUuid": "agent_uuid"
    }
    ```

    **cURL Example:**

    ```bash
    curl -X DELETE "http://localhost:8000/api/agents/delete" \
    -H "Content-Type: application/json" \
    -d '{
      "agentUuid": "agent_uuid"
    }'
    ```

    **Response (Success):**

    ```json
    true
    ```

    **Response (Failure - Agent Not Found):**

    ```json
    {
      "detail": "Agent with id agent_uuid not found"
    }
    ```

    **Response (Internal Server Error):**

    ```json
    {
      "detail": "Internal server error: error details"
    }
    ```

#### 4. Get All Agents

*   **Endpoint:** `/api/agents/`
*   **Method:** GET
*   **Description:** Retrieves all agents.

    **cURL Example:**

    ```bash
    curl -X GET "http://localhost:8000/api/agents/"
    ```

    **Response (Success):**

    ```json
    {
      "AgentName": [
        {
          "version": "1.0",
          "prompt": "AgentPrompt",
          "config": {
            "temperature": 0.5,
            "model": "gemini-2.0-flash",
            "provider": "google"
          },
          "agentId": "agent_uuid",
          "isActive": false,
          "createdAt": 1672531200000,
          "updatedAt": 1672531200000
        }
      ]
    }
    ```

    **Response (Internal Server Error):**

    ```json
    {
      "detail": "Internal server error: error details"
    }
    ```
    
#### 5. Set Agent as Active

*   **Endpoint:** `/api/agents/set-active/{agent_uuid}`
*   **Method:** GET
*   **Description:** Sets an agent as active by UUID.

    **cURL Example:**

    ```bash
    curl -X GET "http://localhost:8000/api/agents/set-active/agent_uuid"
    ```

    **Response (Success):**

    ```json
    {
      "message": "Agent set as active"
    }
    ```

    **Response (Failure - Agent Not Found):**

    ```json
    {
      "message": "No agent found, so keeping the default agent as active"
    }
    ```

    **Response (Internal Server Error):**

    ```json
    {
      "detail": "Internal server error: error details"
    }
    ```

### Notes:

*   Replace `http://localhost:8000` with the actual base URL of your application.
*   Error responses may vary based on the specific error encountered.
*   Timestamps are in milliseconds since epoch.
