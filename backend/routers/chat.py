from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.groq_client import chat_with_system

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Convert Pydantic models to dicts
        messages_dict = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        reply = chat_with_system(messages_dict)
        return ChatResponse(response=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
