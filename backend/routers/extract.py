from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os
import shutil
from services.groq_client import extract_features
from models.schemas import ExtractionResult

router = APIRouter(prefix="/extract", tags=["Extraction"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

@router.post("", response_model=ExtractionResult)
async def extract_features_route(files: List[UploadFile] = File(...)):
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files provided.")
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed.")
        
    save_dir = "data/temp_uploads"
    os.makedirs(save_dir, exist_ok=True)
    
    file_paths = []
    
    try:
        for i, file in enumerate(files):
            # Security: Sanitize extension and prevent traversal
            if file.filename:
                # Use os.path.basename to strip any path components from filename
                safe_filename = os.path.basename(file.filename)
                suffix = os.path.splitext(safe_filename)[1].lower()
                if suffix not in ALLOWED_EXTENSIONS:
                    raise HTTPException(status_code=400, detail=f"Invalid file type: {suffix}. Only JPG and PNG are allowed.")
            else:
                suffix = ".jpg"
                
            path = os.path.join(save_dir, f"temp_ext_{i}{suffix}")
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_paths.append(path)
            
        extraction_result = extract_features(file_paths)
        return extraction_result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        for path in file_paths:
            try:
                os.remove(path)
            except:
                pass
