# Technical Architecture

## Overall Architecture

ModeAlert consists of five major layers.

User
↓

Next.js UI

↓

API Routes

↓

Services

↓

Repositories

↓

Prisma

↓

PostgreSQL (Neon, Vercel Storage Marketplace)

↓

Provider Layer

↓

External APIs


No UI component should directly call providers.

No provider should contain business logic.

Business logic always lives inside Services.

Repositories only perform database operations.

Providers only fetch and normalize external data.

This separation must never be broken.

---

# Folder Responsibilities

app/
    API only.

components/
    UI only.

hooks/
    React data hooks.

lib/config/
    configuration

lib/constants/
    enums/constants

lib/db/
    prisma client

lib/http/
    reusable http client

lib/logger/
    logging

lib/providers/
    external data providers

lib/repositories/
    database layer

lib/services/
    business logic

lib/scheduler/
    periodic jobs

lib/notifications/
    notification providers

lib/utils/
    generic utilities

data/
    downloaded static data

tools/
    helper scripts

docs/
    project documentation

prisma/
    schema + migrations + seed

---

# Dependency Rules

Allowed:

UI
↓

API
↓

Service
↓

Repository
↓

Prisma


Service
↓

Provider


Scheduler
↓

Service


Forbidden:

UI -> Provider

UI -> Repository

Provider -> Repository

Repository -> Provider

Repository -> Service

Provider -> Provider

Component -> Database

API -> Database

API -> Provider

---

# Provider System

Providers must implement BaseProvider.

Every provider exposes

fetch()

normalize()

health()

name

priority


Providers must never write into database.

Providers only return normalized data.

Writing is performed by Sync Services.

---

# Current Providers

CommunityDragon

Status:
Implemented

Purpose:
Static metadata

Examples:

Game Modes

Maps

Queues

Images

Assets

Rotating metadata

---

Riot Provider

Status:
Implemented

Purpose:

Champion Rotation

Events

Game data

Future Riot APIs

---

Valorant Provider

Status:
Implemented (2026-08-04)

Purpose:

Platform Status

Active Act/Episode detection (eu.api.riotgames.com)

---

Future Providers

LCU Provider

League Client API

Overwolf

Mobalytics

OP.GG

LoL Esports

Riot News

Steam

Discord

Twitch

Every provider should be pluggable.

Adding a provider should require almost zero code changes elsewhere.

---

# Scheduler

Scheduler is responsible for polling providers.

Never UI.

Never API.

Never Components.

Scheduler triggers:

Provider Sync

Event Detection

Notification Trigger

Statistics Update

Future Prediction Refresh

---

# Event Flow

Provider

↓

Normalize

↓

Event Sync Service

↓

Database

↓

Change Detector

↓

Notification Trigger

↓

Notification Provider

↓

User

This flow should remain unchanged.

---

# Notification Pipeline

Future notification providers:

Console

Discord

Telegram

Email

Push

Web Push

Mobile

Each provider implements NotificationProvider interface.

No business logic inside notification providers.

---

# Database Rules

Repositories are the only database access layer.

No Prisma usage outside repositories.

No SQL outside repositories.

Services work only with repositories.

---

# Error Handling

Providers must never crash scheduler.

Failures become ProviderHealth records.

Scheduler continues.

Retry system handles temporary failures.

---

# Retry Strategy

Transient errors

↓

Retry

↓

Exponential Backoff

↓

Circuit Breaker (future)

---

# Logging

Every provider logs

Start

Duration

Result

Failure reason

Every sync logs

Created

Updated

Deleted

Ignored

Notification count

Duration

---

# Future Scalability

Current

PostgreSQL (Neon)

↓

Future

Redis Cache

↓

Future

Queue Workers

↓

Future

Microservices (only if absolutely necessary)

Architecture should require minimal changes during migration.

---

# Long-Term Vision

Eventually ModeAlert becomes an event platform rather than a League notifier.

Everything revolves around Events.

Games become plugins.

Providers become plugins.

Notifications become plugins.

Database schema remains generic.

The architecture should support this evolution naturally.