# School Admin Portal

A comprehensive, offline-ready management information system for an English learning school in Cambodia. Features student, teacher, and class management, attendance tracking, and AI-driven data processing.

## What This Project Does

This portal is designed to manage school operations efficiently, even in areas with unreliable internet connectivity. It allows administrators to track student enrollment, teacher schedules, academic grades, and internal messaging. The system uses a "Local-First" approach, saving all data locally on the device and synchronizing with a central database when online.

## Tech Stack

| Layer    | Technology  | Why               |
| -------- | ----------- | ----------------- |
| Frontend | React 19 | Latest version for optimal performance and hook support. |
| Build Tool | Vite 8 | Ultra-fast development and build times. |
| Styling | Tailwind CSS 4 | Utility-first CSS for rapid, consistent UI development. |
| Database | Supabase (PostgreSQL) | Real-time database and authentication as a service. |
| Local Cache | LocalStorage | Browser-based storage for offline functionality. |
| AI Integration | Google Gemini | Automated data processing (e.g., gender prediction). |
| AI Integration | Google Gemini | Automated data processing (e.g., gender prediction). |

## Project Structure

```
root/
├── components/          # Shared UI components (Modals, Toasts, etc.)
├── context/             # React Context for global state (Auth, Sync)
├── data/                # Static data and local storage management
├── database/            # Database schema and migration scripts
├── docs/                # System documentation and guides
├── hooks/               # Custom React hooks for business logic
├── pages/               # Route-level page components
├── services/            # API, Sync, and Domain services
├── utils/               # Helper functions and utilities
├── public/              # Static assets
└── App.jsx              # Main application component
```

## Prerequisites

- **Node.js** v20+
- **Supabase Account** (for cloud syncing)
- **Google AI API Key** (for Gemini features)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Heng787/School_management.git
cd School-system-for-admin
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Fill in your Supabase URL and Anon Key
```

### 3. Start the application
```bash
npm install
npm run dev
```

## Environment Variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| VITE_SUPABASE_URL | Yes | Your Supabase project URL. |
| VITE_SUPABASE_ANON_KEY | Yes | Your Supabase anonymous API key. |

## Available Scripts

| Script | What it does |
| ------ | ------------ |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Builds the application for production. |
| `npm run preview` | Previews the production build locally. |

## Running Tests
Tests are implemented using Vite's built-in testing capabilities (if configured) or standalone scripts.
- Unit tests: Look for `*.test.js` files co-located with source code.

## API Reference
See [docs/api.md](docs/api.md) for complete service layer documentation.

## Deployment
Configured for deployment on Vercel and Cloudflare Workers. Every merge to the main branch triggers the production pipeline via GitHub Actions.

## Known Issues
- Offline synchronization may require a manual refresh in some browser versions.
- Large Excel imports (>5000 rows) may experience performance dips on mobile devices.
