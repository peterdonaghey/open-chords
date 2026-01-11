#!/bin/bash
# Development setup script
# Runs both Vercel Dev (for API functions) and Vite (for frontend with API proxy)

echo "🚀 Starting Open Chords Development Environment"
echo "=============================================="
echo ""

# Check if already running
if lsof -ti:3002 >/dev/null 2>&1; then
    echo "⚠️  Port 3002 already in use. Killing process..."
    kill $(lsof -ti:3002) 2>/dev/null || true
    sleep 2
fi

if lsof -ti:5173 >/dev/null 2>&1; then
    echo "⚠️  Port 5173 already in use. Killing process..."
    kill $(lsof -ti:5173) 2>/dev/null || true
    sleep 2
fi

echo "✅ Ports cleared"
echo ""

# Start Vercel Dev for API functions
echo "🔧 Starting Vercel Dev (API Functions) on port 3002..."
vercel dev --listen 3002 > /tmp/vercel-dev.log 2>&1 &
VERCEL_PID=$!
echo "   PID: $VERCEL_PID"

# Wait for Vercel Dev to be ready
echo "   Waiting for Vercel Dev to start..."
for i in {1..30}; do
    if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
        echo "   ✅ Vercel Dev ready!"
        break
    fi
    sleep 1
done

echo ""

# Start Vite for frontend (proxies /api to port 3002)
echo "🎨 Starting Vite (Frontend) on port 5173..."
echo "   API requests will proxy to http://localhost:3002"
npm run dev

# Cleanup on exit
trap "kill $VERCEL_PID 2>/dev/null" EXIT

