# AI Context

Status: Active

---

# Purpose

This document exists to rapidly onboard an AI assistant into the ModeAlert project.

It should answer:

- What is this project?
- Why does it exist?
- How is it structured?
- What should never change?
- How should future work be approached?

The goal is that a new AI conversation can become productive within minutes.

---

# Project Summary

ModeAlert is a SaaS platform that monitors gaming events from multiple providers and sends personalized notifications.

The project is designed around:

Provider Architecture

↓

Normalization

↓

Database

↓

Event Detection

↓

Notification Engine

↓

Frontend

League of Legends is only the first provider.

The architecture is intentionally game-agnostic.

---

# Main Goal

Generate recurring passive income through a low-maintenance software platform.

Every architectural decision should reduce future maintenance.

---

# Important Philosophy

This project optimizes for:

Maintainability

Scalability

Automation

Developer Experience

Long-term stability

NOT rapid feature development.

---

# Current Tech Stack

Frontend

- Next.js
- React
- TypeScript

Backend

- Next.js Route Handlers
- Service Layer

Database

- Prisma

Providers

- Riot API
- CommunityDragon

Notification System

Designed to support multiple notification providers.

Console provider exists as initial implementation.

---

# Architecture

Project follows a layered architecture.

UI

↓

API

↓

Services

↓

Repositories

↓

Database

External providers are isolated.

Business logic belongs inside services.

Repositories only handle persistence.

Providers only fetch external data.

---

# Core Components

Provider Layer

Responsible for external APIs.

Examples:

Riot

CommunityDragon

Future:

Steam

Blizzard

Epic

Valve

---

Normalization

Every provider returns different data.

Normalizers convert provider-specific responses into a common internal model.

The rest of the application should never care where the data came from.

---

Synchronization

Provider Sync

↓

Normalization

↓

Comparison

↓

Database Update

↓

History

↓

Notification Trigger

---

Notification Engine

Responsible for sending notifications.

Must support multiple providers.

Console is only the first implementation.

Future examples:

Discord

Telegram

Email

Push

Mobile

Webhook

Slack

---

# Coding Rules

Always prefer readability.

Avoid unnecessary abstractions.

Never place business logic inside API routes.

Never duplicate provider logic.

Never hardcode provider-specific assumptions outside provider implementations.

---

# Development Workflow

When adding a feature:

Understand architecture first.

Determine affected layers.

Update documentation.

Implement feature.

Verify architecture consistency.

---

# AI Responsibilities

When helping with this project:

Respect the existing architecture.

Prefer extension over modification.

Avoid introducing coupling.

Suggest maintainable solutions.

Think like a software architect.

Not like a code generator.

---

# Things the AI should frequently ask

Will this increase maintenance?

Can this become provider-independent?

Does this belong in Services?

Can this be reused?

Does this violate modularity?

Will this still make sense in two years?

---

# Current Project Direction

Current focus:

Complete backend architecture.

Complete synchronization engine.

Integrate Riot provider.

Integrate CommunityDragon.

Implement notification pipeline.

After backend stabilizes:

Improve frontend.

Add authentication.

Deploy production.

Launch MVP.

Acquire first users.

---

# Ultimate Goal

Build software that earns money while requiring as little manual work as possible.

Every line of code should move the project toward that goal.