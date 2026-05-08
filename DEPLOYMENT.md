# Deployment checklist — Vercel + Supabase + Prisma

Follow these steps to deploy this Next.js app with Supabase (Postgres) and Prisma on Vercel.

1) Accounts & repo
  - Create a Supabase project.
  - Push this repo to GitHub and connect it to Vercel.

2) Environment variables (set in Vercel UI for Production and in `.env.local` for local dev)
  - `DATABASE_URL` = Supabase Postgres connection string (e.g. `postgresql://...`).
  - `NEXT_PUBLIC_SUPABASE_URL` = Supabase project URL.
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon/public key.
  - `SUPABASE_SERVICE_ROLE_KEY` = Supabase service role key (server-only).
  - (Optional) `SENTRY_DSN`, `NEXTAUTH_SECRET`, etc.

3) Prisma / database
  - Ensure `prisma` and `@prisma/client` versions match (project uses Prisma v5).
  - On dev: run

```bash
npx prisma generate
npx prisma db push # or npx prisma migrate dev --name init
node prisma/seed.js # optional seed
```

  - In Vercel: `prisma generate` runs automatically during `postinstall` because `postinstall` script is set in `package.json`. If you prefer, add a `vercel-build` script that runs `prisma generate` before `next build`.

4) Vercel settings
  - Build command: `npm run build`
  - Output directory: (leave default)
  - Add environment variables in Project Settings (Production/Preview).

5) Supabase Auth
  - Configure redirect URLs in Supabase Auth -> Settings to include your Vercel domain.

6) Post-deploy verification
  - Visit the Vercel URL and test login/registration flows (if enabled).
  - Check server logs for any Prisma errors (client generation, DB access).

7) Troubleshooting tips
  - If `prisma generate` fails on Vercel, ensure `DATABASE_URL` is available at build time or use `prisma generate --schema=./prisma/schema.prisma` with a placeholder URL and run `prisma db push` at runtime via a deployment hook.

---
If you want, I can add GitHub Actions to run `npx prisma generate && npm run build` on push and produce a preview.
