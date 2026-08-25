# AABHA AI

**A caring voice for every memory.**

AI-powered cognitive gaming and memory assistance platform for elderly dementia patients.  
SIH26003 — North Eastern Region (NER) Focus.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18 + TypeScript + Vite + Tailwind |
| Backend    | Node.js + TypeScript + Express          |
| Database   | PostgreSQL + Prisma ORM                 |
| AI         | OpenAI GPT-4o-mini                      |
| Voice      | Web Speech API                          |
| Offline    | Service Worker + IndexedDB              |

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your database URL and API keys
```

### 3. Setup Database

```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 5. Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## Demo Credentials

| Role      | Email                    | Password |
|-----------|--------------------------|----------|
| Patient   | demo-patient@aabha.ai   | demo123  |
| Caregiver | demo-caregiver@aabha.ai | demo123  |
| Admin     | demo-admin@aabha.ai     | demo123  |

Or click **"Try Demo"** on the login page.

---

## Project Structure

```
aabha-ai/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Server entry
│   │   ├── config/            # Environment config
│   │   ├── middleware/        # Auth, RBAC, rate-limit
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helpers
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/             # Route pages
│   │   ├── components/        # Shared components
│   │   ├── games/             # Cognitive games
│   │   ├── services/          # API, voice, wake-word
│   │   ├── stores/            # State management
│   │   └── locales/           # i18n translations
│   └── public/
└── README.md
```

---

## Key Features

- 🧠 6 cognitive games with adaptive difficulty
- 🎙️ AABHA AI voice assistant with wake-word activation
- 📖 Memory Passport for personalized activities
- 📊 Caregiver dashboard with analytics
- ⏰ Smart reminder system
- 🔔 Cognitive change detection alerts
- 🌐 Multilingual (English + Hindi)
- 📴 Offline-first with sync
- 🔐 Role-based access control
- ♿ Elderly-friendly accessible UI

---

## API Documentation

All API routes are prefixed with `/api`.

| Method | Route                          | Description           |
|--------|--------------------------------|-----------------------|
| POST   | /api/auth/register             | User registration     |
| POST   | /api/auth/login                | User login            |
| POST   | /api/auth/forgot-password      | Request password reset|
| POST   | /api/auth/reset-password       | Reset password        |
| GET    | /api/auth/me                   | Current user          |
| GET    | /api/patients/:id              | Patient profile       |
| CRUD   | /api/memory-passport/:id       | Memory passport       |
| CRUD   | /api/memory-passport/:id/people| Memory people         |
| CRUD   | /api/memory-passport/:id/items | Memory items          |
| POST   | /api/games/sessions            | Start game            |
| POST   | /api/games/results             | Submit result         |
| GET    | /api/games/history/:patientId  | Game history          |
| POST   | /api/ai/chat                   | AABHA AI chat         |
| CRUD   | /api/reminders                 | Reminders             |
| GET    | /api/alerts/:patientId         | Alerts                |
| GET    | /api/dashboard/caregiver/:id   | Caregiver dashboard   |
| GET    | /api/dashboard/patient/:id     | Patient dashboard     |
| POST   | /api/family-messages           | Family messages       |

---

## Privacy & Safety

- No medical diagnosis claims
- Passwords hashed with bcrypt
- JWT authentication with httpOnly refresh tokens
- Role-based access control
- API keys stored server-side only
- Minimal data collection
- Audit logging

---

## License

Built for Smart India Hackathon 2026. All rights reserved.
