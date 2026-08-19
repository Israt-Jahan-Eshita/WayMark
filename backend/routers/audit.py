from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Path, Request
from typing import List, Optional
import os
import shutil
import uuid
import time
import requests
from services.groq_client import extract_features
from services.checklist_engine import run_checklist
from models.schemas import AuditReport, ChecklistCriterion, AuditResponse
from db.database import save_audit, get_audit as db_get_audit
import json
from datetime import datetime

router = APIRouter(prefix="/audit", tags=["Auditing"])

# Simple memory rate limiter: IP -> list of timestamps
RATE_LIMIT_DICT = {}
MAX_REQUESTS_PER_MIN = 5
MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB

def geocode_location(location: str):
    if not location:
        return None, None
    try:
        headers = {"User-Agent": "WayMark-Hackathon-App"}
        resp = requests.get(f"https://nominatim.openstreetmap.org/search?q={location}&format=json&limit=1", headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                return float(data[0]["lat"]), float(data[0]["lon"])
    except:
        pass
    return None, None

@router.post("", response_model=AuditResponse)
async def create_new_audit(
    request: Request,
    building_name: str = Form(...),
    location: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    reuse_last: bool = Form(False)
):
    # Rate limiting logic
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    if client_ip in RATE_LIMIT_DICT:
        # Filter requests in the last 60 seconds
        RATE_LIMIT_DICT[client_ip] = [t for t in RATE_LIMIT_DICT[client_ip] if now - t < 60]
        if len(RATE_LIMIT_DICT[client_ip]) >= MAX_REQUESTS_PER_MIN:
            raise HTTPException(status_code=429, detail="Too many requests. Please wait a minute.")
    else:
        RATE_LIMIT_DICT[client_ip] = []
    RATE_LIMIT_DICT[client_ip].append(now)

    # Use UUID for per-session folder to prevent race conditions
    session_id = str(uuid.uuid4())
    save_dir = os.path.join("data", "uploads", session_id)
    os.makedirs(save_dir, exist_ok=True)
    
    file_paths = []
    
    try:
        if reuse_last:
            # Find the most recently modified folder in data/uploads
            uploads_dir = os.path.join("data", "uploads")
            if not os.path.exists(uploads_dir):
                raise HTTPException(status_code=400, detail="No previous uploads found.")
            
            subdirs = [os.path.join(uploads_dir, d) for d in os.listdir(uploads_dir) if os.path.isdir(os.path.join(uploads_dir, d))]
            if not subdirs:
                raise HTTPException(status_code=400, detail="No previous photos found to reuse.")
                
            latest_dir = max(subdirs, key=os.path.getmtime)
            for f in os.listdir(latest_dir):
                if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                    src = os.path.join(latest_dir, f)
                    dst = os.path.join(save_dir, f)
                    shutil.copy2(src, dst)
                    file_paths.append(dst)
                    
            if not file_paths:
                raise HTTPException(status_code=400, detail="No previous photos found to reuse.")
        else:
            if not files or len(files) == 0:
                raise HTTPException(status_code=400, detail="No files provided.")
            if len(files) > 5:
                raise HTTPException(status_code=400, detail="Maximum 5 images allowed.")
                
            for i, file in enumerate(files):
                # Security: Sanitize extension and check size
                file.file.seek(0, 2)
                size = file.file.tell()
                file.file.seek(0)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail=f"File {file.filename} is too large. Max 5MB.")
                    
                if file.filename:
                    safe_filename = os.path.basename(file.filename)
                    suffix = os.path.splitext(safe_filename)[1].lower()
                    if suffix not in {".jpg", ".jpeg", ".png"}:
                        raise HTTPException(status_code=400, detail=f"Invalid file type: {suffix}. Only JPG and PNG are allowed.")
                else:
                    suffix = ".jpg"
                    
                path = os.path.join(save_dir, f"image_{i}{suffix}")
                with open(path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                file_paths.append(path)

        try:
            extraction_result = extract_features(file_paths)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Groq Extraction failed: {str(e)}")
            
        try:
            with open("data/checklist_standard.json", "r") as f:
                checklist_data = json.load(f)
                checklist = [ChecklistCriterion(**c) for c in checklist_data.get("criteria", [])]
                checklist_version = checklist_data.get("version", "unknown")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load checklist: {str(e)}")
            
        findings = run_checklist(extraction_result, checklist)
        
        verified_count = sum(1 for f in findings if f.result == "verified")
        score_str = f"{verified_count}/{len(findings)}"
        
        # Use provided coordinates or Geocode
        if latitude is not None and longitude is not None:
            lat, lng = latitude, longitude
        else:
            lat, lng = geocode_location(location)
        
        report = AuditReport(
            building_name=building_name,
            location=location,
            latitude=lat,
            longitude=lng,
            score=score_str,
            findings=findings,
            checklist_version=checklist_version,
            created_at=datetime.now()
        )
        
        # Save to database
        saved_audit = save_audit(building_name, report, location)
        
        return saved_audit
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}", response_model=AuditResponse)
async def get_audit(id: str = Path(...)):
    audit = db_get_audit(id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit
