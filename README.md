# RewardsHub demo — Vercel + Neon persistence

This project stores **demo display names, demo activity timestamps, and task progress** in Neon PostgreSQL. It does not request, transmit, or store Roblox passwords. The display-name/task API is a demo tracker, not a verified Roblox account system.

## Files added/changed

- `index.html` — removed the password input; uses API calls for demo activity, task progress, and admin login/data.
- `api/activity.js` — records demo sign-ins.
- `api/tasks.js` — persists task start times and 2%-per-5-minute progress.
- `api/admin-login.js`, `api/admin-data.js`, `api/admin-logout.js` — server-side admin session and protected data endpoint.
- `api/_lib/auth.js` — signed, time-limited HttpOnly cookie helpers.
- `api/_lib/db.js` — Neon database helper.
- `db/schema.sql` — schema to run once in Neon SQL Editor.
- `.env.example` — variable names only; no secrets.

## Setup in Vercel

1. Push this project to the GitHub repository connected to Vercel. Keep `index.html`, `api/`, `db/`, `package.json`, and `vercel.json` in the repository root.
2. In Vercel, open the project → **Storage / Marketplace** → add/connect **Neon**. Connect it to Production (and Preview if desired). Confirm `DATABASE_URL` exists in Project Settings → Environment Variables. Use the pooled connection string supplied by the integration.
3. Open the connected Neon database → **SQL Editor** → run the entire `db/schema.sql` file once.
4. Create two strong secrets locally, for example with `openssl rand -base64 32` (run twice). In Vercel → Project → Settings → Environment Variables, add:
   - `ADMIN_PASSWORD`: a unique admin password at least 16 characters long.
   - `ADMIN_SESSION_SECRET`: a random secret at least 32 characters long.
   Set both for Production (and Preview if needed). Never put real values in GitHub or in `index.html`.
5. Commit/push changes to GitHub and wait for Vercel to deploy. Environment-variable changes require a new deployment.
6. Open the deployed site. Enter only a demo display name. Start a game task. Open the hidden **ADMIN** link and use the `ADMIN_PASSWORD` value to sign in. The admin page will read records from Neon.

## Local development

Install Node.js 20+, run `npm install`, copy `.env.example` to `.env` and fill in real development values locally. Use `npx vercel dev` to run the Vercel API routes locally. Do not commit `.env`.

## Security notes

- Admin access is checked by the server; the admin password is not hardcoded into the browser. The session cookie is HttpOnly, SameSite=Strict, and Secure on Vercel; sessions expire after 8 hours.
- Use a long, unique admin password and rotate `ADMIN_SESSION_SECRET` to invalidate existing sessions.
- The public demo endpoints accept display names, not passwords. Since this is a public demo without user accounts, display names are not verified identities and can be reused/impersonated. Do not use these records for access control or rewards payouts.
- This simple implementation does not include durable IP-based rate limiting. If you expect public traffic, add a managed rate limiter and abuse monitoring before promoting it broadly.
- The admin endpoint returns at most the latest 500 activity and 500 task rows.
