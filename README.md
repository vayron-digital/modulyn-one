# Modulyn One CRM

> **Built for scale. Designed for speed. Run by founders.**

---

## 🚀 Recent Improvements

- **Admin Sidebar 2.0:** Collapsible, clean, and only visible to Admins/Masters. No more clutter, no more confusion.
- **Supabase Auth: Nailed.** All admin API calls now fetch the latest JWT from Supabase before firing. No more 401s for legit admins.
- **Unified Access Checks:** Admin pages and sidebar now use the same logic: if you're `is_admin`, `admin`, or `master`, you're in. Period.
- **User Creation Flow:** Modern, full-width, and frictionless. All required fields, no more broken profile pics. Backend expects what the UI sends.
- **ON CONFLICT Error? Dead.** Cleaned up duplicate `user_id`s in `presence`, added a unique constraint, and fixed the trigger. User creation is smooth again.
- **Promote to Master:** One-liner SQL to make anyone a Master. No drama.

---

## Table of Contents
- [What's New](#whats-new)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [API & Integrations](#api--integrations)
- [Database & Migrations](#database--migrations)
- [Environment Configuration](#environment-configuration)
- [Supabase RLS and Service Role](#supabase-rls-and-service-role)
- [Setup & Getting Started](#setup--getting-started)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Support](#support)

---

## What's New
- Real-time KPI dashboard with live statistics and analytics
- In-app chat, notification center, and activity feed
- Brochure and document management for properties
- Team management with hierarchy visualization
- Scheduler and calendar for meetings and events
- Cold call tracking and call management
- **Admin Sidebar overhaul: collapsible, role-restricted, and clean**
- **Supabase JWT/auth now handled for all admin API calls**
- **Unified admin access checks (sidebar + pages)**
- **User creation flow: modernized and robust**
- **ON CONFLICT error resolved (presence table constraint)**
- **Promote users to Master with a single SQL update**
- Custom reports and analytics
- Enhanced modularity and code organization

---

## Architecture Overview

The system is composed of a React frontend, a Node.js/Express backend, and a Supabase (PostgreSQL) database. Real-time features are enabled via Socket.IO and Supabase subscriptions. The architecture supports modular feature development and easy integration with third-party services.

- **Frontend:** React 18, TypeScript, Tailwind CSS, React Router, Supabase Client
- **Backend:** Node.js, Express, TypeScript, Supabase
- **Database:** Supabase (PostgreSQL), RLS, Auth, Storage
- **Real-time:** Socket.IO, Supabase subscriptions

Refer to `docs/charts/data-flow.mmd` for a detailed system diagram.

---

## Project Structure

```
modulyn-one/
├── backend/                  # Node.js + Express backend
│   └── src/
│       ├── routes/          # API route handlers
│       ├── services/        # Business logic/services
│       ├── scripts/         # Utility scripts
│       ├── migrations/      # Backend-specific migrations
│       ├── lib/             # Backend utilities
│       └── middleware/      # Express middleware
├── frontend/                 # Main frontend app (React)
│   ├── frontend/
│   │   └── src/
│   │       ├── components/  # UI components (chat, notifications, etc.)
│   │       ├── contexts/    # React contexts (Auth, Sidebar, Theme, Toast)
│   │       ├── hooks/       # Custom React hooks
│   │       ├── lib/         # Utility functions/config
│   │       ├── pages/       # All app pages (dashboard, leads, chat, etc.)
│   │       ├── services/    # API/data services
│   │       ├── types/       # TypeScript types
│   │       ├── assets/      # Static assets (icons, images)
│   │       └── utils/       # Utility helpers
│   ├── public/              # Static files
│   └── scripts/             # Frontend scripts
├── db-migrations/            # Main DB migrations (SQL, README)
├── supabase/                 # Supabase project, migrations, and seeders
│   ├── migrations/
│   ├── supabase/
│   └── seed.sql
├── temp-frontend/            # Sandbox/legacy frontend (not main app)
├── src/                      # (Legacy/shared components/pages)
├── README.md                 # Project overview & onboarding
├── LICENSE                   # License info
├── start-crm.bat             # Windows start script
└── ...                       # Other config/scripts
```

---

## Features

### Dashboard & Analytics
- Real-time KPIs: leads, properties, revenue, conversion rates, calls, tasks
- Trend charts and visual statistics
- Activity feed with real-time updates

### Chat, Notifications, and Activity
- In-app chat widget and chat page
- Notification center with real-time push notifications
- Live activity tracker for all user actions

### Brochures & Document Management
- Upload, manage, and share property brochures
- Developer and admin controls for document workflows

### Team Management & Hierarchy
- Visual organization chart and team management
- Role-based access, permissions, and invitations

### Scheduler & Calendar
- Book meetings, schedule calls, and manage events
- Calendar view for all activities

### Cold Calls & Call Management
- Log, track, and analyze cold calls
- Call notes, outcomes, and follow-ups

### Admin Dashboard & User Management
- Manage users, roles, and permissions
- Team hierarchy and reporting

### Reports & Analytics
- Custom reports, export to CSV/Excel
- Sales, activity, and performance insights

### Properties & Leads
- Full property and lead lifecycle management
- Advanced filters, search, and bulk actions
- Lead dumping, assignment, and requirements tracking

### Tasks & Todos
- Task management, assignment, and completion tracking
- Integration with leads, properties, and calendar

### User Settings
- User profile management
- Password and security settings
- Notification preferences

---

## API & Integrations
- RESTful API endpoints for all modules (see `backend/src/routes`)
- Real-time communication via Socket.IO and Supabase subscriptions
- Supabase Auth for secure login and session management
- Extensible for third-party integrations (e.g., Zapier, Slack)

---

## Database & Migrations
- All migrations are located in `db-migrations/` (see its README for order and details)
- Supabase-specific migrations are in `supabase/migrations/`
- Run migrations in order for a clean database setup
- Row Level Security (RLS) is enforced for all sensitive tables

---

## Environment Configuration

### Backend
- Set the backend port in `backend/.env`:
  ```
  PORT=3000
  ```
- Add Supabase credentials:
  ```
  SUPABASE_URL=...
  SUPABASE_SERVICE_KEY=...
  ```

### Frontend
- Set the backend API URL in `frontend/.env`:
  ```
  VITE_API_URL=http://<YOUR_BACKEND_IP>:3000/api
  ```
- Add Supabase credentials:
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```

**If you change the backend port, update BOTH .env files to match.**

## Supabase RLS and Service Role

Row Level Security (RLS) must be enabled on all sensitive tables (e.g., leads, properties) for security. The backend must use the Supabase **service role key** for unrestricted server-side queries. Ensure a policy like the following exists for each table the backend needs to aggregate:

```sql
create policy "Allow service role to read all leads"
on leads
for select
to service_role
using (true);
```

- Always use the latest version of `@supabase/supabase-js` in the backend to ensure proper RLS and service key handling.
- After any RLS or environment change, restart your backend server to ensure new settings are loaded.

### Troubleshooting

If the dashboard shows zero leads or the backend sees zero rows:
- Confirm the backend `.env` uses the correct `SUPABASE_SERVICE_KEY` and `SUPABASE_URL` (matching your Supabase project and service key).
- Ensure RLS is enabled and the correct `service_role` policy exists for the relevant table.
- Restart the backend after any policy or environment change.
- Update `@supabase/supabase-js` to the latest version in the backend.
- If using Docker or a process manager, ensure the new environment variables are loaded.

---

## Setup & Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd modulyn-one
   ```
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install
   # Backend
   cd ../backend
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example`