# 09 - Product Backlog

> Living roadmap for ModeAlert.
>
> Every feature starts here before implementation.
> Completed items are moved to the Done section.
>
> Priority:
>
> - P0 = Critical
> - P1 = High
> - P2 = Nice to have
> - P3 = Future

---

# CURRENT MILESTONE

Current Goal:

> Build the first production-ready version capable of detecting Riot game events automatically and notifying users.

Target:

- MVP Release

Status:

🟢 Live in production (2026-08-04) — https://modealert.vercel.app
(feature/landing-page-v2 branch, auto-deploys on push)

Next milestone: real auth (Phase 7) — ✅ landed (2026-08-05), see
"P2 — User Accounts" and docs/06_DECISIONS.md ADR-005. Following
milestone: Phase 8 (Premium/monetization), now unblocked since real
per-user identity exists.

---

# P0 — Core Infrastructure

## Provider Architecture

Status: ✅

- Generic Provider interface
- Riot Provider
- CommunityDragon Provider
- Provider Registry
- Provider Executor

---

## Repository Layer

Status: ✅

- Event Repository
- Game Repository
- Notification Repository
- Watchlist Repository
- Event History Repository

---

## Service Layer

Status: ✅

- Event Service
- Sync Service
- Provider Sync
- Event Change Detector
- Event Change Handler
- Notification Trigger

---

## Prisma

Status: ✅

- schema
- migrations
- seed

---

# P0 — Riot Integration

## Riot Local Client

Status: 🟡

Scope: Kişiselleştirme amaçlı (bkz. docs/06_DECISIONS.md ADR-001).
Event keşfi LCU üzerinden YAPILMAZ.

Completed

- connect to LCU
- authentication
- gameflow endpoint
- current summoner

Remaining

