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

Early MVP

Completed:

✔ Provider Architecture

✔ Repository Layer

✔ Service Layer

✔ Scheduler Foundation

✔ Notification Architecture

✔ Database Schema

✔ CommunityDragon Provider

✔ Riot Provider Foundation

In Progress:

Event Synchronization

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

Goal

Real SaaS.

Authentication

OAuth

Google

Discord

GitHub

Features

Favorites

Watchlists

Notification settings

History

Subscriptions

Exit Criteria

Users own personalized data.

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