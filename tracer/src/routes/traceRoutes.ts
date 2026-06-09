/**
 * traceRoutes — HTTP route handlers for trace requests.
 *
 * Mounts on the Express app via src/server.ts.
 *
 * SAFETY RULES:
 * - Do NOT execute sourceCode in any handler.
 * - Do NOT log sourceCode.
 * - Do NOT expose stack traces in responses.
 * - All execution is delegated to TraceService, which validates and
 *   returns a safe placeholder until the sandbox is implemented.
 */

import { Router, type Request, type Response } from 'express';
import { TraceService } from '../services/TraceService.js';
import { createTraceErrorResult } from '../utils/createTraceErrorResult.js';

const router: Router = Router();
const traceService = new TraceService();

// ─── POST /trace ──────────────────────────────────────────────────────────────

router.post('/trace', (req: Request, res: Response): void => {
  try {
    // Pass raw body through — TraceService.trace() accepts unknown and
    // runs full validation internally before touching any field.
    const result = traceService.trace(req.body as unknown);

    // Always return 200 with the structured TraceResult.
    // Validation failures are encoded inside result.success and result.steps,
    // not as HTTP error status codes, so callers always receive typed JSON.
    res.json(result);
  } catch {
    // Unexpected error that escaped TraceService — return a safe fallback.
    // Never expose stack traces, file paths, or internal state.
    res.json(
      createTraceErrorResult('Tracer service failed safely.'),
    );
  }
});

export default router;
