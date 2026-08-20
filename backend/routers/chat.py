from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List
import time
from services.groq_client import chat_with_system

router = APIRouter(prefix="/chat", tags=["Chat"])

RATE_LIMIT_DICT = {}
MAX_REQUESTS_PER_MIN = 15

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    response: str

@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: Request, body: ChatRequest):
    # Rate limiting logic
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    if client_ip in RATE_LIMIT_DICT:
        RATE_LIMIT_DICT[client_ip] = [t for t in RATE_LIMIT_DICT[client_ip] if now - t < 60]
        if len(RATE_LIMIT_DICT[client_ip]) >= MAX_REQUESTS_PER_MIN:
            raise HTTPException(status_code=429, detail="Too many messages. Please wait a minute.")
    else:
        RATE_LIMIT_DICT[client_ip] = []
    RATE_LIMIT_DICT[client_ip].append(now)

    try:
        # Convert Pydantic models to dicts
        messages_dict = [{"role": msg.role, "content": msg.content} for msg in body.messages]
        
        reply = chat_with_system(messages_dict)
        return ChatResponse(response=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
