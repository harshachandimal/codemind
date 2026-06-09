import { describe, it, expect } from 'vitest';
import { generateTracePlan } from '../../planners/tracePlanGenerator.js';
import type { AstSummary } from '../../types/ast.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSummary(overrides: Partial<AstSummary> = {}): AstSummary {
  return {
    functions: [],
    hasForLoop: false,
    hasWhileLoop: false,
    hasIfStatement: false,
    hasReturnStatement: false,
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('tracePlanGenerator', () => {
  it('creates_function_entry_plan_for_function', () => {
    const summary = makeSummary({
      functions: [{ name: 'sum', params: ['arr'], line: 1 }],
      hasReturnStatement: true,
    });

    const plan = generateTracePlan(summary);

    expect(plan.supported).toBe(true);

    const types = plan.steps.map((s) => s.type);
    expect(types).toContain('function_entry');
    expect(types).toContain('return_tracking');

    // Function entry should mention the function name
    const fnStep = plan.steps.find((s) => s.type === 'function_entry');
    expect(fnStep?.title).toContain('sum');

    // Limitations must be present and mention static plan
    expect(plan.limitations.length).toBeGreaterThan(0);
    const hasStaticNote = plan.limitations.some((l) =>
      l.toLowerCase().includes('static'),
    );
    expect(hasStaticNote).toBe(true);
  });

  it('creates_loop_tracking_for_for_loop', () => {
    const summary = makeSummary({ hasForLoop: true });

    const plan = generateTracePlan(summary);

    const loopStep = plan.steps.find((s) => s.type === 'loop_tracking');
    expect(loopStep).toBeDefined();
    expect(loopStep?.description.toLowerCase()).toContain('iteration');
  });

  it('creates_loop_tracking_for_while_loop', () => {
    const summary = makeSummary({ hasWhileLoop: true });

    const plan = generateTracePlan(summary);

    const loopStep = plan.steps.find((s) => s.type === 'loop_tracking');
    expect(loopStep).toBeDefined();
  });

  it('creates_condition_tracking_for_if_statement', () => {
    const summary = makeSummary({ hasIfStatement: true });

    const plan = generateTracePlan(summary);

    const condStep = plan.steps.find((s) => s.type === 'condition_tracking');
    expect(condStep).toBeDefined();
  });

  it('unsupported_when_no_traceable_structures', () => {
    const summary = makeSummary(); // all defaults = false / empty

    const plan = generateTracePlan(summary);

    expect(plan.supported).toBe(false);
    expect(plan.steps.length).toBe(0);
    expect(plan.limitations.length).toBeGreaterThan(0);
  });
});
