# CodeMind

> **Interactive Runtime Intelligence Platform for JavaScript Code Analysis**

---

## Problem Statement

Developers — especially students and learners — often write JavaScript code without a clear understanding of its performance characteristics. Questions like *"Why is this slow?"*, *"How much memory does this use?"*, or *"What exactly is this code doing step by step?"* are hard to answer without specialized tooling or deep experience.

Existing tools either require local setup, lack interactivity, or only provide surface-level feedback. There is no accessible, browser-based platform that combines static analysis, complexity estimation, and step-by-step execution visualization in one place.

---

## Solution

CodeMind allows users to paste JavaScript code directly into a web editor and instantly receive:

- **Time Complexity** estimation (e.g., O(n), O(n²))
- **Space Complexity** estimation
- **Logic Explanation** in plain English
- **Execution Step Visualization** (coming in later phases)

The platform is designed to be fast, educational, and accessible — no local installation required.

---

## Current MVP Scope

The MVP (Minimum Viable Product) focuses on:

1. A clean, minimal web UI with a JavaScript code editor
2. A secure backend API that accepts code submissions
3. Static analysis to estimate time and space complexity
4. Plain-English explanation of what the code does
5. Analysis history stored per user session

No code is **executed** on the server. All analysis is performed through static parsing and pattern matching to ensure security.

---

## Planned Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (with Monaco Editor) |
| Backend API | Laravel (PHP) |
| Database | PostgreSQL |
| Queue / Cache | Redis |
| Analysis Microservice | Node.js (future phase) |
| Containerization | Docker |

---

## Project Status

**Phase 0 — Planning & Project Structure**

The project is currently in its initial planning phase. No application code has been written yet. The focus is on establishing project documentation, architecture decisions, and development rules before writing the first line of code.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full development roadmap.
