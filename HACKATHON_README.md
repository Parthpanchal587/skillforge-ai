# SkillForge AI - Hackathon Prototype

## Overview
SkillForge AI is an AI-powered learning and career platform designed to help engineering students transition from academia to industry readiness. This hackathon prototype demonstrates the core features with minimal setup requirements.

## Features Demonstrated
- User Authentication (Login/Register)
- Personalized Dashboard
- Course Library with filtering
- Detailed Course Pages
- AI Mentor Chat (with streaming responses)
- Resume Builder (placeholder)
- Interview Simulator (placeholder)
- Job Board (placeholder)
- Profile Management

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite (simplified for hackathon)
- **AI Integration**: Ollama (local LLM, no API keys required)
- **State Management**: Zustand
- **HTTP Client**: Axios

## Quick Start (Hackathon Friendly)

### Prerequisites
1. [Node.js](https://nodejs.org/) (v16+)
2. [Ollama](https://ollama.ai/) (for AI features)
3. Git

### Setup Instructions

#### 1. Install Ollama and Pull a Model
```bash
# Install Ollama from https://ollama.ai/
# Then pull a model (this may take a few minutes)
ollama pull llama2
```

#### 2. Clone and Setup the Project
```bash
git clone <your-repo-url>
cd skillforge-ai
```

#### 3. Backend Setup
```bash
cd backend
npm install
# Create .env file (copy from .env.example if needed)
cp .env.example .env  # We'll create a simple version below
npm run dev
```

#### 4. Frontend Setup
```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

#### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Simplified Backend Configuration (.env)
Create a `.env` file in the backend directory with:
```
PORT=5000
FRONTEND_URL=http://localhost:5173
DB_TYPE=sqlite
DB_FILE=./skillforge_ai.db
JWT_SECRET=hackathon_secret_key_change_in_production
OLLAMA_URL=http://localhost:11434
```

### Database Note
This prototype uses SQLite by default (no external database required). The database file will be created automatically in the backend directory.

## Hackathon Demo Tips

### What to Showcase
1. **User Onboarding**: Demonstrate registration and login flow
2. **AI Mentor**: Show the chat capabilities with streaming responses
3. **Course Navigation**: Browse courses and view course details
4. **Personalized Dashboard**: Show progress and recommendations
5. **Responsive Design**: Demonstrate on different screen sizes

### AI Features (Requires Ollama Running)
- Real-time streaming chat with AI mentor
- Context-aware responses about engineering topics
- Code explanation and debugging help
- Concept breakdowns and learning assistance

### Fallback Behavior
If Ollama is not running:
- The application will still work for UI/navigation
- AI chat will show fallback messages
- Course data will use mock data
- This ensures the demo can proceed even with setup issues

## File Structure
```
skillforge-ai/
├── backend/                 # Node.js/Express server
│   ├── controllers/         # Request handlers
│   ├── routes/              # API route definitions
│   ├── config/              # Configuration (database, etc.)
│   ├── .env                 # Environment variables
│   └── server.js            # Entry point
├── frontend/                # React/Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand state management
│   │   ├── services/        # API service layer
│   │   └── App.jsx          # Main app component
│   ├── index.html           # HTML template
│   ├── tailwind.config.js   # Tailwind configuration
│   └── vite.config.js       # Vite configuration
└── package.json             # Root package.json
```

## Troubleshooting

### Common Issues
1. **Ollama not running**: 
   - Make sure Ollama is installed and running (`ollama serve`)
   - Verify the model is pulled: `ollama list`

2. **Port conflicts**:
   - Change PORT in backend/.env if 5000 is taken
   - Change Vite port in frontend/vite.config.js if 5173 is taken

3. **Database errors**:
   - SQLite should create the database automatically
   - Check file permissions in the backend directory

4. **CORS issues**:
   - Ensure FRONTEND_URL in backend/.env matches your frontend URL
   - Check backend/src/server.js CORS configuration

### Demo-Specific Preparation
- Pre-load some sample data in the database (already done via mock fallbacks)
- Have a few conversation starters ready for the AI chat demo
- Test the streaming chat feature beforehand
- Prepare talking points about how each feature helps engineering students

## Customization for Hackathon
You can easily modify:
- Course data in backend/controllers/aiController.js (mock data)
- UI colors/styles in Tailwind configuration
- Feature flags by commenting/uncommenting routes
- AI model by changing the default in AI controller

## This prototype is designed to:
✅ Run completely locally with no external API keys
✅ Demonstrate AI integration using open-source Ollama
✅ Showcase full-stack web development skills
✅ Provide meaningful user interface and experience
✅ Be resilient to common setup issues with fallback behaviors
✅ Highlight modern React and Node.js practices