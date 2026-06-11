import { describe, it, expect } from 'vitest';
import { JavaScriptInterpreter } from '../../interpreter/JavaScriptInterpreter.js';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';

const interpreter = new JavaScriptInterpreter();

describe('JavaScriptInterpreter', () => {
  it('interprets_function_returning_number_literal', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: 'function five() { return 5; }',
      entryFunction: 'five',
      input: [],
    });

    expect(result.success).toBe(true);
    expect(result.terminatedReason).toBe('completed');
    expect(result.finalState.returnedValue).toBe(5);

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('function_call');
    expect(types).toContain('return');
  });

  it('interprets_function_returning_string_literal', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: 'function greet() { return "hello"; }',
      entryFunction: 'greet',
      input: [],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe('hello');
  });

  it('interprets_function_returning_boolean_literal', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: 'function yes() { return true; }',
      entryFunction: 'yes',
      input: [],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(true);
  });

  it('binds_parameters_and_evaluates_binary_addition', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: 'function add(a, b) { return a + b; }',
      entryFunction: 'add',
      input: [2, 3],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(5);
    // Verify all expected step types appear
    const types = result.steps.map((s) => s.type);
    expect(types).toContain('function_call');
    expect(types).toContain('return');
  });

  it('evaluates_subtraction_binary_expression', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: 'function sub(a, b) { return a - b; }',
      entryFunction: 'sub',
      input: [10, 3],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(7);
  });

  it('evaluates_multiplication_binary_expression', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: 'function mul(x, y) { return x * y; }',
      entryFunction: 'mul',
      input: [4, 5],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(20);
  });

  it('throws_for_missing_function', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: 'var x = 1;',
        entryFunction: 'missing',
        input: [],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('throws_for_unsupported_return_expression', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: 'function bad() { return Math.random(); }',
        entryFunction: 'bad',
        input: [],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('uses_first_function_when_no_entry_specified', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: 'function first() { return 42; }',
      input: [],
    } as Parameters<typeof interpreter.interpret>[0]);

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(42);
  });

  it('step_descriptions_contain_function_name', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: 'function myFn() { return 1; }',
      entryFunction: 'myFn',
      input: [],
    });

    const callStep = result.steps.find((s) => s.type === 'function_call');
    expect(callStep?.description).toContain('myFn');
  });

  // ── Variable declaration and assignment tests (Step 8.16) ─────────────────

  it('interprets_let_variable_declaration_and_return_identifier', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function getTotal() {
  let total = 5;
  return total;
}`,
      entryFunction: 'getTotal',
      input: [],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(5);

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('variable_declaration');
    expect(types).toContain('return');

    // The return step variables should include total = 5
    const returnStep = result.steps.find((s) => s.type === 'return');
    expect(returnStep?.variables['total']).toBe(5);
  });

  it('interprets_assignment_to_existing_variable', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function calculate() {
  let total = 0;
  total = 5;
  return total;
}`,
      entryFunction: 'calculate',
      input: [],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(5);

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('variable_declaration');
    expect(types).toContain('assignment');
    expect(types).toContain('return');

    // The assignment step should snapshot total = 5
    const assignStep = result.steps.find((s) => s.type === 'assignment');
    expect(assignStep?.variables['total']).toBe(5);
  });

  it('evaluates_binary_expression_with_parameters_into_variable', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function add(a, b) {
  let total = a + b;
  return total;
}`,
      entryFunction: 'add',
      input: [2, 3],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(5);

    const declStep = result.steps.find((s) => s.type === 'variable_declaration');
    expect(declStep?.variables['total']).toBe(5);
  });

  it('rejects_assignment_to_undefined_variable', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad() {
  total = 5;
  return total;
}`,
        entryFunction: 'bad',
        input: [],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('rejects_compound_assignment_operator', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad() {
  let total = 1;
  total += 2;
  return total;
}`,
        entryFunction: 'bad',
        input: [],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('rejects_variable_declaration_without_initializer', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad() {
  let total;
  return total;
}`,
        entryFunction: 'bad',
        input: [],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('records_variable_snapshot_per_step', () => {
    // Declare total = 0, then assign total = 10 — snapshots should differ
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function demo() {
  let x = 0;
  x = 10;
  return x;
}`,
      entryFunction: 'demo',
      input: [],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(10);

    const declStep = result.steps.find((s) => s.type === 'variable_declaration');
    const assignStep = result.steps.find((s) => s.type === 'assignment');

    // Snapshot at declaration time: x = 0
    expect(declStep?.variables['x']).toBe(0);
    // Snapshot at assignment time: x = 10
    expect(assignStep?.variables['x']).toBe(10);
  });

  // ── For-loop tests (Step 8.17) ────────────────────────────────────────────

  it('interprets_simple_for_loop_sum', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function sum() {
  let total = 0;
  for (let i = 0; i < 3; i++) {
    total = total + i;
  }
  return total;
}`,
      entryFunction: 'sum',
      input: [],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(3); // 0 + 1 + 2 = 3

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('loop_start');
    expect(types).toContain('loop_iteration');
    expect(types).toContain('loop_exit');
    expect(types).toContain('return');

    // The final return step should have total = 3
    const returnSteps = result.steps.filter((s) => s.type === 'return');
    const returnStep = returnSteps[returnSteps.length - 1];
    expect(returnStep?.variables['total']).toBe(3);
  });

  it('supports_loop_condition_using_parameter', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function sumTo(n) {
  let total = 0;
  for (let i = 0; i <= n; i++) {
    total = total + i;
  }
  return total;
}`,
      entryFunction: 'sumTo',
      input: [3],
    });

    expect(result.success).toBe(true);
    // 0 + 1 + 2 + 3 = 6
    expect(result.finalState.returnedValue).toBe(6);
  });

  it('supports_return_inside_loop', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function first() {
  for (let i = 0; i < 3; i++) {
    return i;
  }
  return 99;
}`,
      entryFunction: 'first',
      input: [],
    });

    // Should return 0 (first iteration, i = 0)
    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(0);
    // loop_exit should NOT appear since we returned early
    const types = result.steps.map((s) => s.type);
    expect(types).not.toContain('loop_exit');
  });

  it('rejects_loop_without_block_body', () => {
    // Single-statement loop body (no braces) should throw
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad() {
  for (let i = 0; i < 3; i++) return i;
}`,
        entryFunction: 'bad',
        input: [],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('enforces_max_loop_iterations', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad() {
  let total = 0;
  for (let i = 0; i < 1000000; i++) {
    total = total + i;
  }
  return total;
}`,
        entryFunction: 'bad',
        input: [],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('evaluates_comparison_operators', () => {
    const eq = interpreter.interpret({
      language: 'javascript',
      sourceCode: 'function eq() { return 5 === 5; }',
      entryFunction: 'eq',
      input: [],
    });
    expect(eq.finalState.returnedValue).toBe(true);

    const neq = interpreter.interpret({
      language: 'javascript',
      sourceCode: 'function neq() { return 5 !== 3; }',
      entryFunction: 'neq',
      input: [],
    });
    expect(neq.finalState.returnedValue).toBe(true);
  });

  // ── If-statement tests (Step 8.18) ────────────────────────────────────────

  it('interprets_if_true_branch_with_return', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function check(n) {
  if (n > 0) {
    return "positive";
  }
  return "not positive";
}`,
      entryFunction: 'check',
      input: [5],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe('positive');

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('condition');
    expect(types).toContain('branch');

    const condStep = result.steps.find((s) => s.type === 'condition');
    expect(condStep?.description).toContain('true');
  });

  it('interprets_if_false_falls_through_to_later_return', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function check(n) {
  if (n > 0) {
    return "positive";
  }
  return "not positive";
}`,
      entryFunction: 'check',
      input: [-1],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe('not positive');

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('condition');
    expect(types).toContain('branch');

    const branchStep = result.steps.find((s) => s.type === 'branch');
    expect(branchStep?.description).toContain('Skipped if branch');
  });

  it('interprets_else_branch', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function check(n) {
  if (n > 0) {
    return "positive";
  } else {
    return "zero or negative";
  }
}`,
      entryFunction: 'check',
      input: [0],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe('zero or negative');

    const branchStep = result.steps.find((s) => s.type === 'branch');
    expect(branchStep?.description).toContain('Entered else branch');
  });

  it('supports_if_assignment_then_return', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function check(n) {
  let result = "unknown";

  if (n > 0) {
    result = "positive";
  }

  return result;
}`,
      entryFunction: 'check',
      input: [3],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe('positive');

    const assignStep = result.steps.find((s) => s.type === 'assignment');
    expect(assignStep?.variables['result']).toBe('positive');
  });

  it('supports_if_inside_for_loop', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function countPositiveLimit(n) {
  let total = 0;

  for (let i = 0; i <= n; i++) {
    if (i > 1) {
      total = total + 1;
    }
  }

  return total;
}`,
      entryFunction: 'countPositiveLimit',
      input: [3], // i=0(no), i=1(no), i=2(yes), i=3(yes) => total=2
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(2);

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('loop_iteration');
    expect(types).toContain('condition');
    expect(types).toContain('assignment');
  });

  it('rejects_non_block_if_body', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad(n) {
  if (n > 0) return 1;
  return 0;
}`,
        entryFunction: 'bad',
        input: [5],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('rejects_non_boolean_condition_if_strict', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad() {
  let x = 1;
  if (x) {
    return 1;
  }
  return 0;
}`,
        entryFunction: 'bad',
        input: [],
      }),
    ).toThrow(TraceInterpreterError);
  });

  // ── Array tests (Step 8.19) ───────────────────────────────────────────────

  it('returns_first_array_item', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function first(arr) {
  return arr[0];
}`,
      entryFunction: 'first',
      input: [[10, 20, 30]],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(10);

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('array_read');
    expect(types).toContain('return');
  });

  it('reads_array_length', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function size(arr) {
  return arr.length;
}`,
      entryFunction: 'size',
      input: [[10, 20, 30]],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(3);

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('array_read');
  });

  it('sums_array_with_for_loop', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function sum(arr) {
  let total = 0;

  for (let i = 0; i < arr.length; i++) {
    total = total + arr[i];
  }

  return total;
}`,
      entryFunction: 'sum',
      input: [[2, 4, 6]],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(12);

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('loop_iteration');
    expect(types).toContain('array_read');
    expect(types).toContain('assignment');
  });

  it('rejects_out_of_range_index', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad(arr) {
  return arr[10];
}`,
        entryFunction: 'bad',
        input: [[1, 2, 3]],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('rejects_negative_index', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad(arr) {
  let i = 0;
  i = i - 1;
  return arr[i];
}`,
        entryFunction: 'bad',
        input: [[1, 2, 3]],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('rejects_decimal_index', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad(arr) {
  return arr[1.5];
}`,
        entryFunction: 'bad',
        input: [[1, 2, 3]],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('rejects_non_array_length_access', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad(x) {
  return x.length;
}`,
        entryFunction: 'bad',
        input: [5],
      }),
    ).toThrow(TraceInterpreterError);
  });

  it('rejects_array_method_call', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad(arr) {
  return arr.push(1);
}`,
        entryFunction: 'bad',
        input: [[1, 2, 3]],
      }),
    ).toThrow(TraceInterpreterError); // Should throw due to Unsupported Expression (CallExpression)
  });
});
