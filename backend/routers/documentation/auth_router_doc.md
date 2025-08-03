# Auth Router API Documentation

This document provides a detailed overview of the API endpoints available in the `auth_router`. This router handles user authentication using Google OAuth, facilitating a secure and streamlined login and registration process.

## Table of Contents
- [GET /auth/login](#get-authlogin)
- [GET /auth/](#get-auth)

---

### GET /auth/login
Initiates the Google OAuth login process. This endpoint redirects the user to Google's authentication page.

- **Request**: A standard GET request to this endpoint.
- **Process**:
  1. The endpoint is called, typically when a user clicks a "Login with Google" button.
  2. It uses the `oauth.google.authorize_redirect` method from the `Authlib` library.
  3. The user is redirected to the Google OAuth consent screen, where they can grant permission for the application to access their profile information.
  4. After authentication, Google redirects the user back to the specified `redirect_uri`.
- **Response**: A `RedirectResponse` to the Google OAuth authorization URL.

### GET /auth/
This is the callback endpoint that Google redirects to after the user has authenticated. It handles the token exchange, user information retrieval, and user creation or login.

- **Request**: This endpoint is called by Google with an authorization code in the query parameters.
- **Process**:
  1. **Token Exchange**: The authorization code is exchanged for an access token from Google.
  2. **User Info Retrieval**: The access token is used to fetch the user's profile information (email, name, Google ID) from Google's `userinfo` endpoint.
  3. **User Creation/Login**:
     - The `create_or_get_user` service is called with the user's details.
     - If the user already exists in the database, their information is retrieved.
     - If the user does not exist, a new user account is created.
  4. **Redirection**: The user is redirected to the frontend application, with a user-specific token included in the URL as a query parameter. This token is used to authenticate the user within the application.
- **Response**: A `RedirectResponse` to the frontend application's post-authentication URL (e.g., a dashboard or home page). If an error occurs, it redirects to an error page.
