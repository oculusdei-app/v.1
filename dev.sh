#!/bin/zsh
set -e

# Start auto-pulling latest changes from origin/main every 10 seconds
(
  while true; do
    git pull --ff-only origin main >/dev/null 2>&1 || echo "git pull failed"
    sleep 10
  done
) &
PULL_PID=$!

# Start backend with hot reload
uvicorn backend.api.adaptive_plan_api:app --reload --port 8000 &
BACKEND_PID=$!

# Start frontend development server
npm --prefix frontend run dev -- --port 5173 &
FRONTEND_PID=$!

# Ensure child processes are terminated on exit
trap "kill $PULL_PID $BACKEND_PID $FRONTEND_PID" INT TERM EXIT

# Wait for backend and frontend to exit
wait $BACKEND_PID $FRONTEND_PID
