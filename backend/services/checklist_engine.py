from typing import List, Dict, Optional
from models.schemas import (
    ExtractionResult,
    ChecklistCriterion,
    AuditFinding,
    AuditResult,
    ExtractedFeature
)

def run_checklist(extraction: ExtractionResult, checklist: List[ChecklistCriterion]) -> List[AuditFinding]:
    """
    Deterministically evaluates extracted features against the standard checklist criteria.
    NO LLM calls occur here; purely rule-based.
    """
    findings: List[AuditFinding] = []
    
    # Create a lookup dictionary mapping feature names (lowercased) to the ExtractedFeature object
    extracted_dict: Dict[str, ExtractedFeature] = {
        feat.feature_name.lower(): feat for feat in extraction.features
    }
    
    for criterion in checklist:
        criterion_label_lower = criterion.label.lower()
        matched_feature = extracted_dict.get(criterion_label_lower)
        
        # Default status if it's missing from the extraction
        result_status = AuditResult.cannot_verify
        evidence_index: Optional[int] = None
        note = "Feature was not extracted or visible in the photos."
        
        if matched_feature:
            # -1 is our indicator for "not visible in a specific photo"
            evidence_index = matched_feature.source_photo_index if matched_feature.source_photo_index >= 0 else None
            note = matched_feature.confidence_note or ""
            
            if matched_feature.status == "detected":
                result_status = AuditResult.verified
                if not note:
                    note = f"Verified presence of {criterion.label}."
            elif matched_feature.status == "not_detected":
                result_status = AuditResult.flagged
                if not note:
                    note = f"{criterion.label} was not detected."
            elif matched_feature.status == "uncertain":
                result_status = AuditResult.cannot_verify
                if not note:
                    note = f"Presence of {criterion.label} is ambiguous."
        
        # Create the finding for this criterion
        finding = AuditFinding(
            criterion_id=criterion.id,
            result=result_status,
            evidence_photo_index=evidence_index,
            note=note
        )
        findings.append(finding)
        
    return findings
