/**
 * tracePlanGenerator — converts an AstSummary into a static TracePlan.
 *
 * PURPOSE:
 * Produces a structured, human-readable plan describing what the tracer
 * will be able to observe once sandboxed runtime execution is implemented.
 * This is purely a static analysis product — no code is executed here.
 *
 * DISTINCTION:
 * - Trace Plan  = static outline of traceable structures (this file).
 * - Trace Result = actual step-by-step runtime execution data (future).
 *
 * SAFETY RULES:
 * - Do NOT execute any code here.
 * - Do NOT use eval, Function constructor, or vm.
 * - Do NOT include raw source code in plan output.
 * - All output is derived from AstSummary metadata only.
 */

import type { AstSummary } from '../types/ast.js';
import type { TracePlan, TracePlanStep } from '../types/trace.js';

// ─── Static limitation notices ────────────────────────────────────────────────

const STANDARD_LIMITATIONS: readonly string[] = [
  'This is a static trace plan, not runtime execution. No code has been run.',
  'Runtime tracing is not yet implemented. Actual step-by-step execution data is unavailable.',
  'Variable values, return values, and loop iteration counts are not available until sandboxed execution is implemented.',
];

// ─── ID generator ─────────────────────────────────────────────────────────────

/** Produces a simple deterministic step ID from a type prefix and index. */
function makeId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}

// ─── Exported generator ───────────────────────────────────────────────────────

/**
 * Generates a {@link TracePlan} from a parsed {@link AstSummary}.
 *
 * Inspects the structural metadata to determine which parts of the code
 * the tracer can instrument in a future execution phase, then describes
 * them as ordered {@link TracePlanStep} entries.
 *
 * @param summary - Structural metadata from parseJavaScriptToSummary().
 * @returns A TracePlan with planned observation points and limitations.
 */
export function generateTracePlan(summary: AstSummary): TracePlan {
  const steps: TracePlanStep[] = [];

  // ── Function entries ───────────────────────────────────────────────────────
  summary.functions.forEach((fn, index) => {
    steps.push({
      id: makeId('fn-entry', index),
      type: 'function_entry',
      title: `Enter function ${fn.name}`,
      description:
        `The tracer can start by recording when "${fn.name}" is called` +
        (fn.params.length > 0
          ? ` and capturing its parameter values: ${fn.params.join(', ')}.`
          : '.'),
      line: fn.line,
    });
  });

  // ── Loop tracking ──────────────────────────────────────────────────────────
  if (summary.hasForLoop || summary.hasWhileLoop) {
    const loopTypes: string[] = [];
    if (summary.hasForLoop) loopTypes.push('for');
    if (summary.hasWhileLoop) loopTypes.push('while');

    steps.push({
      id: makeId('loop', 0),
      type: 'loop_tracking',
      title: `Track ${loopTypes.join(' and ')} loop iterations`,
      description:
        `Future runtime tracing can record each iteration of the ` +
        `${loopTypes.join(' and ')} loop(s) found in this code, ` +
        `including any variables that change per iteration.`,
      line: null,
    });
  }

  // ── Condition tracking ─────────────────────────────────────────────────────
  if (summary.hasIfStatement) {
    steps.push({
      id: makeId('condition', 0),
      type: 'condition_tracking',
      title: 'Track conditional branches',
      description:
        'Future runtime tracing can record which branch of each if/else ' +
        'statement is taken and the condition value that determined it.',
      line: null,
    });
  }

  // ── Return tracking ────────────────────────────────────────────────────────
  if (summary.hasReturnStatement) {
    steps.push({
      id: makeId('return', 0),
      type: 'return_tracking',
      title: 'Track return values',
      description:
        'Future runtime tracing can record the value returned by each ' +
        'function and the line where the return statement was reached.',
      line: null,
    });
  }

  return {
    supported: steps.length > 0,
    steps,
    limitations: [...STANDARD_LIMITATIONS],
  };
}
