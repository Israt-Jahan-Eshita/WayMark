from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Optional
from datetime import datetime

class FeatureStatus(str, Enum):
    detected = "detected"
    not_detected = "not_detected"
    uncertain = "uncertain"

class ExtractedFeature(BaseModel):
    feature_name: str
    status: FeatureStatus
    confidence_note: Optional[str] = None
    confidence_note_bn: Optional[str] = None
    source_photo_index: int

class ExtractionResult(BaseModel):
    features: List[ExtractedFeature]

class ChecklistCriterion(BaseModel):
    id: str
    label: str
    category: str
    description: str

class AuditResult(str, Enum):
    verified = "verified"
    flagged = "flagged"
    cannot_verify = "cannot_verify"

class AuditFinding(BaseModel):
    criterion_id: str
    result: AuditResult
    evidence_photo_index: Optional[int] = None
    note: str
    note_bn: Optional[str] = None

class AuditReport(BaseModel):
    building_name: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    score: str
    findings: List[AuditFinding]
    checklist_version: str
    created_at: datetime = Field(default_factory=datetime.now)

class AuditResponse(AuditReport):
    id: str
    building_id: str

class BuildingResponse(BaseModel):
    id: str
    name: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    latest_score: Optional[str] = None
    created_at: datetime

class AuditHistoryResponse(BaseModel):
    building: BuildingResponse
    history: List[AuditResponse]
