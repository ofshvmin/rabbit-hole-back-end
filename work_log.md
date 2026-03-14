# Work Log — 2026-03-14

## Session Summary
Goal: Seed the database with sample short-form video posts for development/testing.

---

## Changes Made

### 1. Created `seeders/20240101000010-sample-video-posts.js`
A Sequelize seeder file that creates 5 sample users, 5 profiles, and 15 video postings.

**Contents:**
- 5 users: `alex@seed.dev`, `jordan@seed.dev`, `sam@seed.dev`, `mia@seed.dev`, `noah@seed.dev` (password: `password123`)
- 1 profile per user with a generated avatar from dicebear
- 15 `Posting` records of `type: 'video'` using publicly hosted Google sample MP4s and picsum.photos thumbnails

The seeder uses Sequelize models directly (not `queryInterface.bulkInsert`) so the `beforeSave` bcrypt hook fires automatically for password hashing.

**To run locally (once DATABASE_URL is fixed — see below):**
```bash
npx sequelize-cli db:seed --seed 20240101000010-sample-video-posts.js
```

**To undo:**
```bash
npx sequelize-cli db:seed:undo --seed 20240101000010-sample-video-posts.js
```

---

## Errors Encountered

### Error 1: Login returns 500 — seed users not found
**Symptom:** Frontend could not log in as `alex@seed.dev`; API returned 500.

**Root cause:** The seeder had not been run yet. The users did not exist in the database.

**Resolution:** Ran the seeder (see Error 2 below for complications).

---

### Error 2: Seeder fails with "Tenant or user not found"
**Symptom:** Running `npx sequelize-cli db:seed --seed 20240101000010-sample-video-posts.js` failed immediately.

**Root cause:** The `.env` file still contained a stale Supabase `DATABASE_URL`:
```
DATABASE_URL=postgresql://postgres.riezgbedejgdkeyddnjt:...@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```
The project had previously been migrated from Supabase to a Fly.io Postgres cluster (`rabbit-hole-db`), but the local `.env` was never updated. Supabase rejected the connection because the project no longer exists or is paused.

**Resolution:** Could not retrieve the Fly.io `DATABASE_URL` locally (the app `rabbit-hole` was suspended, so SSH was not available, and Fly secrets are write-only via CLI). Instead, bypassed the local seeder entirely and piped raw SQL directly into the Fly Postgres instance using:
```bash
cat seed.sql | fly pg connect --app rabbit-hole-db --database rabbit_hole
```
The SQL:
- Pre-hashed the password using `bcrypt` locally (`node -e "..."`) with the same salt rounds (6) used by the app
- Used `INSERT ... ON CONFLICT DO NOTHING` for idempotency
- Used a `JOIN (VALUES ...)` pattern to associate postings with the correct profiles in a single query

**Outstanding:** The local `.env` `DATABASE_URL` still points to the dead Supabase instance. To run migrations or seeders locally in the future, update `.env` with the correct Fly.io Postgres connection string. This can be retrieved by:
1. Deploying the `rabbit-hole` app and running `fly ssh console --app rabbit-hole -C "printenv DATABASE_URL"`
2. Or using `fly proxy` to tunnel Postgres locally and constructing the URL manually

---

## Seed Data Reference

| Email | Password | Profile Name |
|---|---|---|
| alex@seed.dev | password123 | Alex Rivera |
| jordan@seed.dev | password123 | Jordan Lee |
| sam@seed.dev | password123 | Sam Chen |
| mia@seed.dev | password123 | Mia Torres |
| noah@seed.dev | password123 | Noah Kim |

15 video postings were created across the 5 profiles covering tags: comedy, pets, dance, travel, fitness, fashion, cooking, tech, art, cars, food.
