# School Admin Portal

A professional-grade web application designed for school administrators to manage students, staff, classes, and communications.

## What This Project Does

This system is a comprehensive administrative platform built for school operations. It allows the principal and office staff to track student records, manage teacher schedules, handle internal messaging, and generate performance reports. 

A key highlight is the built-in "Sync Engine," which allows the application to function perfectly in environments with poor or intermittent internet connectivity. Changes are saved locally and synced to the cloud seamlessly in the background.

## Tech Stack

| Layer    | Technology  | Why               |
| -------- | ----------- | ----------------- |
| Frontend | React 19    | Fast, component-driven UI |
| Backend  | Express.js  | Secure proxy and business logic |
| Database | Supabase    | Real-time PostgreSQL and Auth |
| Styling  | Tailwind v4 | Performance and rapid development |

## Project Structure

```text
root/
├── frontend/
│   ├── components/      # Shared UI components
│   ├── context/         # React Context for global state
│   ├── hooks/           # Custom business logic hooks
│   ├── pages/           # Route-level components
│   ├── services/        # API and local-first sync services
│   └── utils/           # Helper functions and mappers
├── backend/
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth validation
│   │   ├── routes/      # API definitions
│   │   └── services/    # Database queries and external APIs
├── docs/                # System documentation
└── tests/               # E2E and Unit testing
```

## Prerequisites

- Node.js v20+
- A Supabase Project
- Google Gemini API Key
- Git

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Heng787/School_management.git
cd School-system-for-admin
```

### 2. Set up environment variables
Create `.env` files in both the root and `backend/` directories by copying the `.example` files.

### 3. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

### 4. Start the Frontend
```bash
# In the root folder
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:5000`.

## Environment Variables

### Frontend (`/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| VITE_SUPABASE_URL | Yes | Backend proxy / Supabase URL | http://localhost:5000 |
| VITE_SUPABASE_ANON_KEY | Yes | Public anon key | eyJhb... |

### Backend (`/backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| PORT | No | Server port | 5000 |
| SUPABASE_URL | Yes | Supabase project URL | https://xyz.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Service Role Key | eyJhb... |
| JWT_SECRET | Yes | Secret for generating tokens | verysecuresecret |
| GEMINI_API_KEY | Yes | Google AI API Key | AIzaSy... |

## Available Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build frontend for production |
| `npm run test` | Run all unit tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright E2E tests |

## Running Tests

```bash
npm run test
npm run test:coverage
```
Unit tests are co-located with their source files (`*.test.js`). E2E tests are located in `playwright-report` and `tests/e2e/`.

## API Reference

See `docs/api.md` for complete documentation on backend endpoints.

## Deployment

Build the frontend with `npm run build` and deploy the output directory to any static host (Vercel, Netlify). The backend runs as a Node.js process and can be deployed to Render or Heroku.

## Known Issues

- The E2E tests occasionally fail on the `Logout` functionality due to UI transition timing.
- Some complex nested `Supabase` queries lack full mocked coverage in the Vitest environment.
