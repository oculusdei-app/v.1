# Oculus Dei Life Management Backend

This repository contains the backend components for the **Oculus Dei** life management system. The codebase provides in-memory storage of events and an adaptive planning engine, both exposed through FastAPI services.

## Directory Overview

- `backend/api/` – REST services built with FastAPI
  - `memory_api.py` – access to the memory store
  - `adaptive_plan_api.py` – register projects and generate adaptive plans
  - `reflector_api.py` – trigger reflection cycles
  - `assistant_api.py` – proxy requests to OpenAI or Anthropic
- `backend/memory/` – in-memory storage and retrieval utilities
- `backend/core/` – project registry and life optimizer modules
- `backend/agent/` – presence controller used by the optimizer

## Requirements

- Python 3.9 or later
- [FastAPI](https://fastapi.tiangolo.com/)
- [Uvicorn](https://www.uvicorn.org/) (ASGI server)
- [Pydantic](https://docs.pydantic.dev/)

Install the dependencies with:

```bash
pip install fastapi uvicorn pydantic
```

## Running the APIs

### Memory API

Start the memory service on port `8001`:

```bash
python backend/api/memory_api.py
```

Alternatively, you can use `uvicorn` directly:

```bash
uvicorn backend.api.memory_api:app --reload --port 8001
```

Example endpoints:

- `GET /memory/last` – retrieve the most recent entries
- `GET /memory/id/{entry_id}` – retrieve a specific entry by ID
- `DELETE /memory/id/{entry_id}` – delete an entry by ID
- `POST /memory/manual` – create a new memory entry
- `GET /memory/semantic` – semantic search using hashed embeddings
- `GET /memory/search_regex` – regex search across entry content
- `GET /memory/search_metadata` – search entries by partial metadata match

### Adaptive Plan API

Launch the adaptive plan service on port `8000`:

```bash
python backend/api/adaptive_plan_api.py
```

Or run it via `uvicorn`:

```bash
uvicorn backend.api.adaptive_plan_api:app --reload --port 8000
```

Example endpoints:

- `POST /project` – register a project and analyze its impact
- `POST /plan` – generate an adaptive plan based on the registered project

Both services will be available locally at `http://localhost:<port>` once started.

### Reflector API

Run the reflection service on port `8002`:

```bash
python backend/api/reflector_api.py
```

Key endpoint:

- `POST /reflect` – trigger a reflection cycle and return the prompt

### Assistant Proxy API

Proxy service on port `8003` that forwards prompts to either OpenAI or
Anthropic based on provided API keys.

```bash
python backend/api/assistant_api.py
```

Environment variables used if keys are not supplied in the request:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

## Frontend (React + Vite)

A lightweight React interface is provided in the `frontend/` directory. It allows creating memory entries, viewing recent items, and now includes a simple visualization of memory types with optional dark mode support.

### Setup

Install Node dependencies:

```bash
cd frontend
npm install
```

Copy the example environment file and update values if needed:

```bash
cp frontend/.env.example frontend/.env
# Edit frontend/.env to match your backend URLs
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.
Backend endpoints are configured via `frontend/.env` using
`VITE_MEMORY_API_URL` and `VITE_PLAN_API_URL`.

## Combined Local Development

To run all backend services (adaptive plan, memory store and assistant proxy)
alongside the React frontend with automatic updates from `origin/main`, use the
`dev.sh` script:

```bash
./dev.sh
```

The script pulls the latest changes every 10 seconds and leverages `uvicorn` and
`vite` for hot reloading. Press `Ctrl+C` to stop all processes.
