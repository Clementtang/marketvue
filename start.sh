#!/bin/bash

# Stock Dashboard Startup Script
# This script starts both the Flask backend and React frontend

echo "Starting Stock Dashboard..."
echo ""

# Check if Python virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "Virtual environment not found. Creating one..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Start Flask backend in background
echo "Starting Flask backend..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start React frontend
echo "Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=================================="
echo "Stock Dashboard is running!"
echo "=================================="
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to handle script termination
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for background processes
wait
