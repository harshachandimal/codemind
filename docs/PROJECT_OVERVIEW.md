# CodeMind — Project Overview

---

## Product Vision

CodeMind is an **interactive runtime intelligence platform** that empowers developers to deeply understand their JavaScript code. Rather than simply running code and observing output, CodeMind illuminates the *why* and *how* — breaking down algorithmic complexity, memory behaviour, and execution logic in a clear, visual, and educational way.

The long-term vision is a platform where any developer — from beginner to senior — can paste code and walk away with a thorough understanding of its performance, correctness, and structure.

---

## Target Users

| User Type | Description |
|---|---|
| **Students** | Learning algorithms and data structures; need complexity feedback |
| **Self-taught Developers** | Building intuition about code performance |
| **Interview Preppers** | Validating Big-O estimates for coding interview problems |
| **Educators** | Demonstrating algorithmic concepts in a live environment |
| **Junior Developers** | Getting code explanations and understanding unfamiliar patterns |

---

## Main Features

These are the full set of features planned across all phases of the project:

- **Code Editor** — Browser-based editor with JavaScript syntax highlighting
- **Complexity Analyser** — Static analysis to estimate time and space complexity
- **Recursion Detection** — detects recursive functions, base cases, and recursive calls
- **Logic Explainer** — Plain-English explanation of what the submitted code does
- **Execution Visualiser** — Step-by-step walkthrough of how code executes
- **Recursion Stack Visualizer** — shows call stack growth, base case execution, return values, and stack unwinding
- **Analysis History** — Persistent record of all past code submissions and results
- **User Accounts** — Optional registration and login for saving analysis history
- **AI Explanations** — LLM-generated natural language explanations (future)
- **Queue Processing** — Async job queue for heavy analysis workloads (future)
- **Node.js Microservice** — Dedicated AST parsing service for deep JS analysis (future)

---

## MVP Features

The following features are in scope for the initial MVP release:

1. **Code Submission UI** — A clean web editor for pasting JavaScript code
2. **API Endpoint** — A secure Laravel endpoint that accepts code payloads
3. **Static Analysis** — Pattern-based time and space complexity estimation (basic recursion detection belongs to the complexity analyzer)
4. **Plain-English Explanation** — High-level description of code logic
5. **Results Display** — Clean UI showing analysis results
6. **Analysis History** — Session-based or account-based history of past submissions

> **Security Note:** The MVP performs **static analysis only**. No user-submitted code is executed on the server at any point.

---

## Future Features

These features are planned for post-MVP phases:

- **Execution Step Visualizer** — Animated, step-by-step execution trace (visual recursion stack animation belongs to the execution visualizer phase)
- **AI-Powered Explanations** — Integration with an LLM (e.g., OpenAI API) for deeper insights
- **Node.js Analysis Microservice** — A dedicated service for AST-level parsing using tools like Babel or Acorn
- **Redis Job Queue** — Asynchronous processing for expensive analysis tasks
- **Public Share Links** — Shareable URLs for individual analysis results
- **Diff Analysis** — Compare complexity before and after refactoring
- **Multi-language Support** — Extend analysis to Python, TypeScript, etc.
- **Docker Deployment** — Fully containerized production deployment
