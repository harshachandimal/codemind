# CodeMind — Frontend

This directory will contain the **React + Vite** frontend SPA for the CodeMind platform.

---

## Status

**Phase 0 — Not yet initialized.**

The React project will be created here during **Phase 2** of the development roadmap.
Do not add application files to this directory manually before that phase.

---

## Planned Responsibilities

The React frontend is the browser-based user interface for CodeMind.

| Responsibility | Details |
|---|---|
| **Code editor** | Monaco Editor for JavaScript input with syntax highlighting |
| **API communication** | Axios client for all backend API requests |
| **Authentication UI** | Login, registration, and protected route handling |
| **Analysis display** | Complexity badges, logic explanation, results panel |
| **History view** | Paginated list of past analysis submissions |
| **Execution visualizer** | Step-by-step animated code trace (Phase 9) |

---

## Planned Directory Structure (Post Phase 2)

```
frontend/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   ├── store/
│   └── main.jsx
├── .env
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

---

## Initialization (Phase 2 Only)

**Command (do not run yet — wait for Phase 2):**

```
Command: npm create vite@latest . -- --template react
Purpose: Scaffolds a new React + Vite project in the current directory.
Effect:  Creates index.html, src/, package.json, and vite.config.js.
```

All commands must be explained before being run. See [`../docs/DEVELOPMENT_RULES.md`](../docs/DEVELOPMENT_RULES.md) for the full rules.

---

## Key References

- [Architecture](../docs/ARCHITECTURE.md)
- [Development Rules](../docs/DEVELOPMENT_RULES.md)
- [Roadmap](../docs/ROADMAP.md)
