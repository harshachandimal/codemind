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

  // ── While-loop tests (Step 10.1) ──────────────────────────────────────────

  it('interprets_simple_while_countdown', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function countdown(n) {
  let total = 0;
  while (n > 0) {
    total = total + n;
    n = n - 1;
  }
  return total;
}`,
      entryFunction: 'countdown',
      input: [3],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(6);

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('loop_start');
    expect(types).toContain('loop_iteration');
    expect(types).toContain('loop_exit');
    
    // assignment steps show n changing
    const assignments = result.steps.filter(s => s.type === 'assignment');
    expect(assignments.some(s => s.variables['n'] === 2)).toBe(true);
  });

  it('interprets_while_array_sum', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function sum(arr) {
  let total = 0;
  let i = 0;
  while (i < arr.length) {
    total = total + arr[i];
    i++;
  }
  return total;
}`,
      entryFunction: 'sum',
      input: [[2, 4, 6]],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(12);

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('array_read');

    // loop iterations count should be 3
    const iterations = types.filter(t => t === 'loop_iteration').length;
    expect(iterations).toBe(3);
  });

  it('supports_return_inside_while', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function firstPositive(arr) {
  let i = 0;
  while (i < arr.length) {
    if (arr[i] > 0) {
      return arr[i];
    }
    i++;
  }
  return 0;
}`,
      entryFunction: 'firstPositive',
      input: [[-2, -1, 5]],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(5);
  });

  it('rejects_while_without_block_body', () => {
    expect(() =>
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad(n) {
  while (n > 0) n = n - 1;
  return n;
}`,
        entryFunction: 'bad',
        input: [3],
      })
    ).toThrow(TraceInterpreterError);
  });

  it('enforces_max_loop_iterations_for_while', () => {
    let error: any;
    try {
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad() {
  let n = 1;
  while (n > 0) {
    n = n + 1;
  }
  return n;
}`,
        entryFunction: 'bad',
        input: [],
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(TraceInterpreterError);
    expect(error.code).toBe('MAX_LOOP_ITERATIONS_EXCEEDED');
  });

  it('rejects_non_boolean_while_condition', () => {
    let error: any;
    try {
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad(n) {
  while (n) {
    n = n - 1;
  }
  return n;
}`,
        entryFunction: 'bad',
        input: [3],
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(TraceInterpreterError);
    expect(error.code).toBe('UNSUPPORTED_EXPRESSION');
  });


  // ── Call Frame Scope (Step 10.4) ────────────────────────────────────────

  it('parameters_are_scoped_to_function_frame', () => {
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
    
    // Variables must be inside trace steps representing current active scope
    const varDeclStep = result.steps.find((s) => s.type === 'variable_declaration');
    expect(varDeclStep).toBeDefined();
    expect(varDeclStep!.variables['a']).toBe(2);
    expect(varDeclStep!.variables['b']).toBe(3);
    expect(varDeclStep!.variables['total']).toBe(5);

    // Call stack should be empty after run
    expect(result.finalState.callStack).toHaveLength(0);
    // state.variables might be empty depending on tests/if they were declared globally
    // We only enforce that function scope was isolated.
  });

  // ── Recursion Tests (Step 10.5) ──────────────────────────────────────────

  it('interprets_factorial_recursion', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}`,
      entryFunction: 'factorial',
      input: [4],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(24);
    expect(result.terminatedReason).toBe('completed');
    expect(result.finalState.callStack).toHaveLength(0);

    const callSteps = result.steps.filter((s) => s.type === 'function_call');
    expect(callSteps.length).toBeGreaterThan(1);
    
    const returnSteps = result.steps.filter((s) => s.type === 'return');
    expect(returnSteps.length).toBeGreaterThan(1);
  });

  it('interprets_countdown_recursion', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function countdown(n) {
  if (n === 0) {
    return 0;
  }
  return countdown(n - 1);
}`,
      entryFunction: 'countdown',
      input: [3],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(0);
    const callSteps = result.steps.filter((s) => s.type === 'function_call');
    expect(callSteps.length).toBeGreaterThan(1);
  });

  it('enforces_max_call_depth', () => {
    let error: any;
    try {
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function bad(n) {
  return bad(n + 1);
}`,
        entryFunction: 'bad',
        input: [1],
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(TraceInterpreterError);
    expect(error.code).toBe('MAX_CALL_DEPTH_EXCEEDED');
  });

  it('rejects_helper_function_call', () => {
    let error: any;
    try {
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function helper(n) {
  return n;
}
function main(n) {
  return helper(n);
}`,
        entryFunction: 'main',
        input: [5],
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(TraceInterpreterError);
    expect(error.code).toBe('UNSUPPORTED_FUNCTION_CALL');
  });

  it('rejects_mutual_recursion', () => {
    let error: any;
    try {
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function even(n) {
  if (n === 0) {
    return true;
  }
  return odd(n - 1);
}
function odd(n) {
  if (n === 0) {
    return false;
  }
  return even(n - 1);
}`,
        entryFunction: 'even',
        input: [2],
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(TraceInterpreterError);
    expect(error.code).toBe('UNSUPPORTED_FUNCTION_CALL');
  });

  it('recursion_uses_isolated_call_frame_variables', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function count(n) {
  if (n === 0) {
    return 0;
  }
  let next = n - 1;
  return count(next);
}`,
      entryFunction: 'count',
      input: [3],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(0);
    expect(result.finalState.callStack).toHaveLength(0);
    
    // Check snapshots show different n values
    const declSteps = result.steps.filter((s) => s.type === 'variable_declaration' && 'next' in s.variables);
    expect(declSteps.length).toBeGreaterThan(0);
    expect(declSteps[0]?.variables['n']).not.toBe(declSteps[1]?.variables['n']);
  });

  // ── Nested Loop Tests (Step 14.1) ─────────────────────────────────────────

  it('interprets_nested_for_loop_counter', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function countPairs(n) {
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      count = count + 1;
    }
  }
  return count;
}`,
      entryFunction: 'countPairs',
      input: [3],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(9);

    const types = result.steps.map((s) => s.type);
    // Both outer and inner loops produce loop_start steps
    const loopStarts = types.filter((t) => t === 'loop_start');
    expect(loopStarts.length).toBeGreaterThanOrEqual(2);
    expect(types).toContain('loop_iteration');

    // Final return must be 9
    const returnSteps = result.steps.filter((s) => s.type === 'return');
    const lastReturn = returnSteps[returnSteps.length - 1];
    expect(lastReturn?.variables['count']).toBe(9);
  });

  it('interprets_nested_while_loop_counter', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function countWhile(n) {
  let count = 0;
  let i = 0;
  while (i < n) {
    let j = 0;
    while (j < n) {
      count = count + 1;
      j++;
    }
    i++;
  }
  return count;
}`,
      entryFunction: 'countWhile',
      input: [3],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(9);

    const types = result.steps.map((s) => s.type);
    const loopStarts = types.filter((t) => t === 'loop_start');
    // Outer (1) + inner (3 times) = 4 loop_start events
    expect(loopStarts.length).toBeGreaterThanOrEqual(2);
    expect(types).toContain('loop_iteration');
  });

  it('interprets_mixed_for_while_nested_loop', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function mixed(n) {
  let count = 0;
  for (let i = 0; i < n; i++) {
    let j = 0;
    while (j < n) {
      count = count + 1;
      j++;
    }
  }
  return count;
}`,
      entryFunction: 'mixed',
      input: [2],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(4);
  });

  it('return_inside_inner_loop_bubbles_out', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function firstPair(n) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      return i + j;
    }
  }
  return -1;
}`,
      entryFunction: 'firstPair',
      input: [3],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(0); // i=0, j=0 → 0+0=0
    expect(result.finalState.callStack).toHaveLength(0);

    // loopDepth must be restored to 0
    expect(result.finalState.loopDepth).toBe(0);
  });

  it('enforces_max_loop_depth', () => {
    // Build a source with 6 nested for loops (exceeds maxLoopDepth of 5)
    const src = `function deep(n) {
  let c = 0;
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      for (let c2 = 0; c2 < n; c2++) {
        for (let d = 0; d < n; d++) {
          for (let e = 0; e < n; e++) {
            for (let f = 0; f < n; f++) {
              c = c + 1;
            }
          }
        }
      }
    }
  }
  return c;
}`;
    let error: any;
    try {
      interpreter.interpret({
        language: 'javascript',
        sourceCode: src,
        entryFunction: 'deep',
        input: [2],
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(TraceInterpreterError);
    expect(error.code).toBe('MAX_LOOP_DEPTH_EXCEEDED');
  });

  it('enforces_max_steps_for_large_nested_loops', () => {
    let error: any;
    try {
      interpreter.interpret({
        language: 'javascript',
        sourceCode: `function huge(n) {
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      count = count + 1;
    }
  }
  return count;
}`,
        entryFunction: 'huge',
        input: [1000000],
      });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(TraceInterpreterError);
    // Either max steps or max loop iterations will trigger first — both are safe
    expect(['MAX_STEPS_EXCEEDED', 'MAX_LOOP_ITERATIONS_EXCEEDED']).toContain(error.code);
  });

  it('matrix_sum_with_nested_array_reads', () => {
    const result = interpreter.interpret({
      language: 'javascript',
      sourceCode: `function matrixSum(matrix) {
  let total = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      total = total + matrix[i][j];
    }
  }
  return total;
}`,
      entryFunction: 'matrixSum',
      input: [[[1, 2, 3], [4, 5, 6]]],
    });

    expect(result.success).toBe(true);
    expect(result.finalState.returnedValue).toBe(21);

    const types = result.steps.map((s) => s.type);
    expect(types).toContain('array_read');
    expect(types).toContain('loop_iteration');
  });
  it('attaches_source_line_metadata_to_trace_steps', () => {
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

    const fnCall = result.steps.find((s) => s.type === 'function_call');
    expect(fnCall?.lineNumber).toBe(1);

    const varDecl = result.steps.find((s) => s.type === 'variable_declaration' && s.description.includes('total'));
    expect(varDecl?.lineNumber).toBe(2);

    const loopStart = result.steps.find((s) => s.type === 'loop_start');
    expect(loopStart?.lineNumber).toBe(3);

    const assignment = result.steps.find((s) => s.type === 'assignment' && s.description.includes('total = total + arr[i]'));
    // Depending on AST representation, it could be the statement or the expression. Usually lines match up.
    // The test only requires the assignment step has lineNumber 4.
    const assignStep = result.steps.find((s) => s.type === 'assignment' && s.lineNumber === 4);
    expect(assignStep).toBeDefined();

    const returnStep = result.steps.find((s) => s.type === 'return');
    expect(returnStep?.lineNumber).toBe(6);
  });
});
