import os
import sys
import json
from datetime import datetime
import glob

# Ensure Python can find our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.groq_client import extract_features
from services.checklist_engine import run_checklist
from models.schemas import AuditReport, ChecklistCriterion

def test_pipeline():
    print("Starting WayMark AI Pipeline Test...")
    
    # Path to sample photos folder (assuming test runs from the backend directory)
    sample_photos_dir = os.path.abspath(os.path.join("..", "frontend", "public", "sample-photos"))
    
    if not os.path.exists(sample_photos_dir):
        print(f"\n[!] Directory not found: {sample_photos_dir}")
        print("Creating the directory for you...")
        os.makedirs(sample_photos_dir)
        print("-> Please place 1-5 sample images (.jpg or .png) inside it and run this script again.")
        return
        
    # Grab images from the directory
    image_paths = glob.glob(os.path.join(sample_photos_dir, "*.jpg")) + \
                  glob.glob(os.path.join(sample_photos_dir, "*.png")) + \
                  glob.glob(os.path.join(sample_photos_dir, "*.jpeg"))
    
    if not image_paths:
        print(f"\n[!] No images found in {sample_photos_dir}")
        print("-> Please place 1-5 sample images inside the folder and run this script again.")
        return
        
    # Groq extraction accepts up to 5 images
    image_paths = image_paths[:5]
    print(f"Found {len(image_paths)} images. Proceeding with extraction...\n")
    
    print("--- [STEP 1/3] Groq Vision Extraction ---")
    try:
        extraction_result = extract_features(image_paths)
        print("Extraction successful! Raw features found:")
        for feat in extraction_result.features:
            print(f" - {feat.feature_name}: {feat.status.upper()} (Note: {feat.confidence_note})")
    except Exception as e:
        print(f"Error during extraction: {e}")
        return

    print("\n--- [STEP 2/3] Checklist Evaluation ---")
    try:
        with open("data/checklist_standard.json", "r") as f:
            checklist_data = json.load(f)
            checklist = [ChecklistCriterion(**c) for c in checklist_data.get("criteria", [])]
            checklist_version = checklist_data.get("version", "unknown")
            
        findings = run_checklist(extraction_result, checklist)
        print(f"Evaluated against {len(checklist)} deterministic rules successfully.")
    except Exception as e:
        print(f"Error during checklist evaluation: {e}")
        return
        
    print("\n--- [STEP 3/3] Generating Final Audit Report ---")
    # Calculate a simple score for the report
    verified_count = sum(1 for f in findings if f.result == "verified")
    score_str = f"{verified_count}/{len(findings)}"
    
    report = AuditReport(
        building_name="Test Building (Sample Photos)",
        score=score_str,
        findings=findings,
        checklist_version=checklist_version,
        created_at=datetime.now()
    )
    
    print("\n================ FINAL REPORT (JSON) ================\n")
    print(report.model_dump_json(indent=2))
    print("\n=====================================================\n")

if __name__ == "__main__":
    test_pipeline()
