from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import extract, audit, buildings
import os
import shutil
import time

app = FastAPI(title="WayMark Backend API")

@app.on_event("startup")
def cleanup_old_uploads():
    uploads_dir = os.path.join("data", "uploads")
    if not os.path.exists(uploads_dir):
        return
        
    now = time.time()
    cleaned_count = 0
    for item in os.listdir(uploads_dir):
        item_path = os.path.join(uploads_dir, item)
        if os.path.isdir(item_path):
            # If folder is older than 24 hours (86400 seconds)
            if now - os.path.getmtime(item_path) > 86400:
                try:
                    shutil.rmtree(item_path)
                    cleaned_count += 1
                except Exception as e:
                    print(f"Failed to clean up {item_path}: {e}")
    if cleaned_count > 0:
        print(f"Cleaned up {cleaned_count} old upload folders.")

# Setup CORS to allow requests from our frontend
# Allow local dev and the configured frontend URL
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [
    "http://localhost:3000",
    frontend_url
] if frontend_url != "http://localhost:3000" else ["http://localhost:3000"]

# Optional: You can also just use allow_origins=["*"] for a hackathon, 
# but restricting it is safer.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registering the routers that we will create in the next step
app.include_router(extract.router)
app.include_router(audit.router)
app.include_router(buildings.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "WayMark API is running!"}
