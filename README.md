# Anneal — URT Practice Platform

A free, open-source exam practice platform for Egypt NCSS STEM school students.  
Built with **Vite + React + Hono + tRPC + Drizzle ORM + Turso (libSQL)**.  
Deployed on **Vercel Hobby** (free, no credit card). Database on **Turso** (free, no credit card).

---

## One-time setup

### 1. Create a Turso database

```bash
# Install the Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create the database
turso db create urt-platform

# Get the connection URL
turso db show urt-platform

# Create an auth token
turso db tokens create urt-platform
```

### 2. Push the schema

```bash
npm install
DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:push
```

### 3. Import exam data

```bash
DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:import
```

### 4. Set environment variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Your Turso DB URL |
| `DATABASE_AUTH_TOKEN` | Your Turso auth token |
| `ADMIN_PASSWORD` | Admin panel password (you choose) |
| `ADMIN_JWT_SECRET` | Long random string for JWT signing |

Copy `.env.example` to `.env.local` for local development.

### 5. Deploy

Connect this repo to Vercel. Build command is `npm run build`. Done.

---

## Development

```bash
cp .env.example .env.local   # fill in your Turso credentials
npm install
npm run dev
```

## Adding new exams

1. Add your exam data to `db/import-exams.ts`
2. Run `npm run db:import`

Or use the admin panel at `/admin` after setting `ADMIN_PASSWORD`.

---

## Architecture

```
Vercel Hobby (free)          Turso free tier (free)
─────────────────────        ──────────────────────
Frontend (Vite/React)   ──►  All exam data
API (Hono serverless)   ──►  User attempts & scores
Admin panel             ──►  Community uploads (base64 PDF)
```

No filesystem. No S3. No sleep/pause. Purely serverless.
