@echo off
python -m uvicorn app.main:app --port 8001 --reload
