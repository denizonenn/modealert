# Development Rules

Status: Active

Version: 1.0

---

# Purpose

This document defines how ModeAlert should be developed.

Every contributor should follow these rules.

Consistency is more valuable than personal preference.

---

# General Philosophy

Code is written once.

Read thousands of times.

Optimize for readability.

Not typing speed.

---

# Before Writing Code

Always ask:

Does something similar already exist?

Can I extend instead of duplicate?

Does this fit the architecture?

Which layer owns this responsibility?

---

# Folder Rules

Every folder should have a clear responsibility.

Avoid folders that become "misc".

Avoid "helpers" for business logic.

Avoid dumping unrelated utilities together.

---

# Naming

Names should explain intent.

Good:

EventHistoryRepository

NotificationTriggerService

CommunityDragonProvider

Bad:

Utils

Helper

Manager

Stuff

Data2

---

# Services

Services contain business rules.

Services may use:

Repositories

Providers

Other services (carefully)

Services should never know about React.

Services should never render UI.

---

# Repositories

Repositories only persist data.

They should never:

call providers

send notifications

contain business logic

Repositories answer one question:

"How do we store and retrieve data?"

---

# Providers

Providers only communicate with external systems.

Providers should never:

write database

calculate business rules

know UI

know notifications

---

# Components

React components should remain presentation-focused.

Avoid placing application logic inside components.

If logic grows,

move it into hooks or services.

---

# API Routes

API routes should remain extremely thin.

Typical flow:

Validate request

↓

Call service

↓

Return response

Nothing else.

---

# Functions

Prefer small functions.

One responsibility.

One reason to change.

---

# Comments

Explain WHY.

Not WHAT.

Bad:

// increment i

Good:

// Riot returns duplicated rotations during maintenance.
// Ignore duplicates before normalization.

---

# Error Handling

Never silently ignore errors.

Every unexpected error should be:

Logged.

Recoverable if possible.

Understandable.

---

# Logging

Logs should help debugging.

Avoid noisy logs.

Every important background process should log:

start

finish

duration

failures

---

# Configuration

Never hardcode:

URLs

Keys

Secrets

Intervals

Use configuration files or environment variables.

---

# Documentation

Whenever architecture changes:

Update docs.

Documentation is part of the implementation.

---

# Refactoring

If touching messy code:

Leave it cleaner than before.

Small improvements accumulate.

---

# Technical Debt

Temporary hacks require documentation.

Never leave mysterious code.

---

# Code Review Checklist

Before committing ask:

Can this be simpler?

Is it readable?

Does it fit architecture?

Can someone understand this next year?

---

# Golden Rule

Write code for Future Deniz.

Future Deniz should thank Present Deniz.

Not curse him.