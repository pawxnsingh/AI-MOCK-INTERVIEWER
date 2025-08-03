#!/bin/bash
cd /home/ubuntu/backend
source venv/bin/activate
exec uvicorn  main:app