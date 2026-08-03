# Architecture

Status: Active

---

# Purpose

This document describes the high-level architecture of ModeAlert.

Its goal is to explain:

- how the system is organized
- why each layer exists
- where code belongs
- how data flows through the application

This document should remain implementation-independent whenever possible.

---

# High-Level Overview

```

```
                    External Providers

          Riot API          CommunityDragon
               │                   │
               └──────────┬────────┘
                          │
                    Provider Layer
                          │
                    Normalization
                          │
                     Service Layer
                          │
                 Event Detection Layer
                          │
                  Notification Pipeline
                          │
                    Repository Layer
                          │
                       Prisma ORM
                          │
                       PostgreSQL
                          │
                      API Endpoints
                          │
                       Frontend UI
```

```

---

# Layer Responsibilities

## Frontend

Responsible for:

- dashboards
- watchlists
- settings
- onboarding
- statistics
- notifications

The frontend never communicates with providers directly.

Everything goes through the backend API.

---

## API Layer

Responsible for:

- request validation
- authentication (future)
- authorization (future)
- calling services
- returning responses

API routes must remain thin.

Business logic never belongs here.

---

## Service Layer

This is the heart of the application.

Services contain business logic.

Examples:

EventService

NotificationService

SyncService

ProviderSyncService

EventStatisticsService

EventPredictionService

WatchlistService

Services coordinate repositories and providers.

---

## Provider Layer

Responsible only for communicating with external systems.

Current providers:

- Riot
- CommunityDragon

Future providers:

- Steam
- Blizzard
- Valve
- Epic
- Marvel Rivals
- Deadlock

Providers should never know about the database.

Providers should never contain business logic.

---

## Normalization

Different providers return different formats.

The application internally works with one unified model.

Normalization converts:

Provider DTO

↓

Internal DTO

After normalization the application should not care where the data originated.

---

## Repository Layer

Repositories abstract persistence.

Responsibilities:

- querying database
- saving entities
- updating records

Repositories never contain business rules.

---

## Database Layer

Persistence is handled by Prisma.

The database stores:

Games

Events

Notifications

History

Watchlists

Providers

Statistics

Future entities should follow the same repository pattern.

---

# Synchronization Pipeline

The synchronization process follows this order:

Provider

↓

Download latest data

↓

Normalize

↓

Compare

↓

Detect changes

↓

Store history

↓

Update database

↓

Trigger notifications

↓

Update statistics

This flow should remain stable regardless of provider.

---

# Notification Pipeline

Notification generation is separated into two phases.

Phase 1

Detect meaningful changes.

Examples:

New event

Updated event

Expired event

New rotation

Store change

Phase 2

Deliver notifications.

Examples:

Console

Discord

Telegram

Email

Push

Webhook

Slack

Detection and delivery should never be coupled.

---

# Scheduler

The scheduler periodically executes synchronization jobs.

Future scheduler responsibilities include:

Provider polling

Health checks

Retry failed syncs

Cleanup jobs

Statistics generation

Future prediction updates

---

# Dependency Direction

Dependencies always point downward.

Frontend

↓

API

↓

Services

↓

Repositories

↓

Database

Providers

↓

Services

Repositories never call services.

Services never call UI.

Providers never call repositories.

---

# Current Principles

Every layer has exactly one responsibility.

Every provider is replaceable.

Every notification provider is replaceable.

Business logic remains centralized.

Database access remains isolated.

Architecture favors long-term maintainability over rapid development.

---

# Future Extensions

Planned architectural additions:

Authentication

User management

Subscription system

Billing

Provider health dashboard

Background workers

Distributed scheduler

Caching

Rate limiting

Analytics

Observability

Deployment automation

Microservices (only if justified)

Until proven necessary, ModeAlert remains a modular monolith.

---

# Guiding Principle

A developer should always know where new code belongs.

If the answer is unclear,

the architecture probably needs improvement.