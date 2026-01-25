#!/bin/bash

echo "🚀 Starting ShockLearn LMS Platform Setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker and try again."
  exit 1
fi

echo "✅ Docker is running"

# Start Docker services
echo "📦 Starting PostgreSQL and Redis..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is ready
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
  echo "⏳ Waiting for PostgreSQL..."
  sleep 2
done

echo "✅ PostgreSQL is ready"

# Install dependencies
echo "📥 Installing dependencies..."

echo "Installing shared package dependencies..."
cd shared
npm install
npm run build
cd ..

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Installing root dependencies..."
npm install

echo "✅ All dependencies installed"

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
  echo "📝 Creating backend .env file..."
  cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env.local ]; then
  echo "📝 Creating frontend .env.local file..."
  cp frontend/.env.local.example frontend/.env.local
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your OpenAI or Anthropic API key"
echo "2. Run 'npm run dev:backend' in one terminal to start the backend"
echo "3. Run 'npm run dev:frontend' in another terminal to start the frontend"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001/api"
echo "   GraphQL:  http://localhost:3001/graphql"
echo ""