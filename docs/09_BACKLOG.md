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

Remaining

- rotating modes
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
  **kısmen çözüldü (2026-08-05):** `notification-trigger.service.ts`
  artık her gönderimi 3 deneme, artan gecikmeyle (500ms/1s) yapıyor.
  Bilinçli olarak dışarıda bırakılan: kalıcı bir "failed notification"
  kaydı/görünürlüğü (Vercel serverless log'ları geçicidir — 3 deneme
  de başarısız olursa hâlâ sessizce kayboluyor). Şu anki trafik
  hacminde ayrı bir queue/worker altyapısı kurmak erken optimizasyon
  olurdu; hacim büyüdükçe (veya sık başarısızlık gözlemlenirse) yeniden
  değerlendirilmeli.

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

# P1 — Event History

Need

Timeline

Changes

Start time

End time

Duration

Provider

Confidence

---

# P1 — Statistics

Need

Most common events

Average duration

Prediction accuracy

Provider uptime

Notification success

False positives

---

# P1 — Scheduler

Need

Cron abstraction

Adaptive polling

Backoff

Parallel execution

Failure recovery

---

# P1 — Health Monitoring

Need

Provider latency

Provider failures

Sync duration

Notification latency

Database health

---

# P1 — Admin

Need

Manual Sync

Clear Cache

Rebuild Data

Provider Status

Logs

---

# P2 — AI Features

Future

Event prediction

Popularity estimation

Expected duration

Recommendation engine

---

# P2 — Multi Game Support

Status: 🟢 7 real providers (2026-08-06)

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

Pending Deniz's action

- Apex Legends — `apexlegendsapi.com` is the viable source, but needs
  a free API key obtained via Discord signup (Deniz needs to do this
  himself). Map rotation is solid; Collection Events/LTMs are as
  unreliable as Fortnite's, likely same "shop/rotation only" scope.

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

Evaluated and deferred (keyless, but data source currently broken)

- Guild Wars 2 (`api.guildwars2.com/v2`) — `/v2/worldbosses` and
  `/v2/build` work with no key, but the endpoint that actually matters
  (`/v2/events`, real-time meta-event/world-boss timers) returned
  `503 "API not active"` on a real request — a known, long-standing
  ArenaNet bug, not a fluke. Falling back to a static rotation table
  would violate the no-fake-data principle (ADR-012). Revisit if
  ArenaNet ever fixes it. See ADR-013.

Future no-key candidates worth a look (unverified)

- OpenDota (Dota 2, `api.opendota.com`, no key) — free tier exists,
  but it's a stats/match API, not really an "event" source in the
  sense ModeAlert tracks (game modes, rotations, limited-time
  content). Would need its own scoping exercise like Fortnite's.

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

- Provider test coverage

- Notification tests

- Scheduler tests

- Prisma optimization

- Logging improvements

- ~~Repo kökünde dokümante edilmemiş, eski bir frontend katmanı var~~ —
  **dashboard ve onboarding kısımları çözüldü** (2026-08-04). Kalan tek
  parça: `crawler/*/get-events.ts` (blizzard/epic/riot/steam/twitch)
  hâlâ tamamen boş, kullanılabilir değil — yeni bir oyun eklenirken
  sıfırdan yazılacak (Valorant'ta yapıldığı gibi).

- **Riot dev API key 24 saatte bir expire oluyor** — gerçek "low
  maintenance" için production key başvurusu gerekiyor. Şu an manuel
  güncelleniyor. 2026-08-05'te bir kez daha expire oldu (LoL/Valorant
  canlıda "unhealthy" görünüyordu — `/status` sayfası doğru şekilde
  yakaladı), Deniz yeniledi. Bu artık üçüncü/dördüncü kez oluyor — bu
  gerçekten bir "her gün elle yapılan iş" haline geldi, production key
  başvurusu (Riot Developer Portal → Apply for a Production Key)
  bundan sonraki en yüksek öncelikli manuel iş olmalı.

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

No open bugs.

---

# Ideas

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
