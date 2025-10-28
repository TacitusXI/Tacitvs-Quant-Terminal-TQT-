#!/bin/bash

# 🚀 Tacitvs Quant Terminal - Chart System Startup Script

echo "======================================================================"
echo "🚀 TACITVS QUANT TERMINAL - CHART SYSTEM"
echo "======================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if processes are already running
if [ -f /tmp/api.pid ] && ps -p $(cat /tmp/api.pid) > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  API server already running (PID: $(cat /tmp/api.pid))${NC}"
    echo -e "${BLUE}   To restart, run: ./stop_chart_system.sh${NC}"
    echo ""
else
    # Start Backend API
    echo -e "${BLUE}[1/2] Starting Backend API...${NC}"
    source venv/bin/activate
    cd apps/api
    python main.py > /tmp/api.log 2>&1 &
    API_PID=$!
    echo $API_PID > /tmp/api.pid
    cd ../..
    
    # Wait for API to start
    sleep 3
    
    # Check if API is running
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend API started successfully (PID: $API_PID)${NC}"
        echo -e "   ${BLUE}URL: http://localhost:8080${NC}"
        echo ""
    else
        echo -e "${RED}❌ Failed to start Backend API${NC}"
        echo -e "   Check logs: tail -f /tmp/api.log"
        exit 1
    fi
fi

# Check if frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Frontend already running on port 3000${NC}"
    echo ""
else
    # Start Frontend
    echo -e "${BLUE}[2/2] Starting Frontend UI...${NC}"
    cd apps/ui
    npm run dev > /tmp/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/frontend.pid
    cd ../..
    
    # Wait for frontend to start
    echo -e "${BLUE}   Waiting for Next.js to compile...${NC}"
    sleep 8
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend UI started successfully (PID: $FRONTEND_PID)${NC}"
        echo -e "   ${BLUE}URL: http://localhost:3000${NC}"
        echo ""
    else
        echo -e "${RED}❌ Failed to start Frontend UI${NC}"
        echo -e "   Check logs: tail -f /tmp/frontend.log"
        exit 1
    fi
fi

# Test API endpoint
echo -e "${BLUE}🔍 Testing API endpoints...${NC}"
if curl -s "http://localhost:8080/api/candles?symbol=BTC-PERP&tf=1d&limit=1" | grep -q "time"; then
    echo -e "${GREEN}✅ API /candles endpoint working${NC}"
else
    echo -e "${YELLOW}⚠️  API /candles endpoint issue${NC}"
fi

echo ""
echo "======================================================================"
echo -e "${GREEN}🎉 SYSTEM READY!${NC}"
echo "======================================================================"
echo ""
echo -e "📊 ${BLUE}Backend API:${NC}     http://localhost:8080"
echo -e "🖥️  ${BLUE}Frontend UI:${NC}     http://localhost:3000"
echo -e "🧪 ${BLUE}LAB (Charts):${NC}    http://localhost:3000/LAB"
echo ""
echo -e "${YELLOW}Commands:${NC}"
echo -e "  • Stop system:     ${BLUE}./stop_chart_system.sh${NC}"
echo -e "  • View API logs:   ${BLUE}tail -f /tmp/api.log${NC}"
echo -e "  • View UI logs:    ${BLUE}tail -f /tmp/frontend.log${NC}"
echo -e "  • Test API:        ${BLUE}python test_chart_api.py${NC}"
echo ""
echo -e "${GREEN}Open your browser and navigate to:${NC}"
echo -e "${BLUE}http://localhost:3000/LAB${NC}"
echo ""

