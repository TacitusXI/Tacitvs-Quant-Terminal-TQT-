#!/bin/bash

# 🛑 Tacitvs Quant Terminal - Chart System Shutdown Script

echo "======================================================================"
echo "🛑 STOPPING TACITVS QUANT TERMINAL"
echo "======================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Stop API
if [ -f /tmp/api.pid ]; then
    API_PID=$(cat /tmp/api.pid)
    if ps -p $API_PID > /dev/null 2>&1; then
        kill $API_PID 2>/dev/null
        echo -e "${GREEN}✅ Stopped Backend API (PID: $API_PID)${NC}"
    fi
    rm /tmp/api.pid
fi

# Stop Frontend
if [ -f /tmp/frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Stopped Frontend UI (PID: $FRONTEND_PID)${NC}"
    fi
    rm /tmp/frontend.pid
fi

# Kill any remaining processes on ports
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    kill $(lsof -t -i:8080) 2>/dev/null
    echo -e "${BLUE}   Killed remaining processes on port 8080${NC}"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    kill $(lsof -t -i:3000) 2>/dev/null
    echo -e "${BLUE}   Killed remaining processes on port 3000${NC}"
fi

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
echo ""

