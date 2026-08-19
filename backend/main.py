from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import extract, audit, buildings
import os

app = FastAPI(title="WayMark Backend API")

# Setup CORS to allow requests from our frontend
origins = [
    "http://localhost:3000",
    # We will add the deployed frontend URL here later
    os.getenv("FRONTEND_URL", "https://your-future-frontend-url.onrender.com"),
]

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
