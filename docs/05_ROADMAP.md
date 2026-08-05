# ModeAlert Roadmap

Version: Living Document

This roadmap represents the intended evolution of ModeAlert.

It should be updated whenever a milestone is completed.

---

# Vision

Create a low-maintenance SaaS that automatically tracks limited-time game events across multiple games and notifies users only when something important changes.

Eventually it should require minimal manual intervention while generating recurring revenue.

---

# Guiding Principles

✅ Passive income first

✅ Low maintenance

✅ Generic architecture

✅ Plugin based

✅ Easy to scale

✅ Automation over manual work

---

# Current Stage

Status:

MVP live in production (2026-08-04) — https://modealert.vercel.app

Completed:

✔ Provider Architecture (Riot, CommunityDragon, Valorant — 3 real
  providers, all verified against live data)

✔ Repository Layer

✔ Service Layer

✔ Event Engine (new/updated/removed detection, source-scoped expiry,
  history lifecycle)

✔ Notification Architecture (Console + Email/Resend, per-recipient,
  DB-persisted)

✔ Database Schema (Postgres/Neon, migrated off SQLite)

✔ CommunityDragon Provider (event-hub, live+pbe patchline comparison)

✔ Riot Provider (platform status, champion rotation)

✔ Valorant Provider (platform status, act/episode detection)

✔ Dashboard (real watchlist add/remove, live stats)

✔ Onboarding flow (Games → Events → Finish, creates real watchlist
  entries)

✔ Automated deploy (push to feature/landing-page-v2 → auto production
  deploy)

✔ Automated daily sync (Vercel Cron, Hobby plan limit)

✔ Real auth — Auth.js v5, Google/Discord/email, database sessions
  (2026-08-05, see docs/06_DECISIONS.md ADR-005)

In Progress / Not Started:

- Discord/Telegram notifications (deliberately deferred)
- More game providers (Steam, Epic, Blizzard — crawler/ stubs exist
  but are empty)
- Prediction engine (Phase 5)

---

# Phase 1 — MVP

Goal

A working backend capable of syncing League events.

Tasks

- Complete event synchronization

- Event history

- Event comparison

- Notification trigger

- Dashboard APIs

- Provider health monitoring

- Statistics

Exit Criteria

System detects new events automatically.

---

# Phase 2 — League Client Integration

Goal

Read local League Client.

Tasks

LCU Provider

Gameflow

Current game

Current account

Current queue

Current champion

Current region

Use Cases

Notify only relevant users

Detect local ownership

Future recommendation engine

Exit Criteria

ModeAlert can communicate with local League Client.

---

# Phase 3 — Smart Notifications

Goal

Users receive useful notifications.

Channels

Console

Discord

Telegram

Email

Browser Push

Notification Types

New Event

Ending Soon

Champion Rotation

Battle Pass

Prime Gaming

Limited Skin

Mission

Maintenance

Event Extended

Exit Criteria

Users receive meaningful notifications automatically.

---

# Phase 4 — Dashboard

Goal

Frontend becomes useful.

Features

Upcoming events

Trending

History

Search

Filters

Statistics

Provider health

User settings

Exit Criteria

Dashboard usable without database inspection.

---

# Phase 5 — Prediction Engine

Goal

Predict future events.

Possible Models

Historical intervals

Patch cycle

Seasonality

Riot cadence

Prediction Types

Expected battle pass

Expected skin sale

Expected event

Expected champion rotation

Confidence score

Exit Criteria

Predictions shown with confidence.

---

# Phase 6 — Multi Game

Goal

League becomes only one provider.

Candidate Games

Valorant

TFT

Wild Rift

Steam

Epic Games

GOG

Xbox

PlayStation

Nintendo

Eventually

Game = Plugin

Exit Criteria

Adding games requires only a new provider.

---

# Phase 7 — User Accounts

Status: ✅ Done (2026-08-05)

Goal

Real SaaS.

Authentication

OAuth

Google ✅

Discord ✅

Email magic link ✅ (not originally planned, added instead of GitHub —
  reuses the existing Resend integration, no password/reset flow)

Features

Favorites — done (watchlists are now per-real-user)

Watchlists — done

Notification settings — not done (component exists, not wired to a page)

History — not done

Subscriptions — not done (Phase 8)

Exit Criteria

Users own personalized data. ✅

---

# Phase 8 — Premium

Goal

Monetization.

Possible Features

Unlimited watchlists

Prediction engine

Advanced filters

Priority notifications

Discord integration

Multiple devices

Analytics

Premium API

Pricing

Monthly

Yearly

Lifetime

---

# Phase 9 — Automation

Goal

Owner intervention approaches zero.

Automatic

Provider checks

Health monitoring

Retries

Daily backups

Database cleanup

Statistics generation

Monitoring

Everything should heal itself whenever possible.

---

# Phase 10 — Scaling

Current

SQLite

↓

PostgreSQL

↓

Redis

↓

Queue Workers

↓

Background Jobs

↓

Cloud Deployment

↓

CDN

↓

Horizontal Scaling

Architecture should already support this.

---

# Nice To Have

Mobile App

Desktop App

Chrome Extension

OBS Overlay

Discord Bot

Public API

Webhook API

CLI Tool

---

# Never Do

Do not tightly couple providers.

Do not hardcode League logic into generic services.

Do not place business logic inside UI.

Do not bypass repositories.

Do not optimize prematurely.

Avoid unnecessary microservices.

Keep the code understandable.

---

# Success Metrics

100+ tracked event types

10+ providers

1000+ daily users

Recurring subscriptions

Low infrastructure costs

Minimal maintenance

---

# Ultimate Goal

ModeAlert should eventually become the "Event Intelligence Platform" for gaming.

Users should not need to manually check game launchers, news pages, Reddit or Twitter.

ModeAlert should tell them exactly what matters, exactly when it matters.