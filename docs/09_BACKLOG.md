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

Potential games

League of Legends ✅

Valorant ✅ (2026-08-04)

TFT

LoR

Wild Rift

Future Riot titles

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
  güncelleniyor.

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

None yet

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
