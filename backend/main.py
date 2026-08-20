from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import extract, audit, buildings, chat
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
# Allowing all origins for the hackathon to prevent CORS deployment headaches.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registering the routers
app.include_router(extract.router)
app.include_router(audit.router)
app.include_router(buildings.router)
app.include_router(chat.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "WayMark API is running!"}
