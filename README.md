# ShockLearn LMS Platform

A production-quality Learning Management System with AI-powered curriculum generation, built with NestJS, Next.js, PostgreSQL, and modern TypeScript practices.

## TL;DR

- Clone repo
- Make sure ports don't conflict, changee if necessary (docker)
- setup.sh
- Environment variables
- npm run dev
- do stuff
- npm run build
- npm start

## Tech Stack

**Backend (NestJS)**
- TypeScript 5.x
- NestJS with Express
- PostgreSQL 15+ (TypeORM)
- GraphQL (Apollo Server)
- Redis (caching)
- JWT Authentication

**Frontend (Next.js)**
- Next.js 14+ (App Router)
- React 18+
- TypeScript 5.x
- Tailwind CSS
- ShadCN UI Components
- React Hook Form + Zod

**AI Integration**
- OpenAI API / Anthropic API
- Custom LLM client abstraction
- Structured prompt management

## Environment variables

Backend (`backend/.env`):
```env
NODE_ENV=development
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=edtech_lms

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d

LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.venice.ai/v1
OPENAI_MODEL=hermes-3-llama-3.1-405b

CORS_ORIGIN=http://localhost:3000
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Instructions

1. Register a new account at http://localhost:3000/register
2. Choose "Teach (Instructor)" to access AI tools
3. Create a course from the instructor dashboard
4. Use AI tools to generate curriculum and quizzes

## 📊 API Documentation (list)


**Authentication**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/logout
```

**Courses**
```
GET    /api/courses              # List all courses
POST   /api/courses              # Create course (Instructor)
GET    /api/courses/:id          # Get course details
PUT    /api/courses/:id          # Update course
POST   /api/courses/:id/publish  # Publish course
```

**AI Agents**
```
POST   /api/ai-agents/generate-curriculum
POST   /api/ai-agents/generate-quiz
GET    /api/ai-agents/recommendations
GET    /api/ai-agents/requests/:id
```

These default to `https://api.openai.com/v1` and `gpt-4-turbo-preview`, so you can point to Venice.ai or any other OpenAI-compatible endpoint without code changes.

### Curriculum Generator

Generates structured course outlines from learning objectives.

**Input:**
```typescript
{
  objectives: string[];
  targetAudience: string;
  durationHours: number;
  prerequisites?: string[];
}
```

**Output:**
- Structured modules and lessons
- Learning objectives per lesson
- Markdown-formatted content
- Pedagogical reasoning

### Quiz Generator

Creates assessment questions based on lesson content.

**Input:**
```typescript
{
  lessonContent: string;
  learningObjectives: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  numberOfQuestions: number;
}
```

**Output:**
- Multiple-choice and short-answer questions
- Correct answers with explanations
- Reasoning for question selection

### Recommendation Agent

Provides personalized learning recommendations.

**Input:**
- Enrollment ID (progress data fetched automatically)

**Output:**
- Prioritized recommendations
- Next lessons, review areas, additional resources
- Data-driven reasoning

## 🔒 Authentication & Authorization

### JWT-based Authentication
- Access tokens (15 min expiry)
- Refresh tokens (7 days expiry)
- Stored in httpOnly cookies (production)

### Role-Based Access Control (RBAC)

**Learner**
- View enrolled courses
- Track progress
- Submit quiz attempts

**Instructor**
- Create and manage courses
- Use AI content generation tools
- Approve AI-generated content
- View course analytics

**Admin**
- Full system access
- User management
- System-wide analytics

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:cov         # Coverage report
npm run test:e2e         # E2E tests

# Frontend tests
cd frontend
npm run test
```

## 📈 Performance & Scalability

### Caching Strategy
- Redis for session storage
- Database query result caching
- Next.js page and data caching

### Database Optimization
- Indexes on foreign keys and common queries
- Connection pooling
- Pagination for list endpoints

### Scalability
- Stateless backend (horizontal scaling ready)
- AI requests can be queued
- Database read replicas for analytics

## 🔮 Future Enhancements

- Video lesson support (Use easystream webrtc logic https://github.com/Bernard-Murphy/EasyStream)
- Pair programming (https://github.com/Bernard-Murphy/NattyMind)
