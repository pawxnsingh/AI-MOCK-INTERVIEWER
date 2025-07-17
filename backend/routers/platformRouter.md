## API Endpoints

### Media Upload

*   **Endpoint:** `/api/media/upload`
*   **Method:** POST
*   **Description:** Uploads a media file.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/media/upload" \
    -H "Content-Type: multipart/form-data" \
    -F "file=@/path/to/your/file.pdf" \
    -F "user_id=your_user_uuid" \
    -F "to_parse=true"
    ```
    *   Replace `/path/to/your/file.pdf` with the actual path to the file.
    *   Replace `your_user_uuid` with the user's UUID.
    *   `to_parse` indicates whether the file should be parsed after upload.

### Parse Document

*   **Endpoint:** `/api/parser/parse`
*   **Method:** POST
*   **Description:** Parses a document using its media ID.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/parser/parse" \
    -H "Content-Type: application/json" \
    -d '{
      "mediaId": "your_media_uuid"
    }'
    ```

    *   Replace `your_media_uuid` with the actual media UUID.

### Create Agent

*   **Endpoint:** `/api/agents/create`
*   **Method:** POST
*   **Description:** Creates a new agent.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/agents/create" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "agent_name",
      "prompt": "agent_prompt",
      "version": "1.0",
      "llmConfig": {
        "temperature": 0.5,
        "model": "gemini-2.0-flash",
        "provider": "google"
      }
    }'
    ```

    *   Replace `"agent_name"`, `"agent_prompt"`, and `"1.0"` with the desired values.

### Update Agent

*   **Endpoint:** `/api/agents/update`
*   **Method:** PUT
*   **Description:** Updates an existing agent.
*   **cURL Example:**

    ```bash
    curl -X PUT "http://localhost:8000/api/agents/update" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "agent_name",
      "version": "1.0",
      "prompt": "updated_prompt",
      "llmConfig": {
        "temperature": 0.7
      }
    }'
    ```

    *   Replace `"agent_name"`, `"1.0"`, and `"updated_prompt"` with the desired values.

### Delete Agent

*   **Endpoint:** `/api/agents/delete`
*   **Method:** DELETE
*   **Description:** Deletes an agent by UUID.
*   **cURL Example:**

    ```bash
    curl -X DELETE "http://localhost:8000/api/agents/delete" \
    -H "Content-Type: application/json" \
    -d '{
      "agentUuid": "your_agent_uuid"
    }'
    ```

    *   Replace `"your_agent_uuid"` with the agent's UUID.

### Get All Agents

*   **Endpoint:** `/api/agents/`
*   **Method:** GET
*   **Description:** Retrieves all agents.
*   **cURL Example:**

    ```bash
    curl -X GET "http://localhost:8000/api/agents/"
    ```

### User Signup

*   **Endpoint:** `/api/user/signup`
*   **Method:** POST
*   **Description:** Creates a new user.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/user/signup" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "new_user",
      "email": "user@example.com",
      "password": "password123"
    }'
    ```

    *   Replace `"new_user"`, `"user@example.com"`, and `"password123"` with the desired values.

### Interview Preparation Workflow

*   **Endpoint:** `/api/workflow/interview/prepare/test`
*   **Method:** POST
*   **Description:** Executes the interview preparation workflow.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/workflow/interview/prepare/test" \
    -H "Content-Type: application/json" \
    -d '{
      "parsed_resume": "resume_text",
      "other_context": {
        "key": "value"
      }
    }'
    ```

    *   Replace `"resume_text"` and the contents of `"other_context"` with the appropriate data.

### Live Interview Run

*   **Endpoint:** `/api/workflow/interview/run/test`
*   **Method:** POST
*   **Description:** Runs a live interview.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/workflow/interview/run/test" \
    -H "Content-Type: application/json" \
    -d '{
      "mainQuestion": "question",
      "previousConversationList": [],
      "candidateReply": "reply"
    }'
    ```

    *   Replace `"question"` and `"reply"` with the appropriate data.

### Analyse Interview Workflow

*   **Endpoint:** `/api/workflow/analyse-interview/test`
*   **Method:** POST
*   **Description:** Analyses an interview.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/workflow/analyse-interview/test" \
    -H "Content-Type: application/json" \
    -d '{
      "interviewExchanges": [],
      "mainQuestion": "question"
    }'
    ```

    *   Replace `"question"` with the appropriate data.

### Gemini Stream (Test)

*   **Endpoint:** `/api/tester/gemini-stream`
*   **Method:** POST
*   **Description:** Streams responses from Gemini.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/tester/gemini-stream" \
    -H "Content-Type: application/json" \
    -d '{
      "data": "your_context_data"
    }'
    ```

    *   Replace `"your_context_data"` with the appropriate context data.

