import json
import uuid
import os
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Float, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from models.schemas import AuditReport, AuditResponse, BuildingResponse, AuditHistoryResponse, AuditFinding
from dotenv import load_dotenv

load_dotenv()

# Check for DATABASE_URL. If not present, default to local SQLite.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/waymark.db")

# Render sometimes prefixes with postgres:// instead of postgresql://, SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite needs check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class BuildingModel(Base):
    __tablename__ = "buildings"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    location = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(String, nullable=False)
    
    audits = relationship("AuditModel", back_populates="building", order_by="desc(AuditModel.created_at)")

class AuditModel(Base):
    __tablename__ = "audits"
    
    id = Column(String, primary_key=True, index=True)
    building_id = Column(String, ForeignKey("buildings.id"), nullable=False)
    score = Column(String, nullable=False)
    findings = Column(String, nullable=False)
    checklist_version = Column(String, nullable=False)
    created_at = Column(String, nullable=False)
    
    building = relationship("BuildingModel", back_populates="audits")

def init_db():
    if DATABASE_URL.startswith("sqlite"):
        os.makedirs(os.path.dirname(DATABASE_URL.replace("sqlite:///", "")), exist_ok=True)
    Base.metadata.create_all(bind=engine)

def save_audit(building_name: str, report: AuditReport, location: str = None) -> AuditResponse:
    db = SessionLocal()
    try:
        # Find existing building
        building = db.query(BuildingModel).filter(BuildingModel.name == building_name).first()
        
        if building:
            if location:
                building.location = location
            if report.latitude is not None:
                building.latitude = report.latitude
            if report.longitude is not None:
                building.longitude = report.longitude
        else:
            building = BuildingModel(
                id=str(uuid.uuid4()),
                name=building_name,
                location=location,
                latitude=report.latitude,
                longitude=report.longitude,
                created_at=datetime.now().isoformat()
            )
            db.add(building)
            db.flush() # Ensure building ID is generated
            
        audit = AuditModel(
            id=str(uuid.uuid4()),
            building_id=building.id,
            score=report.score,
            findings=json.dumps([f.model_dump() for f in report.findings]),
            checklist_version=report.checklist_version,
            created_at=report.created_at.isoformat()
        )
        db.add(audit)
        db.commit()
        
        return AuditResponse(
            id=audit.id,
            building_id=building.id,
            building_name=building.name,
            location=building.location,
            latitude=building.latitude,
            longitude=building.longitude,
            score=audit.score,
            findings=report.findings,
            checklist_version=audit.checklist_version,
            created_at=report.created_at
        )
    finally:
        db.close()

def get_audit(audit_id: str) -> AuditResponse:
    db = SessionLocal()
    try:
        audit = db.query(AuditModel).filter(AuditModel.id == audit_id).first()
        if not audit:
            return None
            
        findings_data = json.loads(audit.findings)
        findings = [AuditFinding(**f) for f in findings_data]
        
        return AuditResponse(
            id=audit.id,
            building_id=audit.building_id,
            building_name=audit.building.name,
            location=audit.building.location,
            latitude=audit.building.latitude,
            longitude=audit.building.longitude,
            score=audit.score,
            findings=findings,
            checklist_version=audit.checklist_version,
            created_at=datetime.fromisoformat(audit.created_at)
        )
    finally:
        db.close()

def list_buildings() -> list[BuildingResponse]:
    db = SessionLocal()
    try:
        buildings = db.query(BuildingModel).order_by(BuildingModel.created_at.desc()).all()
        results = []
        for b in buildings:
            latest_score = b.audits[0].score if b.audits else None
            results.append(
                BuildingResponse(
                    id=b.id,
                    name=b.name,
                    location=b.location,
                    latitude=b.latitude,
                    longitude=b.longitude,
                    latest_score=latest_score,
                    created_at=datetime.fromisoformat(b.created_at)
                )
            )
        return results
    finally:
        db.close()

def get_building_history(building_id: str) -> AuditHistoryResponse:
    db = SessionLocal()
    try:
        b = db.query(BuildingModel).filter(BuildingModel.id == building_id).first()
        if not b:
            return None
            
        latest_score = b.audits[0].score if b.audits else None
        
        building = BuildingResponse(
            id=b.id,
            name=b.name,
            location=b.location,
            latitude=b.latitude,
            longitude=b.longitude,
            latest_score=latest_score,
            created_at=datetime.fromisoformat(b.created_at)
        )
        
        history = []
        for audit in b.audits:
            findings_data = json.loads(audit.findings)
            findings = [AuditFinding(**f) for f in findings_data]
            history.append(
                AuditResponse(
                    id=audit.id,
                    building_id=audit.building_id,
                    building_name=building.name,
                    location=building.location,
                    latitude=building.latitude,
                    longitude=building.longitude,
                    score=audit.score,
                    findings=findings,
                    checklist_version=audit.checklist_version,
                    created_at=datetime.fromisoformat(audit.created_at)
                )
            )
            
        return AuditHistoryResponse(building=building, history=history)
    finally:
        db.close()

init_db()
