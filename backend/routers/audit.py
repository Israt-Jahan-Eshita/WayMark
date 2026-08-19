from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Path
from typing import List, Optional
import os
import shutil
from services.groq_client import extract_features
from services.checklist_engine import run_checklist
from models.schemas import AuditReport, ChecklistCriterion, AuditResponse
from db.database import save_audit, get_audit as db_get_audit
import json
from datetime import datetime

router = APIRouter(prefix="/audit", tags=["Auditing"])

@router.post("", response_model=AuditResponse)
async def create_new_audit(
    building_name: str = Form(...),
    location: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    reuse_last: bool = Form(False)
):
    save_dir = "data/last_upload"
    os.makedirs(save_dir, exist_ok=True)
    
    file_paths = []
    
    if reuse_last:
        for f in os.listdir(save_dir):
            if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_paths.append(os.path.join(save_dir, f))
        if not file_paths:
            raise HTTPException(status_code=400, detail="No previous photos found to reuse.")
    else:
        if not files or len(files) == 0:
            raise HTTPException(status_code=400, detail="No files provided.")
        if len(files) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 images allowed.")
            
        for f in os.listdir(save_dir):
            try:
                os.remove(os.path.join(save_dir, f))
            except:
                pass
                
        for i, file in enumerate(files):
            # Security: Sanitize extension and prevent traversal
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
        
        report = AuditReport(
            building_name=building_name,
            location=location,
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
