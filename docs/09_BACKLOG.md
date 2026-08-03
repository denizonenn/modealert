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

Completed

- connect to LCU
- authentication
- gameflow endpoint
- current summoner

Remaining

- event discovery
- endpoint mapping
- event extraction
- polling abstraction

---

## Riot API

Status: 🟡

Need

- Champion Rotation

Future

- Clash
- Ranked data
- TFT
- LoR
- Valorant (optional)

---

# P0 — CommunityDragon

Status: 🟡

Completed

- queues
- maps
- game modes

Remaining

- event hub
- rotating modes
- arena metadata
- future events

---

# P0 — Notification Engine

Status: 🟡

Need

- Notification Queue

- Notification Scheduler

- Notification Rate Limiter

- Retry Policy

- Provider abstraction

Current provider

- Console

Future

- Discord

- Telegram

- Email

- Push

---

# P0 — Event Engine

Status: 🔴

Needs implementation

Features

- Event comparison

- Detect new event

- Detect updated event

- Detect removed event

- Predict expiration

- Confidence score

- Historical tracking

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

League of Legends

TFT

Valorant

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
