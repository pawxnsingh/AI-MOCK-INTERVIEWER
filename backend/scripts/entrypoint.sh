#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the path to the database file
# This should align with what get_db_path() in utils/path_helpers.py returns
# Assuming the script is run from the project root, or paths are adjusted in Dockerfile WORKDIR
DB_FILE_PATH_SCRIPT="from utils.path_helpers import get_db_path; print(get_db_path('juggyai'))"
DB_FILE=$(python -c "$DB_FILE_PATH_SCRIPT")

if [ -z "$DB_FILE" ]; then
  echo "Failed to run get_db_path('juggyai')"
  exit 1
fi

echo "Checking for database file at: $DB_FILE.db"

# Check if the database file exists
if [ ! -f "$DB_FILE.db" ]; then
  echo "Database file not found. Initializing database..."
  python scripts/init_database.py
else
  echo "Database file found. Skipping initialization."
fi

echo "running any schem migrations using alembic"
alembic upgrade head

# Start the Uvicorn server
echo "Starting Uvicorn server..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload