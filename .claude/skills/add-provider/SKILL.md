---
name: add-provider
description: Add a new game-data provider to ModeAlert following the established EventProvider pattern. Use when integrating a new game's API (event/rotation/season data) into lib/providers/.
---

# Add a Provider (ModeAlert)

Providers are the product's moat. Each one lives in its own directory under
`lib/providers/` and is a thin, swappable adapter: it fetches from one
external API and returns normalized `ProviderEvent[]`. It never touches the
database.

## Before writing code

1. Read `lib/providers/core/provider.ts` for the current `EventProvider` and
   `ProviderEvent` shapes. That file is the contract, not this document.
2. Read an existing provider of similar complexity as a template —
   `lib/providers/foxhole/` is the simplest, `lib/providers/destiny/` is a
   fuller one with an event mapper and tests.
3. Confirm the API needs **no key**, or that a key exists and works. Keys
   pinned to a static IP are unusable (Vercel's IPs are dynamic — this is why
   Supercell's APIs were rejected). Discord-gated keys are unusable from
   Deniz's location without VPN (see ADR-005).
4. **Confirm there is a real live signal.** The status you report must come
   from a live API field or a formula recomputed every sync — never from a
   value that was true when the code was written. If a source looks like it
   has no signal, check what third-party trackers actually call over the
   network before concluding it is impossible (ADR-037 exists because a
   "signal-less" rotation turned out to have a real live endpoint).

## Files to create

Under `lib/providers/<name>/`:

- `types.ts` — the external API's response shapes
- `constants.ts` — base URLs, mode/event id maps
- `client.ts` — HTTP calls only, returns raw typed responses
- `event-mapper.ts` (or `normalizer.ts`) — raw response to `ProviderEvent[]`
- `event-mapper.test.ts` — vitest cases over real captured payloads
- `service.ts` — orchestrates client + mapper, handles failure
- `provider.ts` — the `EventProvider` object (`id`, `name`, `enabled`,
  `getEvents()`), delegating to the service

## Then

1. Register it in `lib/providers/core/registry.ts` — an unregistered provider
   silently never runs.
2. If it needs a key, add it to local `.env` AND to Vercel production env,
   and make the provider degrade gracefully when the key is absent rather
   than crashing the sync.
3. Verify against the live API with real data before declaring it done —
   never from a cached or remembered response.
4. Record the decision in `docs/06_DECISIONS.md` as a new ADR (including the
   rejected alternatives and why), and update the provider list in
   `CLAUDE.md`.
