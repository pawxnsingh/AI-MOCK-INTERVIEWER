# Juggy AI Backend

This is the backend for the Juggy AI platform, an AI-powered interview preparation tool. It is built with FastAPI and provides a robust set of APIs for managing users, agents, interviews, payments, and more.

## Directory Structure

The project follows a standard structure for FastAPI applications, separating concerns into different modules.

```
.
├── alembic/              # Alembic database migration scripts
├── alembic.ini           # Alembic configuration file
├── config.py             # Application configuration
├── data/                 # Data files (logs, databases)
│   ├── db/
│   └── logs/
├── main.py               # Main FastAPI application entrypoint
├── models/               # SQLAlchemy ORM models
├── Readme.md             # This file
├── requirements.txt      # Python dependencies
├── routers/              # API routers for different endpoints
│   └── docs/             # Generated API documentation for routers
├── schemas/              # Pydantic schemas for data validation
├── scripts/              # Helper scripts (e.g., database initialization)
├── services/             # Business logic and services
│   └── docs/             # Generated documentation for services
└── utils/                # Utility functions and helpers
```

## Getting Started

Follow these instructions to set up and run the project locally for development and testing.

### Prerequisites

- Python 3.10 or higher
- `venv` for creating virtual environments

### Installation and Setup

1.  **Create and activate a Python virtual environment:**

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Initialize the database:**

    Run the script to create the initial SQLite database and tables. Note :: this is one time only, once the database is created can start the server directly.

    ```bash
    python scripts/init_database.py
    ```

3.  **Install dependencies:**

    Install all the required packages from the `requirements.txt` file.

    ```bash
    pip install -r requirements.txt
    ```

4.  **Create the environment file:**

    Create a `.env` file in the root directory and populate it with the necessary configuration values. Refer to `config.py` to see which variables are required.

    Example `.env` file:
    ```env
    ENVIRONMENT="development"
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"
    GOOGLE_LOGIN_REDIRECT_URL="http://127.0.0.1:8000/auth/"
    # ... and other required variables
    ```

5.  **Run the application:**

    Start the FastAPI server using Uvicorn. The `--reload` flag will automatically restart the server when code changes are detected.

    ```bash
    uvicorn main:app --reload
    ```

    The application will be available at `http://127.0.0.1:8000`.

### API Testing

1.  **Access the API Documentation:**

    Once the server is running, navigate to `http://127.0.0.1:8000/docs` in your browser to access the interactive Swagger UI.

2.  **Authentication for Local Testing:**

    Most API endpoints are protected and require a bearer token for authentication. For local testing, you can use a user's UUID as the token.

    - After creating a user (e.g., through the Google login flow), find their UUID in the database.
    - In the Swagger UI, click the "Authorize" button.
    - In the "Value" field, enter the user's UUID. You do not need the "Bearer" prefix for the built-in FastAPI auth dependency.
    - With the token set, you can now test the protected endpoints as that user.
