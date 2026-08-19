from fastapi import APIRouter, HTTPException, Path
from typing import List
from models.schemas import BuildingResponse, AuditHistoryResponse
from db.database import list_buildings as db_list_buildings, get_building_history as db_get_building_history

router = APIRouter(prefix="/buildings", tags=["Buildings"])

@router.get("", response_model=List[BuildingResponse])
async def list_buildings():
    return db_list_buildings()

@router.get("/{id}", response_model=AuditHistoryResponse)
async def get_building_history(id: str = Path(...)):
    history = db_get_building_history(id)
    if not history:
        raise HTTPException(status_code=404, detail="Building not found")
    return history
