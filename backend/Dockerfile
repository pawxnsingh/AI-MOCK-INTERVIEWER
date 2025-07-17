FROM python:3.12-slim 

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install

# Copy the rest of the application code
COPY . /app

# Ensure the init script is executable
RUN chmod +x /app/scripts/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/scripts/entrypoint.sh"]

# Or if you prefer CMD (ENTRYPOINT is generally better for this use case)
# CMD ["/app/scripts/entrypoint.sh"]