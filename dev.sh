#!/bin/bash
# ── DEVELOPMENT SERVER ─────────────────────────────────────────────
# Starts both backend and frontend development servers

# ──────────────────────────────────────────────────────────────────────────────
# dev.sh — Oculus Dei local stack
# Adds PYTHONPATH so uvicorn sees the `backend` package.
# ──────────────────────────────────────────────────────────────────────────────
set -e
export PYTHONPATH="$(pwd)"

# Handle Ctrl+C gracefully
trap cleanup INT
cleanup() {
  echo "📋 Shutting down all services..."
  kill $(jobs -p) 2>/dev/null
  exit 0
}

# Check requirements
check_requirements() {
  echo "🔍 Checking requirements..."
  
  if ! [ -d backend/venv ]; then
    echo "❌ Error: Python virtual environment not found."
    echo "   Please run ./bootstrap.sh first."
    exit 1
  fi
  
  if ! [ -d frontend/node_modules ]; then
    echo "❌ Error: Frontend dependencies not installed."
    echo "   Please run ./bootstrap.sh first."
    exit 1
  fi
}

# Start backend server
start_backend() {
  echo "🔄 Starting backend server on port 8000..."
  cd backend
  source venv/bin/activate
  python -m uvicorn api.adaptive_plan_api:app --host 0.0.0.0 --port 8000 --reload &
  cd ..
}

# Start frontend server
start_frontend() {
  echo "🔄 Starting frontend server on port 5173..."
  cd frontend
  # запускаем настоящий Vite
  npm run dev &
  cd ..
}

# Start memory API server
start_memory_api() {
  echo "🔄 Starting memory API server on port 8001..."
  cd backend
  source venv/bin/activate
  python -m uvicorn api.memory_api:app --host 0.0.0.0 --port 8001 --reload &
  cd ..
}

# Main function
main() {
  echo "⚙️  Oculus Dei Development Environment"
  echo "──────────────────────────────────────"
  
  check_requirements
  
  start_backend
  start_memory_api
  start_frontend
  
  echo "✅ All services started!"
  echo "   Backend: http://localhost:8000"
  echo "   Memory API: http://localhost:8001"
  echo "   Frontend: http://localhost:5173"
  echo "   Press Ctrl+C to stop all services"
  echo "──────────────────────────────────────"
  
  # Wait for all background processes to complete
  wait
}

# Run the main function
main
