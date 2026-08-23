# SkillForge AI Backend

## Setup for Hackathon

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Courses & Learning
- `GET /api/ai/courses` - Get all courses (with filtering)
- `GET /api/ai/courses/:id` - Get course by ID
- `GET /api/ai/courses/:id/lessons` - Get lessons for a course

### AI Mentor
- `POST /api/ai/chat` - Standard AI chat (non-streaming)
- `POST /api/ai/chat/stream` - Streaming AI chat

## Environment Variables

- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `DB_TYPE` - Database type: 'sqlite' or 'postgres' (default: sqlite)
- `DB_FILE` - SQLite file path (default: ./skillforge_ai.db)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` - PostgreSQL connection details
- `JWT_SECRET` - Secret for JWT tokens
- `OLLAMA_URL` - URL for Ollama API (default: http://localhost:11434)

## Database

By default, the application uses SQLite for simplicity in hackathon environments. The database file `skillforge_ai.db` will be created automatically in the backend directory.

To use PostgreSQL instead:
1. Set `DB_TYPE=postgres` in `.env`
2. Configure the PostgreSQL connection details
3. Make sure PostgreSQL is running and the database exists