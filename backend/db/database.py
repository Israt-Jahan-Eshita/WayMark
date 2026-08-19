import sqlite3
import json
import uuid
import os
from datetime import datetime
from models.schemas import AuditReport, AuditResponse, BuildingResponse, AuditHistoryResponse, AuditFinding

DB_PATH = "data/waymark.db"

def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS buildings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        latitude REAL,
        longitude REAL,
        created_at TEXT NOT NULL
    )
    ''')
    
    # Simple migration to add columns if they don't exist
    for col, col_type in [("location", "TEXT"), ("latitude", "REAL"), ("longitude", "REAL")]:
        try:
            cursor.execute(f"ALTER TABLE buildings ADD COLUMN {col} {col_type}")
        except sqlite3.OperationalError:
            pass # Column already exists
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS audits (
        id TEXT PRIMARY KEY,
        building_id TEXT NOT NULL,
        score TEXT NOT NULL,
        findings TEXT NOT NULL,
        checklist_version TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(building_id) REFERENCES buildings(id)
    )
    ''')
    
    conn.commit()
    conn.close()

def save_audit(building_name: str, report: AuditReport, location: str = None) -> AuditResponse:
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM buildings WHERE name = ?", (building_name,))
    building_row = cursor.fetchone()
    
    if building_row:
        building_id = building_row["id"]
        # Update location/coords if provided
        update_query = "UPDATE buildings SET "
        update_params = []
        if location:
            update_query += "location = ?, "
            update_params.append(location)
        if report.latitude is not None:
            update_query += "latitude = ?, "
            update_params.append(report.latitude)
        if report.longitude is not None:
            update_query += "longitude = ?, "
            update_params.append(report.longitude)
            
        if update_params:
            update_query = update_query.rstrip(", ") + " WHERE id = ?"
            update_params.append(building_id)
            cursor.execute(update_query, tuple(update_params))
    else:
        building_id = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO buildings (id, name, location, latitude, longitude, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (building_id, building_name, location, report.latitude, report.longitude, datetime.now().isoformat())
        )
        
    audit_id = str(uuid.uuid4())
    findings_json = json.dumps([f.model_dump() for f in report.findings])
    created_at = report.created_at.isoformat()
    
    cursor.execute(
        "INSERT INTO audits (id, building_id, score, findings, checklist_version, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (audit_id, building_id, report.score, findings_json, report.checklist_version, created_at)
    )
    
    conn.commit()
    conn.close()
    
    return AuditResponse(
        id=audit_id,
        building_id=building_id,
        building_name=building_name,
        location=location or report.location,
        latitude=report.latitude,
        longitude=report.longitude,
        score=report.score,
        findings=report.findings,
        checklist_version=report.checklist_version,
        created_at=report.created_at
    )

def get_audit(audit_id: str) -> AuditResponse:
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT a.*, b.name as building_name, b.location, b.latitude, b.longitude
        FROM audits a 
        JOIN buildings b ON a.building_id = b.id 
        WHERE a.id = ?
    """, (audit_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    findings_data = json.loads(row["findings"])
    findings = [AuditFinding(**f) for f in findings_data]
    
    return AuditResponse(
        id=row["id"],
        building_id=row["building_id"],
        building_name=row["building_name"],
        location=row["location"],
        latitude=row["latitude"],
        longitude=row["longitude"],
        score=row["score"],
        findings=findings,
        checklist_version=row["checklist_version"],
        created_at=datetime.fromisoformat(row["created_at"])
    )

def list_buildings() -> list[BuildingResponse]:
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT b.id, b.name, b.location, b.latitude, b.longitude, b.created_at,
               (SELECT a.score FROM audits a WHERE a.building_id = b.id ORDER BY a.created_at DESC LIMIT 1) as latest_score
        FROM buildings b
        ORDER BY b.created_at DESC
    """)
    
    rows = cursor.fetchall()
    conn.close()
    
    return [
        BuildingResponse(
            id=row["id"],
            name=row["name"],
            location=row["location"],
            latitude=row["latitude"],
            longitude=row["longitude"],
            latest_score=row["latest_score"],
            created_at=datetime.fromisoformat(row["created_at"])
        ) for row in rows
    ]

def get_building_history(building_id: str) -> AuditHistoryResponse:
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM buildings WHERE id = ?", (building_id,))
    b_row = cursor.fetchone()
    
    if not b_row:
        conn.close()
        return None
        
    cursor.execute("SELECT * FROM audits WHERE building_id = ? ORDER BY created_at DESC", (building_id,))
    a_rows = cursor.fetchall()
    conn.close()
    
    latest_score = a_rows[0]["score"] if a_rows else None
    
    building = BuildingResponse(
        id=b_row["id"],
        name=b_row["name"],
        location=b_row["location"],
        latest_score=latest_score,
        created_at=datetime.fromisoformat(b_row["created_at"])
    )
    
    history = []
    for row in a_rows:
        findings_data = json.loads(row["findings"])
        findings = [AuditFinding(**f) for f in findings_data]
        history.append(
            AuditResponse(
                id=row["id"],
                building_id=row["building_id"],
                building_name=building.name,
                location=building.location,
                score=row["score"],
                findings=findings,
                checklist_version=row["checklist_version"],
                created_at=datetime.fromisoformat(row["created_at"])
            )
        )
        
    return AuditHistoryResponse(building=building, history=history)

init_db()
