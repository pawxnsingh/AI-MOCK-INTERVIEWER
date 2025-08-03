# Project Management and Operations

This document outlines the key processes for managing the database, deploying the application, and handling server operations.

## Table of Contents
- [Database Management and Migrations](#database-management-and-migrations)
- [Deployment and Operations](#deployment-and-operations)
  - [Backend Deployment](#backend-deployment)
  - [Frontend Deployment](#frontend-deployment)
  - [Database Management in Production](#database-management-in-production)
  - [Log Management](#log-management)
  - [Server Configuration](#server-configuration)
    - [Nginx Proxy](#nginx-proxy)
    - [Domain SSL/TLS Setup](#domain-ssltls-setup)
    - [DNS Management](#dns-management)

---

## Database Management and Migrations

This section covers managing the SQLite database and performing schema migrations using Alembic. It is crucial to follow these steps whenever you make changes to the SQLAlchemy models to ensure the database schema stays in sync with the application's models.

### Step-by-Step Instructions

1.  **Ensure All Models are Registered:**

    Before generating a migration, verify that all your SQLAlchemy models are imported in `models/__init__.py`. This is essential for Alembic's autogenerate feature to detect changes correctly.

    Your `models/__init__.py` should look something like this, importing all model modules:

    ```python
    from .base import Base
    from .users import User
    from .sessions import Session
    from .agents import Agent
    # ... import all other models
    ```

2.  **Generate a New Migration Script:**

    Once you have updated your models and ensured they are registered, run the following Alembic command to automatically generate a new migration script. Replace `'your notes'` with a short, descriptive message about the changes you made.

    ```bash
    alembic revision --autogenerate -m 'your notes'
    ```

    For example:
    ```bash
    alembic revision --autogenerate -m 'Add a new column to the users table'
    ```

    This command will create a new file in the `alembic/versions/` directory containing the migration script.

3.  **Review the Migration Script:**

    It is highly recommended to review the generated migration script to ensure it accurately reflects the changes you intended to make.

4.  **Apply the Migration to the Database:**

    After generating and reviewing the script, apply the migration to update the database schema by running the following command:

    ```bash
    alembic upgrade head
    ```

    This command applies all pending migrations up to the latest version (`head`). Your database schema will now be up-to-date with your models.

---

## Deployment and Operations

This section details the procedures for deploying the backend and frontend applications to an AWS EC2 instance, along with server management instructions.

### Backend Deployment

1.  **Sync Project Files:**
    Use `rsync` to securely copy the project files to the EC2 instance. Exclude unnecessary files and directories to keep the deployment lean.

    **Example `rsync` command:**
    ```bash
    rsync -av  --exclude='venv' --exclude='__pycache__' --exclude='docs' --exclude='.git'  --exclude='.env' --exclude='data'   -e "ssh -i ~/.ssh/juggyaiStagingKey.pem" ~/juggy/backend/ ubuntu@ec2-98-84-170-195.compute-1.amazonaws.com:/home/ubuntu/backend/
    ```

2.  **Start/Restart the Server:**
    SSH into the instance, navigate to the `backend` directory, and use `pm2` to manage the application process.

    -   **For a fresh deployment:**
        Stop any running server, activate the virtual environment, install dependencies, and then start the server with `pm2`.
        ```bash
        pm2 start start_backend.sh --name 'backend-july24'
        ```

    -   **For code changes (restart):**
        If you only updated the code, a simple restart is often sufficient.
        ```bash
        pm2 restart 'existing_backend_process_name'
        ```

### Frontend Deployment

1.  **Sync Project Files:**
    Similar to the backend, use `rsync` to deploy the frontend code. Exclude `node_modules`, `.env`, and the `.next` build directory.

    **Example `rsync` command:**
    ```bash
    rsync -av --exclude='.env' --exclude='.git' --exclude='.next' --exclude='node_modules'  -e "ssh -i ~/.ssh/juggyaiStagingKey.pem" ~/juggy/frontend/ ubuntu@ec2-98-84-170-195.compute-1.amazonaws.com:/home/ubuntu/frontend/
    ```

2.  **Build and Start the Application:**
    SSH into the instance, stop the old process, install dependencies, build the project, and start it with `pm2`. It's good practice to delete the old `pm2` instance to clear any cache.

    ```bash
    # Inside the instance
    cd /home/ubuntu/frontend
    pm2 stop 'old-frontend-name'
    npm install
    npm run build
    pm2 delete 'old-frontend-name'
    pm2 start start_frontend.sh --name 'new-frontend-name'
    ```

### Database Management in Production

-   **Migrations:** Always perform any necessary database migrations *before* starting or restarting the server.
-   **Data Protection:** The `data` directory, which contains the production database, should always be excluded from `rsync` to prevent overwriting it with local test data.
-   **Database Sync:** After each deployment, consider creating a backup of the production database. To test new features that require the latest data, sync the production database down to your local environment *before* creating new migrations. This ensures your local migration history doesn't conflict with the production database.

### Log Management

-   **Location:** Logs are stored in `data/logs/backend.log` on the server.
-   **Accessing Logs:**
    -   You can `scp` or `rsync` the log file to your local machine for analysis.
    -   Alternatively, SSH into the instance and read the file directly.
-   **Live Monitoring:** To view logs in real-time, SSH into the instance and run `pm2 logs`.
-   **Log Rotation:** On each new versioned deployment, remember to back up or version the old log file to keep the main log file clean.

### Server Configuration

#### Nginx Proxy
-   **Role:** Nginx is used as a reverse proxy and load balancer on the EC2 instance.
-   **Configuration:** The main configuration file is located at `/etc/nginx/sites-enabled/default`. You can edit it using `sudo nano /etc/nginx/sites-enabled/default`.
-   **Restarting Nginx:** After any configuration change, you must restart Nginx to apply the changes:
    ```bash
    sudo systemctl restart nginx
    ```

#### Domain SSL/TLS Setup
-   **Tool:** We use `certbot` to automatically obtain and configure SSL/TLS certificates for our domains.
-   **Setup Command:** To generate a certificate for a new domain and configure Nginx:
    ```bash
    sudo certbot --nginx -d your-domain.com --redirect
    ```
    This command will handle the certificate generation and update the Nginx configuration to use HTTPS.

#### DNS Management
-   **Provider:** DNS is managed through Cloudflare.
-   **Dynamic IP Addresses:** Since the EC2 instances do not have a permanent Elastic IP (to save costs), the public IPv4 address will change upon instance restart.
-   **Action Required:** After an instance restarts, you **must** update the `A` or `CNAME` record for the corresponding domain in the Cloudflare DNS settings to point to the new IP address.
-   **New Domains:** Before setting up a new domain on an instance, ensure its `A` or `CNAME` record in Cloudflare points to the instance's IP address. This is a prerequisite for `certbot` to successfully issue a certificate.
