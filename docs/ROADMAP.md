# CodeMind — Development Roadmap

Each phase has a clear, focused goal. A phase is only started when the previous phase is complete and stable. No phase skipping.

---

## Phase 0 — Planning & Project Structure
**Status:** ✅ In Progress

- Define project vision, goals, and constraints
- Establish documentation structure
- Define architecture decisions
- Define development rules
- Set up repository and folder structure
- No application code written yet

**Deliverables:**
- `README.md`
- `docs/PROJECT_OVERVIEW.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/DEVELOPMENT_RULES.md`

---

## Phase 1 — Laravel Backend Foundation
**Status:** ⬜ Not Started

- Initialize Laravel 11 project in `backend/`
- Configure environment (`.env`)
- Connect to PostgreSQL database
- Set up Laravel Sanctum for SPA authentication
- Verify database connectivity
- Establish folder conventions (Services, DTOs, Resources)

**Deliverables:**
- Functional Laravel installation
- Verified DB connection
- Sanctum configured

---

## Phase 2 — React Frontend Foundation
**Status:** ⬜ Not Started

- Initialize React + Vite project in `frontend/`
- Install and configure Monaco Editor
- Set up React Router for navigation
- Configure Axios for API communication
- Set up base layout (header, sidebar, main content area)
- Connect to Laravel API (CORS configured)

**Deliverables:**
- Functional React SPA
- Monaco editor rendering JavaScript
- API connection verified

---

## Phase 3 — Authentication
**Status:** ⬜ Not Started

- Implement user registration endpoint (`POST /api/register`)
- Implement user login endpoint (`POST /api/login`)
- Implement user logout endpoint (`POST /api/logout`)
- Return Sanctum tokens on login
- Implement React auth flow (login page, protected routes)
- Store token in memory or httpOnly cookie

**Deliverables:**
- Working registration and login
- Protected routes in React
- Auth state managed in frontend

---

## Phase 4 — Database Models
**Status:** ⬜ Not Started

- Create `users` table migration (already exists via Laravel default)
- Create `analyses` table migration:
  - `id`, `user_id`, `code` (text), `language`, `time_complexity`, `space_complexity`, `explanation`, `status`, `created_at`, `updated_at`
- Create `Analysis` Eloquent model
- Define relationships: `User hasMany Analysis`
- Write model factories and seeders for testing

**Deliverables:**
- Migrations run successfully
- Models and relationships defined
- Factories written

---

## Phase 5 — Basic Analysis API
**Status:** ⬜ Not Started

- Create `POST /api/analyses` endpoint (submit code for analysis)
- Create `GET /api/analyses` endpoint (list user's history)
- Create `GET /api/analyses/{id}` endpoint (get single analysis)
- Add request validation (code length, format)
- Return stubbed/placeholder complexity results initially
- Write API tests for each endpoint

**Deliverables:**
- Analysis CRUD endpoints working
- Validation in place
- API tests passing

---

## Phase 6 — Complexity Analyser
**Status:** ⬜ Not Started

- Implement `ComplexityEstimatorService` in Laravel
- Use PHP regex/string analysis to detect common patterns:
  - Single loops → O(n)
  - Nested loops → O(n²)
  - Recursive patterns → O(log n) or O(n log n)
  - No loops → O(1)
- Estimate space complexity from variable/array declarations
- Integrate service into analysis endpoint
- Write unit tests for the service

**Deliverables:**
- `ComplexityEstimatorService` with unit tests
- Analysis endpoint returns real estimates

---

## Phase 7 — Frontend Editor & Results
**Status:** ⬜ Not Started

- Build the main editor page in React
- Wire up Monaco Editor to submit code via API
- Display complexity results in a clean results panel
- Add loading states and error handling
- Style the results with complexity badges (O(n), O(n²), etc.)

**Deliverables:**
- Editor → Submit → Results flow working end to end

---

## Phase 8 — Analysis History
**Status:** ⬜ Not Started

- Build history list page in React
- Fetch and paginate `GET /api/analyses`
- Allow clicking a history item to reload code + results
- Add delete functionality (`DELETE /api/analyses/{id}`)
- Display timestamps, complexity summary in history list

**Deliverables:**
- History page with pagination
- Delete working
- Full history flow tested

---

## Phase 9 — Execution Visualizer
**Status:** ⬜ Not Started

- Design execution trace data structure
- Implement `ExecutionTracerService` (static trace simulation, no actual execution)
- Build step-by-step visualizer UI in React
- Animate variable state changes, loop iterations, call stack
- Integrate with analysis results display

**Deliverables:**
- Step visualizer working for common patterns (loops, conditionals)

---

## Phase 10 — Queue Processing
**Status:** ⬜ Not Started

- Install and configure Redis
- Configure Laravel Queue with Redis driver
- Move analysis processing into a queued Job (`AnalyseCodeJob`)
- Install and configure Laravel Horizon for queue monitoring
- Return a pending status immediately; poll or use WebSocket for completion
- Handle failed jobs gracefully

**Deliverables:**
- Async analysis via Redis queue
- Horizon dashboard operational

---

## Phase 11 — AI Explanations
**Status:** ⬜ Not Started

- Integrate OpenAI API (or similar) for natural-language code explanation
- Create `AiExplainerService` in Laravel
- Send sanitized code (not executed) to AI for explanation
- Cache AI responses to reduce API cost
- Add AI explanation to analysis result display

**Deliverables:**
- AI explanations appearing in results
- Caching layer in place

---

## Phase 12 — Node.js Analysis Microservice
**Status:** ⬜ Not Started

- Initialize Node.js service in `services/analyser/`
- Use Babel/Acorn to parse JavaScript into AST
- Implement AST-based complexity detection (more accurate than regex)
- Expose REST endpoint for Laravel to call
- Integrate via Laravel HTTP client + queue job
- Write tests for the Node.js service

**Deliverables:**
- Node.js service running independently
- Laravel delegates analysis jobs to it
- AST-based complexity results

---

## Phase 13 — Testing
**Status:** ⬜ Not Started

- Write comprehensive unit tests for all Services
- Write feature tests for all API endpoints
- Write frontend component tests (React Testing Library)
- Set up CI pipeline (GitHub Actions)
- Ensure all tests pass before any deployment

**Deliverables:**
- Full test suite with >80% coverage target
- CI pipeline passing

---

## Phase 14 — Docker Deployment
**Status:** ⬜ Not Started

- Write `Dockerfile` for Laravel backend
- Write `Dockerfile` for React frontend (served via Nginx)
- Write `Dockerfile` for Node.js analysis service
- Write `docker-compose.yml` for local development
- Write `docker-compose.prod.yml` for production
- Document deployment steps

**Deliverables:**
- Full stack running via `docker-compose up`
- Production compose file ready

---

## Phase 15 — Production Hardening
**Status:** ⬜ Not Started

- Set up SSL/TLS (Let's Encrypt or managed cert)
- Configure Nginx reverse proxy
- Set up environment-specific config (staging / production)
- Implement proper logging (Laravel Telescope or external)
- Set up error monitoring (Sentry or similar)
- Review and tighten security headers
- Perform load testing

**Deliverables:**
- Production environment hardened and monitored
- Platform ready for real users
