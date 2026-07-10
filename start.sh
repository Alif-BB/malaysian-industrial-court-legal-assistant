#!/bin/bash

# Function to handle Ctrl+C (SIGINT) and gracefully terminate all background jobs
cleanup() {
    echo -e "\n\033[1;31mStopping all Legal Assistant services...\033[0m"
    kill $ADK_PID $SEARCH_PID $VITE_PID 2>/dev/null
    wait $ADK_PID $SEARCH_PID $VITE_PID 2>/dev/null
    echo -e "\033[1;32mServices stopped. Goodbye!\033[0m"
    exit 0
}

# Trap SIGINT (Ctrl+C) and run the cleanup function
trap cleanup SIGINT

echo -e "\033[1;34m===================================================\033[0m"
echo -e "\033[1;34mStarting Malaysian Industrial Court Legal Assistant\033[0m"
echo -e "\033[1;34m===================================================\033[0m"

# 1. Start ADK Agent Backend (Port 8082)
echo -e "\n\033[1;35m[1/3] Starting ADK Agent Backend...\033[0m"
./venv/bin/adk web --port 8082 --allow_origins "*" . > /dev/null 2>&1 &
ADK_PID=$!
echo "ADK Backend running on http://127.0.0.1:8082 (PID: $ADK_PID)"

# 2. Start Search Companion API Server (Port 8083)
echo -e "\n\033[1;36m[2/3] Starting Search API Server...\033[0m"
./venv/bin/python search_server.py > /dev/null 2>&1 &
SEARCH_PID=$!
echo "Search Server running on http://127.0.0.1:8083 (PID: $SEARCH_PID)"

# 3. Start React/Vite Frontend (Port 3000)
echo -e "\n\033[1;32m[3/3] Starting Vite Frontend...\033[0m"
npm run dev &
VITE_PID=$!

echo -e "\n\033[1;32m🎉 All services are starting up!\033[0m"
echo -e "👉 Open \033[1;34mhttp://localhost:3000\033[0m in your browser to interact with the Legal Assistant."
echo -e "Press \033[1;33mCtrl+C\033[0m to stop all services simultaneously.\n"

# Wait for background processes to finish
wait
