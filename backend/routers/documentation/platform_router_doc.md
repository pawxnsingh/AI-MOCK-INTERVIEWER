# Platform Router API Documentation

This document provides a detailed overview of the API endpoints available in the `platform_router`. This router is responsible for core functionalities of the Juggy AI platform, including media management, context handling, real-time interview sessions, and session analysis.

## Table of Contents
- [Media Endpoints](#media-endpoints)
  - [POST /media/upload](#post-mediaupload)
  - [POST /media/upload/v2](#post-mediauploadv2)
  - [GET /media/get-all](#get-mediaget-all)
  - [DELETE /media/delete/{media_uuid}](#delete-mediadeletemedia_uuid)
- [Context & Session Creation Endpoints](#context--session-creation-endpoints)
  - [POST /context/upload](#post-contextupload)
  - [POST /context/upload/v2](#post-contextuploadv2)
- [Session Linking Endpoints](#session-linking-endpoints)
  - [POST /ent/session/link](#post-entsessionlink)
  - [POST /session/link](#post-sessionlink)
- [Live Interview (Chat Completions) Endpoints](#live-interview-chat-completions-endpoints)
  - [POST /v3/chat/completions](#post-v3chatcompletions)
  - [POST /v2/chat/completions](#post-v2chatcompletions)
- [Session Management Endpoints](#session-management-endpoints)
  - [GET /session/analyse/{session_uuid}](#get-sessionanalysesession_uuid)
  - [GET /session/get/{session_uuid}](#get-sessiongetsession_uuid)
  - [GET /session/get-all](#get-sessionget-all)
  - [GET /session/get-all/v2](#get-sessionget-allv2)
  - [GET /session/get-all/paginated](#get-sessionget-allpaginated)
  - [GET /session/get-all/v3](#get-sessionget-allv3)
  - [GET /session/get-all/v4](#get-sessionget-allv4)
  - [GET /session/get-all/v5](#get-sessionget-allv5)
  - [GET /session/get-all/v6](#get-sessionget-allv6)

---

## Media Endpoints

### POST /media/upload
Handles the upload of a media file (e.g., a resume). The file is ingested, and if specified, asynchronously parsed.

- **Request Body**: `multipart/form-data`
  - `file`: The media file to upload.
  - `user_id`: The UUID of the user uploading the file.
  - `to_parse`: A boolean indicating whether to parse the document.
- **Response**:
  ```json
  {
    "message": "document parsed successfully",
    "mediaId": "string"
  }
  ```

### POST /media/upload/v2
An enhanced version of `/media/upload`. In addition to parsing, it also generates a structured version of the resume using an AI agent.

- **Request Body**: `multipart/form-data`
  - `file`: The media file to upload.
  - `user_id`: The UUID of the user uploading the file.
  - `to_parse`: A boolean indicating whether to parse the document.
- **Response**:
  ```json
  {
    "message": "document parsed successfully",
    "mediaId": "string"
  }
  ```

### GET /media/get-all
Retrieves all media files uploaded by the authenticated user.

- **Authentication**: Bearer Token required.
- **Response**: A list of media objects.

### DELETE /media/delete/{media_uuid}
Deletes a specific media file identified by its UUID.

- **Authentication**: Bearer Token required.
- **Path Parameter**:
  - `media_uuid`: The UUID of the media file to delete.
- **Response**:
  ```json
  {
    "message": "media deleted successfully"
  }
  ```

---

## Context & Session Creation Endpoints

### POST /context/upload
Accepts text-based context (like job descriptions) and a media ID to generate interview questions and create a new interview session.

- **Request Body**:
  ```json
  {
    "assessmentArea": "string",
    "mediaId": "string",
    "otherContext": {
      "currentRole": "string",
      "currentCompany": "string",
      "totalProductManagementExperience": "string",
      "totalWorkExperience": "string",
      "targetRole": "string",
      "targetCompany": "string",
      "jobDescription": "string",
      "jobDescriptionLink": "string"
    }
  }
  ```
- **Response**:
  ```json
  {
    "sessionId": "string",
    "sessionQuestions": "string" // JSON string of generated questions
  }
  ```

### POST /context/upload/v2
A newer version that creates a session with the provided context but does not generate questions upfront. Questions are generated dynamically during the interview.

- **Request Body**: Same as `/context/upload`.
- **Response**:
  ```json
  {
    "sessionId": "string"
  }
  ```

---

## Session Linking Endpoints

### POST /ent/session/link
Links a `callId` from a voice provider (like VAPI) to an enterprise interview session.

- **Request Body**:
  ```json
  {
    "callId": "string",
    "sessionId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "linked callid <callId> to session (<sessionId>)"
  }
  ```

### POST /session/link
Links a `callId` to a standard interview session.

- **Request Body**:
  ```json
  {
    "callId": "string",
    "sessionId": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "linked callid <callId> to session (<sessionId>)"
  }
  ```

---

## Live Interview (Chat Completions) Endpoints

These endpoints are designed to be used with VAPI's chat completion API for conducting live, streaming interviews.

### POST /v3/chat/completions
The primary endpoint for enterprise interview sessions. It handles the conversation flow, tool calls, and state management for enterprise-grade interviews.

- **Request Body**: `ChatCompletionRequest` model (OpenAI-compatible)
- **Response**: `StreamingResponse` with server-sent events.

### POST /v2/chat/completions
The endpoint for standard user interview sessions. It manages the conversation, tool calls, and credit usage.

- **Request Body**: `ChatCompletionRequest` model (OpenAI-compatible)
- **Response**: `StreamingResponse` with server-sent events.

---

## Session Management Endpoints

### GET /session/analyse/{session_uuid}
Triggers an analysis of a completed interview session. The analysis is performed by an AI agent.

- **Path Parameter**:
  - `session_uuid`: The UUID of the session to analyze.
- **Response**:
  ```json
  {
    "analysis": "string" // The generated analysis report
  }
  ```

### GET /session/get/{session_uuid}
Retrieves detailed information about a specific interview session.

- **Path Parameter**:
  - `session_uuid`: The UUID of the session.
- **Response**: A session object with its details.

### GET /session/get-all
Retrieves all interview sessions for the authenticated user.

- **Authentication**: Bearer Token required.
- **Response**: A list of session objects.

### GET /session/get-all/v2
An alternative endpoint to retrieve all sessions for a user.

- **Authentication**: Bearer Token required.
- **Response**: A list of session objects.

### GET /session/get-all/paginated
Retrieves all sessions for the authenticated user with pagination.

- **Authentication**: Bearer Token required.
- **Query Parameters**:
  - `page`: The page number.
  - `limit`: The number of items per page.
- **Response**: A paginated list of session objects.

### GET /session/get-all/v3
Another version for retrieving all user sessions.

- **Authentication**: Bearer Token required.
- **Response**: A list of session objects.

### GET /session/get-all/v4
Yet another version for retrieving all user sessions.

- **Authentication**: Bearer Token required.
- **Response**: A list of session objects.

### GET /session/get-all/v5
And another version for retrieving all user sessions.

- **Authentication**: Bearer Token required.
- **Response**: A list of session objects.

### GET /session/get-all/v6
The latest version for retrieving all user sessions.

- **Authentication**: Bearer Token required.
- **Response**: A list of session objects.
