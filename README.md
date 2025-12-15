# Multi-Tenant API Platform

A self-hosted API marketplace / API gateway with usage tracking, quotas, and admin controls.

## Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB running on localhost:27017

## Quick Start

### 1. Start MongoDB
Make sure MongoDB is running on `localhost:27017`

### 2. Start Backend
```bash
cd backend
.\venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac
uvicorn app.main:app --reload --port 8000
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

## First Steps

1. Register an admin user (first user can set role to "admin"):
   - POST `/api/auth/register` with `{"email": "admin@example.com", "password": "password", "role": "admin"}`

2. Create a plan (as admin)
3. Register client users
4. Assign plans to users
5. Clients can create API keys and use the services

## API Services Available

- `/api/services/weather` - Weather data
- `/api/services/currency` - Currency exchange rates
- `/api/services/random-fact` - Random facts
- `/api/services/ip-lookup` - IP geolocation

All services require `X-API-Key` header.

## Features

- JWT Authentication with RBAC (Admin/Client)
- API Key management (create, revoke, rotate)
- Usage tracking and metering
- Plans with monthly quotas
- Admin dashboard for platform management
- Client dashboard for usage monitoring
