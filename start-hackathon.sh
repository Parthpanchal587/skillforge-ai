#!/bin/bash
# SkillForge AI Hackathon Starter Script
# This script helps you quickly start the application for hackathon demo

echo "🚀 Starting SkillForge AI for Hackathon Demo..."

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
  echo "⚠️  Ollama is not running or not accessible at http://localhost:11434"
  echo "   Please make sure Ollama is installed and running:"
  echo "   1. Install Ollama from https://ollama.ai/"
  echo "   2. Run 'ollama serve' in a terminal"
  echo "   3. Pull a model: 'ollama pull llama2'"
  echo ""
  echo "   The application will still work but AI features will show fallback messages."
  echo ""
fi

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend application..."
cd frontend
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application started!"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📝 Hackathon Tips:"
echo "   - Register a new user to get started"
echo "   - Try the AI Mentor chat for instant coding help"
echo "   - Browse courses in the Learning Library"
echo "   - Check out your personalized Dashboard"
echo ""
echo "🛑 To stop the application, run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "💡 Note: Keep this terminal running to maintain the servers"
echo ""

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID