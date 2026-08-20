"""
Root entrypoint for deployment on Render, Railway, Vercel, Fly.io, and Heroku.
"""
import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Sahay Disaster Management System on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
