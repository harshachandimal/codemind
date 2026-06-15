/**
 * CodeMind Tracer Service — HTTP Server Entry Point
 *
 * Starts a minimal Express server with:
 *   GET  /health  — liveness/readiness probe
 *   POST /trace   — trace request endpoint (validation only, no execution)
 *
 * SAFETY NOTICE:
 * - Do NOT execute user-submitted code here or in any imported module.
 * - Do NOT use eval, Function constructor, or vm.runInNewContext.
 * - Do NOT expose internal stack traces in responses.
 * - The body size limit (64 kb) is enforced before any handler runs.
 */

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { SERVER_CONFIG } from './config/serverConfig.js';
import { isTracerExecutionEnabled, isPythonTracerEnabled, isJavaTracerEnabled } from './config/runtimeFlags.js';
import traceRoutes from './routes/traceRoutes.js';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

// Enforce a hard body-size cap before any route handler sees the request.
// 64 kb is well above any reasonable trace payload; rejects oversized bodies early.
app.use(express.json({ limit: '64kb' }));

// Restrict browser cross-origin access to known local development origins only.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests (no Origin header) and explicitly listed origins.
      if (origin === undefined || SERVER_CONFIG.allowedOrigins.includes(origin as typeof SERVER_CONFIG.allowedOrigins[number])) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' is not allowed.`));
      }
    },
    methods: ['GET', 'POST'],
  }),
);

// ─── Health endpoint ──────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    service: 'CodeMind Tracer',
    status: 'ready',
    executionEnabled: isTracerExecutionEnabled(),
    pythonRuntimeEnabled: isPythonTracerEnabled(),
    javaRuntimeEnabled: isJavaTracerEnabled(),
  });
});

// ─── Trace routes ─────────────────────────────────────────────────────────────

app.use('/', traceRoutes);

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(SERVER_CONFIG.port, () => {
  console.log(
    `CodeMind tracer service listening on port ${SERVER_CONFIG.port}`,
  );
});
