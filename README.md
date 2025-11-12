# Todo App

Todo application for React and Express.js with Auth0 authentication.

## Prerequisites

1. Node.js 20+
2. Docker and Docker Compose

## Installation

### 1. Clone and Setup

```bash
cd todo-app
```

### 2. Configure Environment Variables

For demo purposes, the .env file was created from .env.example in both front and back.

### 3. Run with Docker

```bash
docker compose build
docker compose up
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

### 4. Run Locally (without Docker)

**Backend:**
```bash
cd back
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

**Frontend:**
```bash
cd front
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## API Endpoints

All endpoints require authentication (JWT Bearer token).

### Tasks

- `GET /api/v1/tasks` - Get all user tasks
- `GET /api/v1/tasks/:id` - Get task by ID
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task (soft delete)

## Authentication Flow

1. User clicks "Login" → redirects to Auth0
2. User authenticates on Auth0's hosted page
3. Auth0 redirects back with tokens
4. Frontend stores tokens and attaches to API requests
5. Backend validates JWT on each request
6. User ID extracted from token for data isolation

## Running Tests

### Backend Tests

```bash
cd back

npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd front

npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Run All Tests

```bash
cd back && npm test && cd ../front && npm test
```
