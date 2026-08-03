# AI Context

> This document is the first document that every AI assistant must read before making any change to the project.

---

# Project

Project Name:

ModeAlert

---

# Purpose

ModeAlert is a passive income SaaS.

The project monitors temporary game modes and events across multiple games.

Users can subscribe to events.

When an event starts or changes, the system sends notifications.

The long term goal is to become the best event tracker for online games.

Everything should be designed for scalability.

Everything should require as little maintenance as possible.

---

# Business Goal

The software should eventually generate passive income.

The owner should not manually update event data.

Everything should be synchronized automatically.

New games should be pluggable.

---

# Owner

Owner:
Deniz Önen

Background:

Management Engineer

NOT a software engineer.

Therefore:

Every code response must contain

- complete file
- complete path
- terminal commands if necessary

Never answer with partial snippets.

Never assume manual editing.

---

# AI Rules

The assistant MUST

- always give full files
- never omit unchanged sections
- always specify file path
- explain terminal commands
- prefer clean architecture
- prefer extensibility
- prefer low maintenance

---

# Documentation Order

Always read in this order.

00_PROJECT.md

01_VISION.md

02_REQUIREMENTS.md

03_ARCHITECTURE.md

04_ROADMAP.md

05_CONVENTIONS.md

06_DECISIONS.md

07_AI_CONTEXT.md

---

# Existing Architecture

The project already uses

Provider Architecture

Repository Pattern

Service Layer

Scheduler

Notification Engine

Prisma

Next.js API Routes

CommunityDragon Provider

Riot Provider

Provider Registry

Notification Provider Registry

Event Sync Pipeline

Do not rewrite architecture unless absolutely necessary.

---

# Current Status

Backend architecture exists.

Database exists.

Provider system exists.

Notification system exists.

Dashboard exists.

Next goal is completing production-ready synchronization.

---

# Coding Philosophy

Prefer

small services

dependency injection

composition

testability

single responsibility

Never introduce unnecessary abstractions.

---

# Golden Rule

If documentation conflicts with assumptions,

documentation wins.
