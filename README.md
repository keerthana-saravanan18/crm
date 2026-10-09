# Crest CRM

A React + Vite customer relationship management dashboard built with a modern SaaS layout, module-based CRM pages, and Supabase-ready services.

## Features

- Dashboard with KPI cards and empty states for real Supabase data
- Customer management with add, edit, search, and delete flows
- Lead capture and conversion workflow
- Deal pipeline tracking and pipeline totals
- Task management with statuses, priority filtering, and due-date checks
- Activity logging for calls, meetings, follow-ups, and notes
- Supabase-ready client and services
- Tailwind-based CRM UI and responsive layout

## Tech stack

- React 19
- Vite
- React Router
- Tailwind CSS
- Lucide React
- Supabase JavaScript client

## Local setup

1. Install project dependencies:
   npm install

2. Create your environment file:
   cp .env.example .env

3. Fill in your Supabase values from the Supabase dashboard.

4. Start the dev server:
   npm run dev

5. Open the local Vite URL shown in the terminal.

## Supabase configuration

Add the following values to your environment file:

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

Do not add secret keys, service-role keys, or database passwords to the frontend app.

## Database schema

The SQL setup script is available at [supabase/schema.sql](supabase/schema.sql).

Run the SQL in the Supabase SQL Editor to create the CRM tables, indexes, and RLS policy skeleton.

## Important note

The front-end code is implemented to work with Supabase when credentials are present. If the environment file is not configured yet, the app loads with empty states and setup guidance instead of attempting to connect to a non-existent project.

## Production build

npm run build
