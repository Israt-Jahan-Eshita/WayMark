import pytest
from services.checklist_engine import run_checklist
from models.schemas import ExtractionResult, ExtractedFeature, FeatureStatus, ChecklistCriterion, AuditResult

def test_run_checklist_all_detected():
    # Setup
    extraction = ExtractionResult(
        features=[
            ExtractedFeature(feature_name="Ramp", status=FeatureStatus.detected, source_photo_index=0),
            ExtractedFeature(feature_name="Elevator", status=FeatureStatus.detected, source_photo_index=1)
        ]
    )
    checklist = [
        ChecklistCriterion(id="1", label="Ramp", category="Access", description="Is there a ramp?"),
        ChecklistCriterion(id="2", label="Elevator", category="Access", description="Is there an elevator?")
    ]
    
    # Execute
    findings = run_checklist(extraction, checklist)
    
    # Assert
    assert len(findings) == 2
    assert findings[0].result == AuditResult.verified
    assert findings[0].evidence_photo_index == 0
    assert findings[1].result == AuditResult.verified
    assert findings[1].evidence_photo_index == 1

def test_run_checklist_missing_feature():
    # Setup
    extraction = ExtractionResult(
        features=[
            ExtractedFeature(feature_name="Ramp", status=FeatureStatus.detected, source_photo_index=0)
            # Elevator is missing from extraction
        ]
    )
    checklist = [
        ChecklistCriterion(id="1", label="Ramp", category="Access", description="Is there a ramp?"),
        ChecklistCriterion(id="2", label="Elevator", category="Access", description="Is there an elevator?")
    ]
    
    # Execute
    findings = run_checklist(extraction, checklist)
    
    # Assert
    assert len(findings) == 2
    assert findings[0].result == AuditResult.verified
    assert findings[1].result == AuditResult.cannot_verify
    assert "not extracted or visible" in findings[1].note
    assert findings[1].evidence_photo_index is None

def test_run_checklist_not_detected_and_uncertain():
    # Setup
    extraction = ExtractionResult(
        features=[
            ExtractedFeature(feature_name="Ramp", status=FeatureStatus.not_detected, source_photo_index=0),
            ExtractedFeature(feature_name="Elevator", status=FeatureStatus.uncertain, source_photo_index=1)
        ]
    )
    checklist = [
        ChecklistCriterion(id="1", label="Ramp", category="Access", description="Is there a ramp?"),
        ChecklistCriterion(id="2", label="Elevator", category="Access", description="Is there an elevator?")
    ]
    
    # Execute
    findings = run_checklist(extraction, checklist)
    
    # Assert
    assert len(findings) == 2
    assert findings[0].result == AuditResult.flagged
    assert findings[1].result == AuditResult.cannot_verify

def test_run_checklist_case_insensitivity():
    # Setup
    extraction = ExtractionResult(
        features=[
            ExtractedFeature(feature_name="rAmP", status=FeatureStatus.detected, source_photo_index=0)
        ]
    )
    checklist = [
        ChecklistCriterion(id="1", label="Ramp", category="Access", description="Is there a ramp?")
    ]
    
    # Execute
    findings = run_checklist(extraction, checklist)
    
    # Assert
    assert len(findings) == 1
    assert findings[0].result == AuditResult.verified