### Chat Completions (Test)

*   **Endpoint:** `/api/tester/chat`
*   **Method:** POST
*   **Description:**  For generating chat completions.
*   **cURL Example:**

    ```bash
   curl -X POST "http://localhost:8000/api/tester/chat" \
   -H "Content-Type: application/json" \
   -d '{
     "messages": [
       {"role": "user", "content": "Hello"}
     ],
     "stream": true
   }'
    ```

### Create Interview Questions (Test)

*   **Endpoint:** `/api/tester/interview/prepare`
*   **Method:** POST
*   **Description:** Creates interview questions.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/tester/interview/prepare" \
    -H "Content-Type: application/json" \
    -d '{
      "mediaId": "your_media_uuid",
      "otherContext": {
        "currentRole": "role",
        "currentCompany": "company",
        "totalProductManagementExperience": "5 years",
        "totalWorkExperience": "7 years",
        "targetRole": "role",
        "targetCompany": "company",
        "jobDescription": "description",
        "jobDescriptionLink": "link"
      }
    }'
    ```

    *   Replace `"your_media_uuid"` and the contents of `"otherContext"` with the appropriate data.

### Start Interview Session (Test)

*   **Endpoint:** `/api/tester/start/session`
*   **Method:** POST
*   **Description:** Starts an interview session.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/tester/start/session" \
    -H "Content-Type: application/json" \
    -d '{
      "sessionId": "your_session_uuid",
      "selectedQuestion": "question"
    }'
    ```

    *   Replace `"your_session_uuid"` and `"question"` with the appropriate data.

### Media Upload Handler (Platform)

*   **Endpoint:** `/api/platform/media/upload`
*   **Method:** POST
*   **Description:** Uploads media and parses it.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/platform/media/upload" \
    -H "Content-Type: multipart/form-data" \
    -F "file=@/path/to/your/file.pdf" \
    -F "user_id=your_user_uuid" \
    -F "to_parse=true"
    ```

    *   Replace `/path/to/your/file.pdf` with the actual path to the file.
    *   Replace `your_user_uuid` with the user's UUID.
    *   `to_parse` indicates whether the file should be parsed after upload.

### Context Upload Handler (Platform)

*   **Endpoint:** `/api/platform/context/upload`
*   **Method:** POST
*   **Description:** Uploads context and generates interview questions.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/platform/context/upload" \
    -H "Content-Type: application/json" \
    -d '{
      "mediaId": "your_media_uuid",
      "otherContext": {
        "currentRole": "role",
        "currentCompany": "company",
        "totalProductManagementExperience": "5 years",
        "totalWorkExperience": "7 years",
        "targetRole": "role",
        "targetCompany": "company",
        "jobDescription": "description",
        "jobDescriptionLink": "link"
      }
    }'
    ```

    *   Replace `"your_media_uuid"` and the contents of `"otherContext"` with the appropriate data.

### Link Call ID to Session (Platform)

*   **Endpoint:** `/api/platform/session/link`
*   **Method:** POST
*   **Description:** Links a call ID to a session.
*   **cURL Example:**

    ```bash
    curl -X POST "http://localhost:8000/api/platform/session/link" \
    -H "Content-Type: application/json" \
    -d '{
      "callId": "your_call_uuid",
      "sessionId": "your_session_uuid"
    }'
    ```

    *   Replace `"your_call_uuid"` and `"your_session_uuid"` with the actual UUIDs.

### Session Analysis Handler (Platform)

*   **Endpoint:** `/api/platform/chat/completions`
*   **Method:** POST
*   **Description:**  Analyses a session and generates the interview report
*   **cURL Example:**

    ```bash
   curl -X POST "http://localhost:8000/api/platform/chat/completions" \
   -H "Content-Type: application/json" \
   -d '{
     "messages": [
       {"role": "user", "content": "Hello"}
     ],
     "stream": true,
     "call": {
       "id": "your_call_id",
       "monitor": {
         "controlUrl": "your_control_url",
         "listenUrl": "your_listen_url"
       }
     }
   }'
    ```
    * Replace `"your_call_id"`, `"your_control_url"`, and `"your_listen_url"` with the actual values.
`






