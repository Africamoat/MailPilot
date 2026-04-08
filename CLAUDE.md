# MailPilot

## Project Overview
Internal web app for email prospecting with full prospect tracking. Built for managing contacts, sending personalized emails via Resend, and automating follow-ups.

## Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (minimal UI)
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend API
- **Deployment**: Vercel

## Project Structure
```
src/
  app/              # Next.js App Router pages & API routes
    api/
      contacts/     # GET /api/contacts, POST /api/contacts
      send/         # POST /api/send (campaign send)
      import/       # POST /api/import (CSV/JSON import)
      contact/[id]/ # PATCH /api/contact/:id
      cron/         # GET /api/cron (daily follow-up cron)
    page.tsx        # Dashboard
  lib/
    supabase.ts     # Supabase client
    resend.ts       # Resend client
    scripts.ts      # Email templates/scripts
    utils.ts        # Helpers (personalization, validation)
  components/       # React components
```

## Database
Single table `contacts` in Supabase with fields:
- id (uuid), name, email (unique), company, country
- status: not_contacted | contacted | follow_up | replied
- last_contacted_at, has_replied, follow_up_count, next_follow_up_at, notes

## Key Business Rules
- Never send to contacts with status = replied
- Never send twice in the same day (check last_contacted_at)
- Email is unique (anti-duplicate)
- Follow-up logic: count 0 → script 1, count 1 → script 2, count 2 → script 3
- After follow-up: increment count, set next_follow_up_at = now + 3 days
- Batch sending: max 20 emails per batch

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint
```

## Environment Variables
See `.env.example` for required vars:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- RESEND_API_KEY
- CRON_SECRET
