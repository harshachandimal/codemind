# CodeMind — Backend

This directory will contain the **Laravel 11** backend API for the CodeMind platform.

---

## Status

**Phase 0 — Not yet initialized.**

The Laravel project will be created here during **Phase 1** of the development roadmap.
Do not add application files to this directory manually before that phase.

---

## Planned Responsibilities

The Laravel backend is the primary API layer and business logic host for CodeMind.

| Responsibility | Details |
|---|---|
| **API routing** | REST endpoints for code analysis, auth, and history |
| **Authentication** | Laravel Sanctum for SPA token-based auth |
| **Request validation** | Form Requests for all incoming payloads |
| **Business logic** | Service classes for complexity estimation and explanation |
| **Database access** | Eloquent ORM connected to MySQL (via WampServer for local dev) |
| **API responses** | Laravel API Resources for consistent JSON output |
| **Queue management** | Laravel Horizon + Redis for async analysis jobs (Phase 10) |

---

## Planned Directory Structure (Post Phase 1)

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Requests/
│   │   └── Resources/
│   ├── Models/
│   └── Services/
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── routes/
│   └── api.php
├── tests/
│   ├── Feature/
│   └── Unit/
├── .env
├── .env.example
└── composer.json
```

---

## Initialization (Phase 1 Only)

**Command (do not run yet — wait for Phase 1):**

```
Command: composer create-project laravel/laravel .
Purpose: Scaffolds a new Laravel 11 project in the current directory.
Effect:  Creates all Laravel core files, composer.json, and the default folder structure.
```

All commands must be explained before being run. See [`../docs/DEVELOPMENT_RULES.md`](../docs/DEVELOPMENT_RULES.md) for the full rules.

---

## Key References

- [Architecture](../docs/ARCHITECTURE.md)
- [Development Rules](../docs/DEVELOPMENT_RULES.md)
- [Roadmap](../docs/ROADMAP.md)
