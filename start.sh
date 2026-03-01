#!/bin/bash

# Intelligence Studio - Start Script
# Starts both backend (FastAPI) and frontend (Vite) dev servers

DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "Done."
  exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend (FastAPI) on http://localhost:8000..."
cd "$DIR/backend"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "Starting frontend (Vite) on http://localhost:5173..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "  Intelligence Studio is running!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "========================================="
echo "  Press Ctrl+C to stop"
echo ""

wait
