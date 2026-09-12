---
name: db-migration
description: Safely apply a Prisma schema change to this project's shared Neon Postgres DB (local .env and Vercel production point at the SAME database - no separate shadow/dev DB exists). Use whenever schema.prisma needs to change or a new migration is needed.
---

# DB Migration (ModeAlert)

`prisma migrate dev` and any `--shadow-database-url` flag are hard-blocked by a
PreToolUse hook in `.claude/settings.json` (`.claude/hooks/block-prisma-migrate-dev.js`).
Both wiped the shared production DB in two separate 2026-08-06 incidents (see
`docs/06_DECISIONS.md` ADR-019 and ADR-022) - `DATABASE_URL_UNPOOLED` is the
same database as `DATABASE_URL`, just unpooled, not a real shadow DB.

Follow these steps in order, every time:

1. Edit `schema.prisma` with the desired change.
2. Hand-write the migration SQL - do not run `prisma migrate diff`.
   For additive changes (new column/table/index) this is simple and
   predictable: `ALTER TABLE ... ADD COLUMN`, `CREATE TABLE`, `CREATE INDEX`.
   Use the format of existing files under `prisma/migrations/*/migration.sql`
   as a template.
3. Create `prisma/migrations/<timestamp>_<name>/migration.sql` and paste the
   SQL in. Timestamp format matches existing migration folder names
   (`YYYYMMDDHHMMSS`).
4. Re-read the SQL and confirm it contains no DROP, DELETE, or TRUNCATE -
   only ADD/CREATE should be present. If it does, stop and confirm with
   Deniz before proceeding; a destructive statement here needs explicit sign-off.
5. Before applying, check row counts on a couple of main tables
   (SELECT COUNT(*) FROM "User", etc. via `npx prisma studio` or a short
   script) so an unexpected reset is immediately obvious.
6. Apply with `npx prisma migrate deploy` (non-interactive, does not reset).
7. Check the same row counts again immediately after - they must match step 5.
8. Run `npx prisma generate` (stop the Windows dev server first if running,
   otherwise the generated client DLL is locked and this fails with EPERM).

If Deniz ever provisions a real separate Neon branch/database for
migrations, `--shadow-database-url` becomes safe to use against that
connection string - update the hook script's exemption at that point, but
never before a real separate DB exists.
