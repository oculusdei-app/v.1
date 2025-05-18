"""FastAPI endpoints for triggering memory reflections."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.memory.reflector_scheduler import run_reflection_cycle

app = FastAPI(
    title="Oculus Dei Reflector API",
    description="Trigger and inspect memory reflections",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReflectionResponse(BaseModel):
    status: str
    prompt: str | None = None

@app.post("/reflect", response_model=ReflectionResponse, tags=["Reflection"])
async def trigger_reflection(force: bool = True) -> ReflectionResponse:
    """Trigger a reflection cycle and return the generated prompt."""
    try:
        prompt = run_reflection_cycle(force=force)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    if not prompt:
        return ReflectionResponse(status="no_insight", prompt=None)
    return ReflectionResponse(status="success", prompt=prompt)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
