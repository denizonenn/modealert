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

🟡 In Progress

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
- Retry Policy (tek deneme, başarısızlık sadece loglanıyor)

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

# P0 — Dashboard

Status: 🟡

Need

- Live statistics

- Upcoming events

- Active events

- Notification history

- Sync health

- Provider status

---

# P1 — Watchlists

Status: 🟡

Need

Users can follow

- Game

- Queue

- Champion

- Event

- Skin

- Rotation

Future

Custom filters

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

Future

Authentication

Profiles

Saved watchlists

Preferences

Notification settings

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
  **dashboard kısmı çözüldü** (2026-08-04, `app/dashboard` gerçek route
  oldu). **Onboarding kısmı hâlâ açık**: `components/onboarding/*` sadece
  ilk 2/4 adımı kapsıyor, Notifications ve Account (auth) adımları
  yazılmamış — auth netleşmeden tamamlanmayacak (bkz. docs/06_DECISIONS.md
  ADR-002). `crawler/*/get-events.ts` hâlâ tamamen boş, kullanılabilir
  değil.

- **Riot dev API key 24 saatte bir expire oluyor** — gerçek "low
  maintenance" için production key başvurusu gerekiyor.

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