- endpoint mapping (kişiselleştirme endpoint'leri için)
- current game context extraction
- polling abstraction

---

## Riot API

Status: 🟢

Completed

- Champion Rotation
- Platform Status
- **Valorant provider** (`lib/providers/valorant/`) — platform status +
  aktif act/episode tespiti, `eu.api.riotgames.com`. DB'de doğrulandı.

Future

- Clash
- Ranked data
- TFT
- LoR

---

# P0 — CommunityDragon

Status: 🟢

Completed

- queues
- maps
- game modes
- event hub (gerçek `EventProvider` olarak bağlandı, DB'ye senkronize
  oluyor — bkz. docs/06_DECISIONS.md ADR-001/ADR-002)
- PBE patchline desteği (`/live` sayfasında live vs pbe karşılaştırması)
- **PBE aday event senkronizasyonu** — **tamamlandı (2026-08-06).**
  ADR-001'in planlayıp hiç uygulamadığı parça: PBE'de olup live'da
  olmayan event-hub girdileri artık ayrı bir provider'la
  (`communitydragon-pbe`) gerçekten DB'ye senkronize oluyor, `(PBE
  Preview)` etiketiyle — onboarding/dashboard'da normal bir event
  gibi track edilebiliyor. Bkz. ADR-017.

Remaining

- ~~rotating modes~~ — **araştırıldı, çözülemedi (2026-08-06).** URF/
  Arena/ARAM Mayhem gibi rotasyonlu "featured game mode"lar
  `queues.json`'da tüm 420 kuyruğu (URF dahil) tarihsiz/aktiflik
  bilgisi olmadan döndürüyor — OpenDota'nın "her zaman her şeyi döner,
  aktif filtre yok" sorunuyla aynı sınıf. Keyless, güvenilir bir "şu an
  rotasyonda olan mod" kaynağı bulunamadı. Bkz. ADR-017. **Düzeltme
  (2026-08-06, ADR-020):** ADR-017 "event-hub.json'da hiç yok" demişti
  ama bu yanlıştı — Mayhem'in ~4 aylık battle-pass penceresi orada
  gerçekten var, sadece jenerik "Season pass" etiketi altında
  gizlenmişti ve LIVE gösteriliyordu (yanıltıcı — "mod açık" değil
  "pass penceresi açık" anlamına geliyor). O oturumda normalizer'dan
  tamamen filtrelenmişti. **Karar değişti (2026-08-12, ADR-023):**
  Deniz'in isteğiyle artık tamamen gizlenmiyor — `SEASON_PASS`
  kategorisiyle, "bu sadece battle-pass penceresi, modun kendisi şu an
  rotasyonda mı bilinmiyor" notuyla dürüstçe geri geldi. Asıl teknik
  sonuç hâlâ değişmedi: "şu an rotasyonda mı" sorusuna hâlâ cevap yok,
  Riot/CommunityDragon ileride böyle bir endpoint sunarsa yeniden
  değerlendirilmeli.
- arena metadata (cherry-lobby.json henüz kullanılmıyor)
- event-passes.json entegrasyonu

---

# P0 — Notification Engine

Status: 🟡

Completed

- Provider abstraction (`NotificationProvider` — recipient/event/previous
  alır)
- Per-recipient dispatch (`notificationTriggerService` her watchlist
  kaydı için ayrı ayrı gönderiyor, tek provider-level çağrı değil)
- Notification DB kaydı (daha önce hiç yazılmıyordu — her gönderim artık
  `Notification` tablosuna işleniyor, `read` durumu, `channel` ayrımıyla)
- **Email provider** (Resend, `lib/notifications/email/`) — HTML + text,
  `RESEND_API_KEY` yoksa otomatik disabled olur, pipeline'ı bozmaz.
  Uçtan uca doğrulandı (gerçek event değişikliği → console + DB kaydı).
  Gerçek e-posta gönderimi için Deniz'in resend.com'da hesap açıp key
  vermesi gerekiyor (bkz. docs/06_DECISIONS.md).
- Console provider (ops/debug amaçlı, kalıcı)

Need

- Notification Queue
- Notification Scheduler (şu an sadece cron sync tetikliyor)
- Notification Rate Limiter
- ~~Unsubscribe mekanizması~~ — **çözüldü (2026-08-05).** `/signin`
  "Unsubscribe anytime" diyordu ama gerçek bir mekanizma yoktu.
  `User.emailOptOut` + HMAC tabanlı, DB'de ayrı token tablosu
  gerektirmeyen imzasız link (`/api/unsubscribe`), her e-postanın
  altında. Bkz. docs/06_DECISIONS.md ADR-007.
- ~~Retry Policy (tek deneme, başarısızlık sadece loglanıyor)~~ —
  **tamamlandı (2026-08-05 retry, 2026-08-06 kalıcı kayıt).**
  `notification-trigger.service.ts` her gönderimi 3 deneme, artan
  gecikmeyle (500ms/1s) yapıyor (artık `lib/utils/retry.ts` paylaşılan
  helper'ı üzerinden — kendi kopyası değil). 3 deneme de başarısız
  olursa artık `NotificationFailure` tablosuna kalıcı kayıt düşüyor
  (Vercel log'larının aksine kaybolmuyor), `/statistics`'te gerçek bir
  success rate'e dönüşüyor. Hâlâ yapılmayan (bilinçli, trafik hacmine
  göre erken optimizasyon olurdu): ayrı bir queue/worker altyapısı,
  başarısızlık için otomatik alarm/bildirim.

Future — bilinçli olarak ertelendi

- **Discord** — Türkiye'de erişim sorunu var, en sona bırakıldı
  (Deniz'in isteği)
- Telegram
- Push

---

# P0 — Event Engine

Status: 🟡

Completed (bkz. docs/06_DECISIONS.md ADR-002)

- Event comparison (yeni/güncellenen — `eventChangeDetectorService`)
- Detect new event
- Detect updated event
- Detect removed event (`source`'a göre scoped expiry — bir provider'ın
  artık raporlamadığı event otomatik ENDED olur)
- Historical tracking (LIVE/TRACKING → history start, ENDED → history
  finish)
- **Event descriptions** — **eklendi (2026-08-06).** `Event.description`
  alanı ve tüm 10 provider'da gerçek, uydurulmamış açıklama üretimi.
  Onboarding/`/games/[slug]`/dashboard'da gösteriliyor. Bkz. ADR-018.

Remaining

- Predict expiration (Phase 5 — Prediction Engine kapsamına ertelendi)
- Confidence score (Phase 5)

---

# P0 — Onboarding

Status: 🟢

Completed (2026-08-04)

- Was the site's main broken CTA: every "Start Tracking" button led
  to a static placeholder page. Now a real 3-step flow: Games →
  Events → Finish.
- Fixed a real bug found while wiring it up: `GameSelector` called
  `gameService.getAllGames()` (Prisma) directly from a `"use client"`
  component — would have crashed the moment it rendered. Switched to
  the `useGames()` hook.
- Finish step creates real Watchlist rows via `/api/watchlists`,
  redirects to `/dashboard`.
- The old 4th step ("Create your account") was removed rather than
  faked — there's no auth system yet, so it's out until Phase 7.

Remaining

- Nothing blocking. Revisit once auth exists to add a real account
  step and per-user identity instead of the "demo" user.

---

# P0 — Dashboard

Status: 🟢

Completed (2026-08-04)

- Live statistics (Watching / Live Now / Next Event — scoped to the
  real watchlist, not global event count)
- "Your Watchlist" (only watched events) + "All Events" (browse/add)
  sections, grouped by status (Live/Upcoming/Tracking/Ended)
- Real add/remove watchlist toggle (star button), optimistic UI
- Corporate-quality visual pass: real fonts (was accidentally
  rendering in browser-default serif — see docs/06_DECISIONS.md),
  gradient accent system, skeleton loading states

Done (2026-08-05)

- ~~Notification history view~~ — `/dashboard/notifications` added
  (All/Unread filter, mark read/mark all read, reuses the existing
  `NotificationItem`/`EmptyState` components). Linked via a "See all
  notifications" footer in the navbar bell dropdown
  (`notification-center.tsx`).

- ~~Sync health / provider status page~~ — public `/status` page added
  (`hooks/use-provider-health.ts`, 60s auto-refresh), linked from the
  footer. `/api/providers/health` existed with zero consumers before
  this — another instance of the "written but not connected" pattern,
  this time backend-only.

- ~~`/live` only showed League of Legends~~ — added an "All Games —
  Live Status" section (`components/live/all-games-status.tsx`) above
  the existing LoL-specific PBE early-signal deep dive, grouping every
  tracked event by game with its LIVE/UPCOMING/TRACKING status badge.
  Reuses `useEvents()` (already existed, already used by
  dashboard/onboarding) — no new API route needed.

- ~~Marketing copy across the site said "Fortnite" as one of the three
  live-supported games~~ — Fortnite has no working provider (empty
  `crawler/*/get-events.ts`, placeholder `Game` row only). Swapped to
  Destiny 2 (the game that's actually real) across FAQ, hero, landing
  sections, OG image, and every page's meta description. Same class
  of fix as the earlier "hourly" → "daily" correction — false claims
  in indexed/shared content are worse than in throwaway UI text.

- ~~Destiny 2's icon fell back to an unsized emoji span~~ — added
  `SiBungie` (react-icons/si has an official Bungie mark) to
  `GAME_BRAND_ICONS`, matching every other game. Also hardened the
  emoji fallback itself (`game-icon.tsx`) to scale with the `size`
  prop, so the same bug can't silently recur for the next game added
  without a mapped icon.

- Follow-up caught while fixing the above: `/games` still showed
  Fortnite with fabricated stats ("150K players tracking", "6
  supported events") even after the copy elsewhere was corrected to
  say "3 real games" — self-contradictory. Added
  `GAMES_WITH_PROVIDER` (`lib/constants/games.ts`, derived from
  `GAME_IDS`) as the single source of truth for "has a real provider."
  `GameCard` now shows "Tracking coming soon" instead of fake numbers
  for games without one; onboarding's `GameSelector` filters them out
  entirely so users can't pick a game, reach the event-selection step,
  and hit an empty list with no path forward.

- ~~Homepage "ModeAlert Dashboard" preview widget hardcoded URF as
  LIVE~~ and ~~`Game.activeUsers` ("players tracking") was a
  hand-written marketing number from the seed~~ — both fixed
  (2026-08-05), see docs/06_DECISIONS.md ADR-007. Homepage now shows
  real synced events and real watchlist-derived counts; homepage
  Games teaser trimmed to only real-provider games (Fortnite still
  shown on the full `/games` page).

- ~~No account settings page — signed-in users couldn't manage
  anything~~ — **done (2026-08-05).** `/dashboard/settings`: set/change
  password (works for OAuth-only accounts too), toggle email
  notifications (same `emailOptOut` flag the unsubscribe link uses),
  delete account. Deleting required adding `onDelete: Cascade` to
  `Watchlist.user`/`Notification.user` (only `Account`/`Session` had
  it before) — without it, deleting a user with any watchlist activity
  would have failed on a foreign-key constraint. Verified end-to-end
  including the cascade actually removing a real watchlist row.

---

# P1 — SEO & Discoverability

Status: 🟢 (2026-08-05)

Completed

- Per-page metadata (title template, description, OpenGraph, Twitter
  card) for every route via `app/layout.tsx` + per-segment `layout.tsx`
  files (needed because most pages are `"use client"` and can't export
  `metadata` directly).
- `/features` and `/games` are now real indexable pages instead of
  `#features`/`#games` anchors on the homepage — those broke entirely
  when clicked from any other page (`href="#features"` on `/dashboard`
  just appends the hash to the current URL). Navbar now links to the
  real routes; `/#faq` fixed the same way for the FAQ anchor, which
  stays on the homepage.
- `app/robots.ts` + `app/sitemap.ts` — public marketing pages allowed,
  `/dashboard`, `/onboarding`, `/signin`, `/api` disallowed and
  `noindex`'d (they're user-specific or utility pages, not content).
- `app/opengraph-image.tsx` — dynamic OG image (`next/og`) so links
  shared in Discord/Twitter/Slack get a real preview card instead of
  nothing.
- JSON-LD structured data on the homepage: `Organization`,
  `SoftwareApplication`, and `FAQPage` (the last one can earn rich
  FAQ snippets directly in Google search results).
- Navbar nav links were plain `<a>` tags (full page reload on every
  click); switched to `next/link` for client-side navigation.
- Fixed a pre-existing accuracy bug found while rewriting this copy:
  landing page copy claimed "hourly" detection in three places
  (Features card, How It Works, FAQ) — sync actually runs once a day
  (Vercel Hobby cron limit, see docs/06_DECISIONS.md ADR-002). Copy
  now says "daily". Shipping a false claim into machine-readable
  FAQPage structured data would have made it worse, not just cosmetic.

Future

- Per-game landing pages (`/games/league-of-legends`, etc.) if organic
  search volume ever justifies the extra maintenance surface.
- Real custom favicon / app icon (currently the default Next.js one).

---

# P1 — Watchlists

Status: 🟢

Completed

- Users can follow individual Events (star toggle on dashboard,
  also created during onboarding finish step)
- Real DB persistence (`/api/watchlists`), optimistic updates

Future

- Follow by Game/Queue/Champion (currently only Event-level)
- Custom filters

---

# P1 — Event Categories

Status: 🟢 (2026-08-12)

Completed

- **`Event.category`** — every event now tagged as one of `PLAYABLE`,
  `SEASON_PASS`, `ROTATION_MILESTONE`, `COSMETIC_SHOP`,
  `PLATFORM_STATUS` (`lib/constants/event-category.ts`). Fixes Deniz's
  complaint that the tracked-events list was cluttered with "dummy"
  entries (Platform Status, Champion Rotation) nobody actually plays,
  drowning out real events.
- A single `categorySortKey(category, statusPriority)` helper drives
  sorting everywhere events are listed (onboarding, dashboard,
  homepage, `/games/[slug]`) — category dominates the sort, so a real
  played event that has ended still outranks a live infrastructure
  row. This is also how URF/Arena/Mayhem is surfaced again after being
  fully hidden by ADR-020 — see ADR-023.
- Onboarding's event-selection step now has a category filter (5
  cards, each with example event names) instead of one flat list.
- Category badges added to event cards on onboarding, dashboard, and
  `/games/[slug]`.

Full rationale, the URF-specific reasoning, and the per-provider
category mapping: docs/06_DECISIONS.md ADR-023.

Future

- A few CommunityDragon event-hub sub-types (e.g. "Classic Pass Token
  Bank") fall through to the `PLAYABLE` default rather than a more
  specific category — fine for now, but worth a real hubType-to-
  category mapping if more of these show up.

---

# P1 — Event History

Status: 🟡 (2026-08-06)

Completed

- Per-event detail page (`/events/[slug]`) — built directly on the
  `Event.slug` work from the same day. Shows the full `EventHistory`
  timeline for a single event (every LIVE/TRACKING occurrence with
  start time, end time or "ongoing", and computed duration, most
  recent first), plus provider (resolved from `event.source` via a
  new `getProviderName()` lookup on the provider registry),
  first-tracked/times-seen/average-duration stats, and the existing
  prediction/confidence from `eventPredictionService`. Linked from
  event titles on `/games/[slug]`, included in `app/sitemap.ts`.

Need

- Changes — a log of title/description/status edits over time, not
  just LIVE/TRACKING start-end spans. `EventHistory` doesn't currently
  capture field-level diffs, only status periods.

---

# P1 — Statistics

Status: 🟡 (2026-08-06)

Completed

- Public `/statistics` page (`lib/services/global-statistics.service.ts`),
  linked from the footer. Everything on it is computed from real rows,
  nothing fabricated:
  - **Most common events** — ranked by real `EventHistory` occurrence
    count.
  - **Average duration** — overall + per-game, computed only from
    occurrences that have actually completed (`endedAt` set).
  - **Prediction accuracy** — retrospective score: for every completed
    occurrence after an event's first, predicts its duration the same
    way `eventPredictionService` does live (average of prior
    occurrences) and compares to what actually happened.
  - Since history tracking only started 2026-08-04, average duration
    and prediction accuracy currently show "not enough data yet" —
    same honest empty-state pattern as `/games/[slug]` — because zero
    `EventHistory` rows have a real `endedAt` yet. Will fill in as
    events complete naturally via daily sync. Not backfillable: there's
    no fake substitute for "it actually finished."
  - **Provider uptime** — **done (2026-08-06, second attempt, ADR-022).**
    First attempt caused a real prod DB wipe via a documented-as-safe
    step that turned out not to be (`migrate diff --shadow-database-url`
    pointed at the same DB, not a real shadow one) — Neon PITR restored
    everything, no data lost, and CLAUDE.md's migration process was
    corrected before retrying. Second attempt used hand-written
    migration SQL (no `migrate diff`), verified row counts identical
    before/after `migrate deploy`. `ProviderHealthCheck` table now
    records a real row (provider, healthy, latencyMs, error) on every
    `providerSyncService.syncAll()` call — both the daily cron and
    `/admin`'s manual sync feed it, same code path. `/statistics` shows
    uptime % per provider over a rolling 30-day window. Verified
    end-to-end against a real sync (11 real health-check rows, real
    latencies, rendered on the page).

- **Notification success (rate)** — **done (2026-08-06).** Added
  `NotificationFailure` (userId, eventId, channel, error, createdAt)
  via the corrected migration process (hand-written SQL, no
  `migrate diff`; row counts verified identical before/after
  `migrate deploy`). `notification-trigger.service.ts`'s catch block
  now writes a failure row instead of only `console.error`-ing it —
  this also closes the matching gap under Notification Engine's Retry
  Policy note. While in that file, replaced its local hand-rolled
  retry loop with the shared `lib/utils/retry.ts` (same one CommunityDragon's
  client now uses), removing duplicate logic. `/statistics` now shows
  a real 30-day success rate (`sent / (sent + failed)`), not just a
  raw count — `null`/honest-empty-state when there have been zero send
  attempts in the window.

Need (not buildable without new instrumentation — flagged, not skipped)

- **False positives** — no concept for this exists in the app yet (no
  user-facing "this was wrong" feedback mechanism). Needs a product
  decision on what a false positive even means here (bad prediction?
  notification for an event that wasn't real?) before it's buildable.

---

# P1 — Scheduler

Status: 🟡 (2026-08-06)

Completed

- **Backoff** and **parallel execution**, partially — turned out
  `lib/utils/retry.ts` (exponential-ish backoff, 3 attempts) and
  `lib/http/client.ts` (timeout + retry, built on top of it) already
  existed and were already wired into 9 of 10 provider clients — found
  while looking for what to build next, another instance of the
  "written but not connected" pattern, this time only 1/10 connected
  wrong rather than 0/10. **CommunityDragon's client was the one
  holdout**, still on raw `fetch()` with no retry — migrated to the
  shared `http()` client (2026-08-06), verified against a real sync
  (17 events, same result as before, now retry-protected). Provider
  fetches already run in parallel via `Promise.allSettled` in
  `provider-sync.service.ts` (existed before this session).
  `lib/utils/retry.ts` got real test coverage for the first time
  (3 tests, fake timers).

Need

- Cron abstraction (currently just a single Vercel Cron route calling
  `syncAll()` — fine at current scale, revisit if multiple schedules
  are ever needed)
- Adaptive polling (blocked on Vercel Hobby plan's once-daily cron
  limit — see CLAUDE.md "Cron" note; moot until Pro plan)
- Failure recovery beyond per-request retry — e.g. a provider that's
  down for a full day currently just reports unhealthy in
  `ProviderHealthCheck`/`/status` until the next day's cron; no
  automatic re-check or alerting exists yet.

---

# P1 — Health Monitoring

Status: 🟡 (2026-08-06)

Completed

- **Provider latency** and **provider failures** — `ProviderHealthCheck`
  (see P1 Statistics → Provider uptime) records both on every sync,
  surfaced as uptime % on `/statistics` and live per-provider status on
  `/status`/`/admin`.
- **Sync duration** — **done (2026-08-06).** `providerSyncService.syncAll()`
  now times the whole run and returns `durationMs`; both
  `/api/cron/sync` and `/api/admin/sync` include it, shown on
  `/admin`'s manual sync panel ("Finished in Xs"). Verified against a
  real sync (11 providers, 3054ms). Not persisted anywhere yet — it's
  a per-request value, not a trend over time; revisit if that's ever
  needed.
- **Database health** — **done (2026-08-06).** `lib/db/health.ts`
  (`checkDatabaseHealth()`, a timed `SELECT 1`) wired into
  `/api/providers/health` alongside provider checks, surfaced as its
  own row on `/status` and `/admin` (also factored into `/status`'s
  "All systems operational" headline). Verified live (healthy, real
  latency).

Need

- Notification latency (time from event-change-detected to
  notification-sent) — lower priority than it sounds: notifications
  fire synchronously within the same sync request in this
  architecture (no queue/worker gap), so the number would likely
  always be near-zero and not very informative. Revisit if a queue
  ever gets introduced.

---

# P1 — Admin

Status: 🟡 (2026-08-06)

Completed

- `/admin` — first admin-only page in the app, and the first thing
  requiring an actual "who's an admin" concept, which didn't exist
  (`User` has no `role` field). Rather than a schema change,
  gated by `ADMIN_EMAILS` (comma-separated, `lib/config/env.ts`) +
  `lib/auth/is-admin.ts`. Page itself calls `notFound()` (not a
  redirect/403) for non-admins, same as a route that doesn't exist —
  doesn't reveal it's there. Currently just `denizate@gmail.com` in
  `.env`/Vercel; **needs `ADMIN_EMAILS` added to Vercel production
  env vars to work live** (only set locally so far).
  - **Manual Sync** — `POST /api/admin/sync` (session+admin gated,
    separate from the `CRON_SECRET`-gated `/api/cron/sync` used by
    Vercel Cron — a browser button can't safely hold that secret).
    Reuses `providerSyncService.syncAll()` as-is. Useful right after
    a Riot key renewal instead of waiting for the next daily cron.
  - **Provider Status** — reuses the existing `useProviderHealth()`
    hook/`/api/providers/health` endpoint (same data `/status`
    shows), just rendered inline on the admin page.

Deliberately not built (would be fake or genuinely risky)

- **Clear Cache** — there's no cache layer in the app to clear.
  Building a button for this would be decoration, not a real action.
- **Rebuild Data** — too undefined to build blind (rebuild *what*,
  from *what* source, deleting existing rows first or not?). A
  destructive-sounding admin action needs a specific, scoped
  definition from Deniz before it's safe to write, not a guess.
- **Logs** — Vercel serverless function logs are ephemeral (already
  noted under Notification Engine's Retry Policy). A real persistent
  log viewer needs its own storage, which is new infrastructure, not
  a page.

---

# P2 — AI Features

Future

Event prediction

Popularity estimation

Expected duration

Recommendation engine

---

# P2 — Multi Game Support

Status: 🟢 9 real providers (2026-08-06)

Live providers

- League of Legends ✅ (Riot + CommunityDragon)
- Valorant ✅ (2026-08-04, Riot)
- Destiny 2 ✅ (2026-08-05, Bungie API — platform status + active
  weekly milestones/raid rotation. See docs/06_DECISIONS.md ADR-006.)
- TFT ✅ (2026-08-05, Riot — platform status only for now, same
  `RIOT_API_KEY`. See ADR-009.)
- Fortnite ✅ (2026-08-05, `fortnite-api.com`, no key needed — Item
  Shop rotation only. LTM tracking deliberately excluded: the
  `/v1/playlists` endpoint returns every playlist the game has ever
  had, not just currently-active ones, and `isLimitedTimeMode` never
  came back `true` on a real request. See ADR-011.)
- Warframe ✅ (2026-08-06, `api.warframestat.us`, no key needed —
  Void Trader (Baro Ki'Teer) arrival, Nightwave season status, daily
  Sortie, weekly Archon Hunt. All 4 verified against real data with
  real activation/expiry timestamps. Alerts/invasions deliberately
  excluded (too high-frequency, low signal). See ADR-013.)
- Path of Exile ✅ (2026-08-06, `api.pathofexile.com`, no key needed —
  current challenge league only (`Allflame` verified live). See
  ADR-014.)
- Helldivers 2 ✅ (2026-08-06, `api.helldivers2.dev`, community-run
  mirror of Arrowhead's backend, no key needed — active Major
  Orders/Personal Orders only (2 verified live). Per-planet campaigns
  deliberately excluded, too high-frequency/low-signal. See ADR-015.)
- Foxhole ✅ (2026-08-06, `war-service-live.foxholeservices.com`,
  official developer (Clapfoot) API, no key needed — single ongoing
  World Conquest war state (`War #137` verified live). See ADR-016.)

Pending Deniz's action

- Apex Legends — `apexlegendsapi.com` is the viable source. Deniz
  got a key via the web form (2026-08-06), added to `.env` as
  `APEX_API_KEY`, but a real request to `/maprotation` returns
  `429 "You must verify your API account first by linking your
  Discord account"` — the key is unusable until Discord is linked at
  `portal.apexlegendsapi.com/discord-auth`. Same VPN-access blocker
  as Discord OAuth login (ADR-005) — Discord isn't reachable from
  Deniz's location without a VPN. Blocked on the same prerequisite;
  revisit both together once Deniz has VPN access. Map rotation
  endpoint itself looks solid once unblocked; Collection Events/LTMs
  are as unreliable as Fortnite's, likely same "shop/rotation only"
  scope.

Evaluated and rejected

- ~~Call of Duty~~ — no official Activision API; unofficial routes
  need a real account login (not an API key) and don't even expose
  event/playlist data, only player stats. See ADR-006.
- ~~LoR~~ — Riot API returns 403 with the current dev key; needs a
  separate product application on the Riot Developer Portal, unclear
  approval odds/timeline. Revisit if Deniz wants to apply.
- ~~Wild Rift~~ — no known public API at all (403 on every guessed
  endpoint, no official docs). See ADR-009.
- ~~Overwatch 2~~ — no official Blizzard API for event/season data,
  no credible community dataset either. Static/manual calendar was
  considered and rejected (goes stale, violates the real-data-only
  principle). Same rejection profile as Call of Duty. See ADR-012.
- ~~OpenDota~~ (Dota 2, `api.opendota.com`, no key) — re-verified
  2026-08-06: `/leagues` returns every league ever played (16000+
  entries, no active/date filter), same failure mode as Fortnite's
  old `/v1/playlists` problem. Not usable without a second endpoint
  to isolate currently-running tournaments, which doesn't exist.
- ~~Diablo 4~~ — no official Blizzard API without a registered
  client id/secret (same key-required profile as WoW/Hearthstone/
  Overwatch 2). Community Helltide/world-boss trackers
  (helltides.com, d4armory.io) are websites, not documented public
  JSON APIs.
- ~~Elite Dangerous~~ — Frontier has no first-party keyless Community
  Goals API; third-party tools (Inara, ED-API) proxy through their
  own services, which isn't a source ModeAlert can depend on directly.
- ~~Albion Online~~ (`gameinfo.albiononline.com/api/gameinfo`) — no
  key needed, but the only real-time endpoint (`/events`) is a raw
  PvP kill-feed, same too-granular/high-frequency profile as GW2's
  event feed and Warframe's excluded alerts/invasions.
- ~~EVE Online~~ (`esi.evetech.net`) — genuinely keyless and public,
  but neither candidate endpoint fit: `/incursions/` has no
  start/end timestamps (only a `state` enum), and
  `/sovereignty/campaigns/` returns dozens of concurrent, constantly
  churning skirmishes — same rejection class as Albion's kill-feed.
- ~~Brawlhalla~~ — v1.0 dropped the key requirement, but the API only
  covers player/guild stats, no event or season-rotation endpoint.
- ~~Path of Exile 2~~ — checked whether `api.pathofexile.com` exposes
  a separate PoE2 realm; the `realm=poe2` query param is silently
  ignored (same `pc` league data comes back either way). Not a real
  second data source yet; PoE's existing provider already covers the
  shared account/league system. See ADR-014.

Evaluated and deferred (keyless, but data source currently broken)

- Guild Wars 2 (`api.guildwars2.com/v2`) — `/v2/worldbosses` and
  `/v2/build` work with no key, but the endpoint that actually matters
  (`/v2/events`, real-time meta-event/world-boss timers) returned
  `503 "API not active"` on a real request — a known, long-standing
  ArenaNet bug, not a fluke (re-checked again 2026-08-06, still
  broken). Falling back to a static rotation table would violate the
  no-fake-data principle (ADR-012). Revisit if ArenaNet ever fixes it.
  See ADR-013.

Future no-key candidates worth a look (unverified, higher effort)

- PlanetSide 2 (Daybreak Census API, `census.daybreakgames.com`) —
  the shared `s:example` service ID works with zero registration
  (confirmed live 2026-08-06), so it's keyless in spirit even though
  it looks like a key. The interesting data (active continent
  "Alerts") isn't exposed as a clean "currently active" REST
  endpoint though — trackers derive it from the realtime ESS
  websocket or by diffing `world_event` history, which is a much
  bigger lift than the REST-polling pattern every other provider
  uses here. Worth it only if Deniz specifically wants PS2.

Done (2026-08-05)

- ~~Per-game detail pages~~ — `/games/[slug]` added. Every `GameCard`
  now links to it. Shows every event ever tracked for that game with
  real history (first tracked, times seen, average duration once
  completed at least once) and — using `eventPredictionService`,
  which existed and was fully implemented but had zero callers
  anywhere (found via the same "written but not connected" audit that
  caught the notification bell, dashboard, and onboarding earlier) —
  an estimated end date + confidence once there's enough data. Right
  now every event shows "not enough history yet" honestly, since the
  event engine only started recording history 2026-08-04.

Future — richer data per existing game (not just more games)

- TFT: only platform status right now — no live-verified secondary
  signal exists yet (e.g. "current Set") the way LoL has champion
  rotation or Destiny has milestones.
- Valorant: could expand beyond platform status + active acts.
- Destiny: Vendor rotation (Xûr) not yet mapped.

---

# P2 — User Accounts

Status: 🟢 (2026-08-05)

Completed

- Authentication (Auth.js v5 + Prisma adapter, database sessions) —
  Google, Discord, email magic link (Resend). See
  docs/06_DECISIONS.md ADR-005.
- Saved watchlists / notifications / dashboard stats now scoped to
  the real signed-in user instead of the shared "demo" account.
- Closed an IDOR: `/api/notifications`, `/api/watchlists`,
  `/api/dashboard` used to trust a client-supplied `userId`; they now
  derive it from the server-side session and 401 without one.

Future

- Profiles (avatar/display name editing beyond what OAuth provides)
- Preferences
- Notification settings (component exists — `notification-settings.tsx`
  — still not wired to a page, see Technical Debt below)
- ~~Deniz still needs to create the Google OAuth Client...~~ — Google
  done and live (2026-08-05). Discord deferred: Discord is currently
  blocked from Deniz's location without a VPN, so Discord Developer
  Portal setup is on hold until he's on VPN. `/signin` now only shows
  buttons for providers that are actually configured (see
  docs/06_DECISIONS.md ADR-005 update).

- Email+password sign-up added (`/signup`, 2026-08-05) — fourth auth
  method alongside Google/Discord/magic-link. No "forgot password"
  flow yet — a locked-out or password-less user can always fall back
  to Google or the email magic link to get in. Revisit if this becomes
  a real support burden.

- ~~`/signin` defaulted to the magic-link form, hiding email+password
  behind a "Prefer a password instead?" toggle.~~ — fixed (2026-08-05).
  Since signup already collects email+password together, sign-in now
  shows the same fields by default; magic-link is the toggle instead.
  Google sign-in was also re-tested live in production during this fix
  and works correctly end-to-end — no separate bug found there.

---

# P2 — Monetization

Free

Basic notifications

Premium

Unlimited watchlists

Priority notifications

Prediction features

Advanced statistics

---

# P2 — Public API

REST

GraphQL (optional)

API Keys

Rate limiting

Documentation

---

# P2 — Browser Extension

Chrome

Firefox

Edge

---

# P3 — Mobile

Future

Android

iOS

Push notifications

---

# P3 — Desktop

Electron

Tray notifications

Background sync

---

# Technical Debt

Current

- Riot endpoint discovery

- ~~Provider test coverage~~ — **done (2026-08-06).** `vitest` added
  (`npm test` / `npm run test:watch`), 51 tests across all 10
  registered providers' pure event-mapper/normalizer functions
  (status transitions, filtering, title formatting). Client/service
  layers (real HTTP calls) deliberately left untested — no mocking
  framework introduced, kept to pure-function coverage for now.

- ~~Notification tests~~ — **done (2026-08-06).** Pure-function
  coverage for the notification pipeline: `message-builder.test.ts`
  (new-event vs status-transition copy), `unsubscribe-token.test.ts`
  (deterministic/per-user HMAC, tamper/empty-token rejection),
  `template.test.ts`. Found and fixed a real bug while writing the
  last one: `buildEmailHtml` interpolated `event.title`/`message`
  (third-party provider data — Riot/CommunityDragon/etc, not
  hardcoded strings) straight into HTML with no escaping. Added
  `escapeHtml()`, now covered by a test asserting `<script>`/`<img
  onerror=...>` in a title renders as inert text, not live markup.
  `notification-trigger.service.ts` itself (DB writes, retry timing)
  stays untested — same "no mocking framework, pure functions only"
  boundary as the provider tests.

- Scheduler tests

- Prisma optimization

- Logging improvements

- ~~Dead "written but not connected" code~~ — **cleaned up
  (2026-08-06).** A sweep for more instances of the pattern that kept
  showing up this session (retry/http client, `getAllHistory`) found
  a fresh batch, all confirmed zero-callers before removal:
  `lib/providers/core/executor.ts` and `base-provider.service.ts`
  (superseded — `provider-sync.service.ts` already does the same job,
  now with retry/health-check on top), `registerProvider()` in
  `registry.ts` (providers are hardcoded, never dynamically
  registered), `lib/helpers/getGame.ts`/`getFeaturedEvents.ts` (unused
  wrappers — the latter also bypassed the repository layer, a real
  architecture-rule violation even if it had been wired in),
  `lib/services/index.ts` (stale/incomplete barrel, nothing imported
  from it), `lib/utils/parallel.ts` (unused). Also deleted
  `lib/events.ts` — unused, and its content was hardcoded fake event
  data ("URF", "Night Market", `live: false`) of exactly the kind
  ADR-007 already had to fix elsewhere; better gone than one accidental
  import away from resurrecting that bug.

- ~~Repo kökünde dokümante edilmemiş, eski bir frontend katmanı var~~ —
  **tamamen temizlendi (2026-08-06).** `crawler/*/get-events.ts`
  (blizzard/epic/riot/steam/twitch) hâlâ boştu diye not düşülmüştü ama
  tam sayım yapılmamıştı — 2026-08-06'daki ölü kod taramasında toplam
  **15 tane 0 byte'lık, sıfır referanslı dosya** bulundu: yukarıdaki 5
  crawler dosyası + `components/marketing/*` (cta/dashboard-preview/
  faq/features/hero/supported-games — gerçek karşılıkları
  `components/landing/*`'te), `components/shared/Container.tsx`+
  `PageHeader.tsx`, `components/watchlist/watchlist.tsx` (gerçeği
  `components/dashboard/watching-list.tsx`), `onboarding/components/
  ChooseGameCard.tsx`, `constants/navigation.ts`. Hepsi silindi —
  yeni bir oyun eklenirken artık sıfırdan yazılacak (Valorant'ta
  yapıldığı gibi), eski iskeletten devralınacak bir şey yok.

- **Riot dev API key 24 saatte bir expire oluyor** — gerçek "low
  maintenance" için production key başvurusu gerekiyor. Şu an manuel
  güncelleniyor. 2026-08-05'te bir kez daha expire oldu (LoL/Valorant
  canlıda "unhealthy" görünüyordu — `/status` sayfası doğru şekilde
  yakaladı), Deniz yeniledi. Bu artık üçüncü/dördüncü kez oluyor — bu
  gerçekten bir "her gün elle yapılan iş" haline geldi, production key
  başvurusu (Riot Developer Portal → Apply for a Production Key)
  bundan sonraki en yüksek öncelikli manuel iş olmalı. **Ön koşul
  giderildi (2026-08-06):** Riot'un başvuru süreci, ürünün gerçek bir
  Terms of Service ve Privacy Policy sayfası olan, kendi domain'inde
  barındırılan çalışan bir uygulama/prototip olmasını şart koşuyor
  (ayrıca doğrulama için ~10 iş günü sürüyor) — `/privacy` ve `/terms`
  artık canlıda, footer'dan bağlı. **Başvuru gönderildi (2026-08-06,
  App ID 867857, Product Game Focus: League of Legends, Status:
  Pending Review).** Domain doğrulaması `public/riot.txt` ile
  yapıldı (Riot'un istediği doğrulama kodu, `/riot.txt`'te canlı).
  Riot Developer Relations incelemesi ~10 iş günü sürüyor — onay
  gelince yeni production key'i `.env`/Vercel'e işlemek kalıyor.

- ~~Auth yok. Her şey `"demo"` adında tek, hardcoded bir kullanıcı
  üzerinden çalışıyor~~ — **çözüldü (2026-08-05)**, bkz.
  docs/06_DECISIONS.md ADR-005 ve "P2 — User Accounts". Google/Discord
  login'in gerçekten çalışması için Deniz'in OAuth app'leri açıp env
  var'ları girmesi bekleniyor; email magic link zaten aktif.

- ~~`components/notifications/*` ve `hooks/use-notifications.ts` yazılmış
  ama hiçbir sayfaya bağlanmamış~~ — **navbar zil ikonu artık gerçek**
  (2026-08-05). `components/layout/notification-bell.tsx` eklendi,
  `components/ui/popover.tsx` (`@base-ui/react/popover` wrapper) üzerine
  kuruldu; navbar'a bağlandı. `use-notifications.ts` içine `markRead` /
  `markAllRead` eklendi (mevcut `PATCH /api/notifications` endpoint'ini
  kullanıyor), `notification-center`/`notification-item`/`empty-state`
  kompakt dropdown görünümüne göre yeniden stillendirildi. Kalan parça:
  `notification-settings.tsx` hâlâ hiçbir sayfaya bağlı değil.

---

# Bugs

- ~~No branded 404/error pages — Next.js defaults were used~~ —
  **fixed (2026-08-05).** `app/not-found.tsx` and `app/error.tsx`
  added, matching site design. Also deleted
  `components/notifications/notification-settings.tsx` — an empty
  (0-line) stub, superseded by `/dashboard/settings`.

- ~~Vercel build cache could serve a stale Prisma Client after a schema
  migration~~ — **fixed (2026-08-05).** `package.json` had no
  `postinstall` script, so when Vercel restored a cached `node_modules`
  and npm saw `@prisma/client` as already satisfied, it skipped
  `prisma generate` — the deployed client predated the Account/Session/
  VerificationToken models from the auth migration, so every sign-in
  (Google and email both) crashed with `Cannot read properties of
  undefined (reading 'create')` on `createVerificationToken`. Added
  `"postinstall": "prisma generate"` (root-level scripts always run,
  cache or not) and force-redeployed without cache. See
  docs/06_DECISIONS.md ADR-005.

- ~~`/signin` always showed Google + Discord buttons regardless of
  whether those providers were configured~~ — fixed same day, see
  ADR-005 update.

- ~~Footer "Privacy"/"Terms" links pointed to `#` (dead links)~~ —
  **fixed (2026-08-06).** `/privacy` and `/terms` pages added
  (`app/privacy/page.tsx`, `app/terms/page.tsx`), footer now links to
  them for real. Built primarily to unblock the Riot production key
  application, which requires a real ToS/Privacy page on the app's
  own domain.

- ~~Landing page's dashboard mockup (`DashboardPreview`) overflowed
  and overlapped adjacent cards when a real event title was long
  (e.g. Helldivers 2's Major Order briefings)~~ — **fixed
  (2026-08-06).** The `truncate` class was already there but had no
  effect without `min-w-0` on the flex ancestors — classic Tailwind
  flexbox gotcha. Added `min-w-0`/`shrink-0` where needed in
  `components/landing/dashboard-preview.tsx`.

- ~~LoL event list cluttered with non-events (permanent "Classic
  Player Level"/"Classic Voting Power" features with a 2099 sentinel
  end date, misleadingly-LIVE Mayhem season-pass windows) and
  TFT/Warframe/PoE/Helldivers 2/Foxhole icons falling back to emoji
  that doesn't render reliably in every environment~~ — **fixed
  (2026-08-06), see ADR-020.** Reported by Deniz. CommunityDragon
  normalizer now filters sentinel-dated and rotating-mode-named
  entries; the 5 games without an official brand SVG got real
  react-icons/gi themed icons instead of emoji.

No open bugs.

---

# Ideas

- ~~u.gg outbound links~~ — **done (2026-08-06).** Deniz asked for a
  u.gg integration. u.gg has no public API (verified — it's a stats/
  build site, nothing to embed/scrape), so this is outbound links
  only: `lib/constants/external-resources.ts` maps gameId → real u.gg
  URLs, rendered on `/games/[slug]` for LoL/TFT/Valorant. First pass
  used URLs typed from memory instead of the ones actually verified
  via WebSearch — caught and fixed before commit (`u.gg/val/tierlist/
  agents` not `u.gg/valorant/tier-list`, `u.gg/tft` not `u.gg/tft/
  tier-list`). Lesson: verify external URLs against the actual search
  result, don't reconstruct them from memory even when the pattern
  looks obvious.

- **Riot account linking (RSO)** — Deniz wants "connect your LoL
  account, show your actual champion" personalization. Researched
  2026-08-06: RSO (Riot Sign-On) requires an **already-approved
  production API key first** — Deniz's production key application is
  still Pending Review (see Technical Debt below). Once approved, RSO
  itself needs a *separate* application: documented user-flow
  (account creation/login/queue-up mockups or a working prototype
  link), mandatory data opt-in functionality, and a public disclaimer
  that account linking makes player data public. Multi-week, two-stage
  process with real product/legal decisions (opt-in UX, disclaimer
  copy) — not something to build blind. Revisit once the production
  key lands.

- ~~**URF/rotating-mode live status**~~ — researched a third time
  (2026-08-06, prompted by Deniz asking why URF isn't shown). Same
  conclusion as ADR-017/ADR-020, now with exhaustive evidence: every
  field `queues.json` exposes was enumerated (`id`, `name`,
  `shortName`, `description`, `detailedDescription`,
  `gameSelectModeGroup`, `gameSelectCategory`, `gameSelectPriority`,
  `isSkillTreeQueue`, `isLimitedTimeQueue`, `isBotHonoringAllowed`,
  `hidePlayerPosition`, `viableChampionRoster`, `pickMode`) — none of
  them carry a date or "active now" signal, not even an unreliable
  one. Also found `isurfback.com`, a third-party site dedicated
  entirely to this question — confirms it's a widely-recognized hard
  problem, but they don't disclose their methodology/API publicly, so
  it's not a source ModeAlert can depend on. **Handling changed
  (2026-08-12, ADR-023):** the "is it in rotation right now" signal is
  still genuinely unavailable — that hasn't changed and hardcoding a
  static row is still rejected for the same fabricated-data reason.
  But per Deniz, URF/Arena/Mayhem's real event-hub entry (the
  battle-pass window) is too important to hide entirely — it's now
  synced and trackable under the new `SEASON_PASS` category, with an
  honest description that it's the pass window only, not a "mode is
  live" claim. See the new Event Categories section below.

- Event popularity heatmap

- Personalized recommendations

- Event calendar

- Discord bot

- Steam integration

- Twitch integration

- Event RSS

- Weekly digest

---

# DONE

Completed milestones

✅ Provider architecture

✅ Repository architecture

✅ Service architecture

✅ Scheduler skeleton

✅ Notification abstraction

✅ Prisma integration

✅ Dashboard backend

✅ CommunityDragon integration

✅ Riot provider foundation

✅ API routes

✅ Valorant provider (2026-08-04)

✅ Real Event Engine — new/updated/removed detection, source-scoped
  expiry, history lifecycle (2026-08-04)

✅ Email notifications (Resend), per-recipient, DB-persisted
  (2026-08-04)

✅ Postgres migration (Neon) — SQLite was incompatible with Vercel's
  serverless functions (2026-08-04)

✅ Production deploy live — https://modealert.vercel.app, auto-deploy
  on push (2026-08-04)

✅ Daily automated sync (Vercel Cron) (2026-08-04)

✅ Dashboard: real watchlist add/remove, live stats (2026-08-04)

✅ Onboarding flow: Games → Events → Finish, creates real watchlist
  entries (2026-08-04)

✅ Corporate-quality UI pass: real fonts, gradient brand system,
  real brand icons (react-icons/si), FAQ/CTA/How-It-Works sections
  built (were empty placeholder files) (2026-08-04)
