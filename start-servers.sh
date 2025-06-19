#!/bin/bash

echo "Starting AI Betting Assistant servers..."

# Start backend
echo "Starting backend server on port 4000..."
cd apps/api && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend server on port 3000..."
cd ../web && npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "Servers are starting up..."
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:4000/api/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
wait