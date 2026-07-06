# CA Practice Manager

A production-ready full-stack web application for a Chartered Accountant's team to
manage clients, services, and progress tracking.

Built with **React + Vite + TanStack Router**, **Tailwind CSS**, **Supabase**,
**jsPDF**, and **Lucide React** icons.

## Features

- **Local authentication** (no Supabase Auth) with role-based access control
  stored in `localStorage`.
  - Admin: `admin` / `admin123` — full CRUD, status updates, comments, PDF reports.
  - Employee: `employee` / `emp123` — view, update status, add comments only.
- **Dashboard** summary cards: total clients/services, status breakdown,
  services due today, and overdue services (auto-updating).
- **Inline client list** — each client expands to show services; each service
  expands to reveal a chat-style comments thread.
- **Status pills** with colored states and animations (pulsing glow for
  In Progress, animated checkmark for Completed).
- **Global search** across client name/email/phone/GST and service names.
- **Combinable filters** (status, assigned employee, service name, due date)
  and **sorting** for clients and services.
- **Pagination** — 10 clients per page.
- **Validation** with Zod (email, phone, GST format, required fields, due date
  not earlier than today) and inline errors.
- **Skeleton loaders, toast notifications, empty states, and delete
  confirmation dialogs.**
- **PDF reports** (jsPDF) — generated only when all of a client's services are
  Completed; includes company header, client details, services table, summary,
  footer, and page numbers.
- Responsive SaaS UI with collapsible sidebar (hamburger menu on mobile).

## Getting started

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and provide your Supabase project values:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

These are read at build time; never hardcode credentials.

## Database

The SQL migration in `supabase/migrations/` creates the `clients`, `services`,
and `comments` tables with `ON DELETE CASCADE`, a trigger that manages
`completed_at` based on service status, and disables RLS for development.

## Folder structure

```
src/
 ├── components/   UI + feature components
 ├── routes/       TanStack Router routes (entry page)
 ├── hooks/        data hooks (useAppData)
 ├── context/      AuthContext (local auth)
 ├── services/     Supabase CRUD (api.ts)
 ├── lib/          validation + utilities
 ├── utils/        formatting + PDF generation
 ├── types/        shared TypeScript types
 └── integrations/ Supabase client
```
