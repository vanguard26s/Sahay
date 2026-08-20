"""
Root app entrypoint alias for cloud deployment platforms.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Sahay on port {port}...")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
