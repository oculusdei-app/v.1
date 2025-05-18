"""AI Assistant Proxy API."""

from __future__ import annotations

import json
import os
from typing import Optional
from urllib import request

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class AIRequest(BaseModel):
    """Request body for the AI proxy."""

    model: Optional[str] = "gpt-3.5-turbo"
    prompt: Optional[str] = None
    message: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 256
    openai_key: Optional[str] = None
    anthropic_key: Optional[str] = None
    mode: Optional[str] = None


app = FastAPI(
    title="Assistant Proxy API",
    description="Simple proxy to OpenAI or Anthropic APIs",
    version="0.1.0",
)


def _call_openai(payload: AIRequest, api_key: str) -> str:
    """Send the prompt to OpenAI and return the response text."""

    body = json.dumps(
        {
            "model": payload.model,
            "messages": [{"role": "user", "content": payload.prompt}],
            "temperature": payload.temperature,
            "max_tokens": payload.max_tokens,
        }
    ).encode()

    req = request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
    )

    with request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())
    return data["choices"][0]["message"]["content"]


def _call_anthropic(payload: AIRequest, api_key: str) -> str:
    """Send the prompt to Anthropic and return the response text."""

    body = json.dumps(
        {
            "model": payload.model,
            "messages": [{"role": "user", "content": payload.prompt}],
            "temperature": payload.temperature,
            "max_tokens": payload.max_tokens,
        }
    ).encode()

    req = request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
    )

    with request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode())
    return data["content"][0]["text"]


@app.post("/proxy/ai")
async def proxy_ai(request_body: AIRequest) -> dict:
    """Proxy incoming requests to the configured AI provider."""

    prompt = request_body.prompt or request_body.message
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")

    request_body.prompt = prompt

    openai_key = request_body.openai_key or os.getenv("OPENAI_API_KEY")
    anthropic_key = request_body.anthropic_key or os.getenv("ANTHROPIC_API_KEY")

    try:
        if anthropic_key:
            response_text = _call_anthropic(request_body, anthropic_key)
        else:
            if not openai_key:
                raise HTTPException(status_code=400, detail="OpenAI key missing")
            response_text = _call_openai(request_body, openai_key)
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - network errors
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {"response": response_text}


if __name__ == "__main__":  # pragma: no cover - manual start
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8003)
