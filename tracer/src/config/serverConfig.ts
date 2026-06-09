/**
 * HTTP server configuration for the CodeMind tracer service.
 *
 * All network-level settings live here so they can be tuned via
 * environment variables without touching application logic.
 */

export const SERVER_CONFIG = {
  /** Port the tracer HTTP server listens on. Override with PORT env var. */
  port: Number(process.env['PORT'] ?? 4100),

  /**
   * Origins allowed to call the tracer API from a browser.
   * Only the local Vite dev server is permitted — no wildcard origins.
   */
  allowedOrigins: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
} as const;
