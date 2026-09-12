let data = '';
process.stdin.on('data', (c) => (data += c));
process.stdin.on('end', () => {
  let command = '';
  try {
    command = JSON.parse(data).tool_input?.command || '';
  } catch {
    process.exit(0);
  }

  const isMigrateDev = /\bprisma\s+migrate\s+dev\b/.test(command);
  const isShadowDb = /--shadow-database-url\b/.test(command);

  if (!isMigrateDev && !isShadowDb) {
    process.exit(0);
  }

  const reason =
    'BLOCKED: `prisma migrate dev` and `--shadow-database-url` are forbidden in this project. ' +
    'Both wiped the shared production Neon DB on 2026-08-06 (two separate incidents, see CLAUDE.md / ADR-019 / ADR-022) ' +
    'because local .env and Vercel production point at the SAME database - there is no separate shadow/dev DB. ' +
    'Instead: 1) edit schema.prisma, 2) hand-write the migration SQL under prisma/migrations/<timestamp>_<name>/migration.sql, ' +
    '3) review it for DROP/DELETE/TRUNCATE, 4) run `npx prisma migrate deploy` (non-interactive, no reset), ' +
    '5) check row counts before/after.';

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })
  );
});
