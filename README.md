# TaskFlow — Team Task Management

A production-grade Jira clone built with React, Node.js, PostgreSQL, and Prisma.

---

## ✨ Features

- **Kanban Board** — Drag-and-drop tasks across To Do / In Progress / Done
- **Task Detail Panel** — Slide-in panel with inline editing, comments, activity log
- **Dashboard** — Stat cards, bar charts, donut chart (team workload)
- **Role-Based Access Control**
  - Admins create projects, manage members, delete tasks
  - Members can only update status/description of their assigned tasks
  - New users see a waiting screen until an Admin invites them
- **JWT Auth** — Access tokens in-memory + refresh tokens in httpOnly cookie
- **Multi-project** — Users belong to multiple projects with different roles per project

---

## 🛠 Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | React 18, Vite, TailwindCSS, React Router v6      |
| State      | TanStack React Query v5                           |
| DnD        | @hello-pangea/dnd                                 |
| Charts     | Recharts                                          |
| Backend    | Node.js, Express.js                               |
| Database   | PostgreSQL via Prisma ORM                         |
| Auth       | JWT (access token in-memory + refresh httpOnly)   |
| Validation | Zod (backend + frontend)                          |

---

## 👥 User Roles

| Role   | Can create projects | Can manage members | Can delete tasks | Can update any task |
|--------|--------------------|--------------------|------------------|---------------------|
| Admin  | ✅ Yes             | ✅ Yes             | ✅ Yes           | ✅ Yes              |
| Member | ❌ No              | ❌ No              | ❌ No            | Only assigned tasks (status/description only) |
| New user (no projects) | ❌ No | ❌ No          | ❌ No            | ❌ No               |

### How onboarding works
1. User signs up at `/signup` — account created, no projects
2. User sees "waiting for admin" screen with their email displayed
3. Admin logs in → Projects page → clicks **"X members · Manage"** on a project card
4. Admin copies the signup link and shares it with teammates
5. Admin types the new user's email → selects role → clicks **Add**
6. User now sees the project on their next login

---

## 📁 Project Structure
jira-clone/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # DB schema
│   │   └── seed.js              # Demo data
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic
│   │   ├── routes/              # Express routers
│   │   ├── middleware/          # authGuard, requireAdmin, errorHandler
│   │   ├── validators/          # Zod schemas
│   │   └── server.js
│   └── .env.example
└── frontend/
├── src/
│   ├── api/                 # Axios + API functions
│   ├── components/
│   │   ├── ui/              # Button, Modal, Avatar, Badge...
│   │   ├── layout/          # Sidebar, Navbar, PageWrapper
│   │   ├── board/           # KanbanBoard, Column, TaskCard
│   │   ├── tasks/           # TaskDetailPanel, TaskForm
│   │   └── dashboard/       # StatCard, Charts
│   ├── context/             # AuthContext
│   ├── hooks/               # React Query hooks
│   ├── pages/               # Login, Signup, Projects, Board, Dashboard
│   └── utils/               # Helpers
└── .env.example

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Clone
```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
```

Generate JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run migrations and seed:
```bash
npm run db:generate
npm run db:migrate    # enter "initial" when prompted
npm run db:seed
npm run dev
# → http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Leave VITE_API_URL blank for local dev
npm run dev
# → http://localhost:5173
```

### 4. PostgreSQL (Arch/Omarchy)
```bash
sudo pacman -S postgresql
sudo -u postgres initdb -D /var/lib/postgres/data
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql -c "CREATE USER taskflow WITH PASSWORD 'taskflow';"
sudo -u postgres psql -c "CREATE DATABASE jira_clone OWNER taskflow;"
sudo -u postgres psql -c "ALTER USER taskflow SUPERUSER;"
```

`.env` DATABASE_URL:
DATABASE_URL="postgresql://taskflow:taskflow@localhost:5432/jira_clone"

---

## 🌐 Deploy on Railway

### Services needed
1. PostgreSQL plugin (auto-provides DATABASE_URL)
2. Backend service
3. Frontend service

### Backend service
- Root directory: `backend`
- Build: `npm install && npx prisma generate && npx prisma migrate deploy && node prisma/seed.js`
- Start: `node src/server.js`
- Env vars:
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<different-strong-secret>
NODE_ENV=production
FRONTEND_URL=<your-frontend-railway-url>

### Frontend service
- Root directory: `frontend`
- Build: `npm install && npm run build`
- Start: `npx serve -s dist`
- Env vars:
VITE_API_URL=<your-backend-railway-url>

---

## 🔑 API Reference

All routes at `/api/v1`. Protected routes require `Authorization: Bearer <token>`.

### Auth
POST /auth/signup     Register
POST /auth/login      Login → JWT + cookie
POST /auth/refresh    Rotate access token
POST /auth/logout     Clear cookie
GET  /auth/me         Current user

### Projects
GET    /projects                    List your projects
POST   /projects                    Create project (Admin only)
GET    /projects/:id                Project detail + members
PUT    /projects/:id                Update (Admin only)
DELETE /projects/:id                Delete (Admin only)
POST   /projects/:id/members        Add member by email (Admin only)
DELETE /projects/:id/members/:uid   Remove member (Admin only)

### Tasks
GET    /projects/:id/tasks              List tasks (filterable)
POST   /projects/:id/tasks              Create task
GET    /projects/:id/tasks/:tid         Task detail + comments
PUT    /projects/:id/tasks/:tid         Update task *
DELETE /projects/:id/tasks/:tid         Delete (Admin only)
PATCH  /projects/:id/tasks/reorder      Reorder after drag-drop
POST   /projects/:id/tasks/:tid/comments       Add comment
DELETE /projects/:id/tasks/:tid/comments/:cid  Delete comment
GET    /projects/:id/tasks/dashboard    Dashboard stats
> *Members can only update `status` and `description` on tasks assigned to them

### Error format
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only Admins can create projects."
  }
}
```

---

## 🌱 Demo Credentials

After running `npm run db:seed`:

| Role   | Email              | Password  |
|--------|--------------------|-----------|
| Admin  | admin@demo.com     | Demo1234  |
| Member | member@demo.com    | Demo1234  |

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- Access tokens in-memory only (not localStorage) — XSS safe
- Refresh tokens in httpOnly cookies — XSS safe
- Helmet.js security headers
- CORS locked to frontend origin
- Zod validation on all inputs
- Stack traces never exposed in production
