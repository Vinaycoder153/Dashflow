import os
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from agent import Assistant
from prompts import ROUTE_TASK_MESSAGE
import logging

load_dotenv()

app = FastAPI(title="AI Voice Assistant API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

# Instantiate the real Assistant agent
assistant = Assistant()

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """Process chat messages through the real Assistant agent."""
    try:
        user_message = req.message.strip()
        if not user_message:
            return {"error": "No message provided"}
        # Compose the prompt for the agent
        prompt = ROUTE_TASK_MESSAGE(user_message)
        # Use the agent's LLM to generate a reply
        response = await assistant.llm(prompt)
        return {"response": response}
    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        return {"error": f"Assistant encountered an error: {str(e)}"}

@app.get("/")
async def root():
    return {"status": "AI Assistant Online", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "assistant": "AI Assistant"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 