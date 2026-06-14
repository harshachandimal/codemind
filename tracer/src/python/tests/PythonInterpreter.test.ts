import { describe, it, expect } from 'vitest';
import { PythonInterpreter } from '../pythonInterpreter';

describe('Python Interpreter', () => {
  it('runs_add_function', () => {
    const sourceCode = `
def add(a, b):
    result = a + b
    return result
    `;
    const interpreter = new PythonInterpreter();
    const result = interpreter.run({ sourceCode, entryFunction: 'add', input: [2, 3] });
    expect(result.returnedValue).toBe(5);
  });

  it('runs_calculation_with_multiple_assignments', () => {
    const sourceCode = `
def calc(a, b):
    sum_value = a + b
    result = sum_value * 2
    return result
    `;
    const interpreter = new PythonInterpreter();
    const result = interpreter.run({ sourceCode, entryFunction: 'calc', input: [2, 3] });
    expect(result.returnedValue).toBe(10);
  });

  it('runs_if_true_branch', () => {
    const sourceCode = `
def is_positive(n):
    if n > 0:
        return True
    return False
    `;
    const interpreter = new PythonInterpreter();
    const result = interpreter.run({ sourceCode, entryFunction: 'is_positive', input: [5] });
    expect(result.returnedValue).toBe(true);
  });

  it('runs_if_false_fallthrough', () => {
    const sourceCode = `
def is_positive(n):
    if n > 0:
        return True
    return False
    `;
    const interpreter = new PythonInterpreter();
    const result = interpreter.run({ sourceCode, entryFunction: 'is_positive', input: [-1] });
    expect(result.returnedValue).toBe(false);
  });

  it('runs_if_else', () => {
    const sourceCode = `
def sign(n):
    if n > 0:
        return "positive"
    else:
        return "zero_or_negative"
    `;
    const interpreter = new PythonInterpreter();
    const r1 = interpreter.run({ sourceCode, entryFunction: 'sign', input: [3] });
    expect(r1.returnedValue).toBe("positive");
    
    const r2 = interpreter.run({ sourceCode, entryFunction: 'sign', input: [0] });
    expect(r2.returnedValue).toBe("zero_or_negative");
  });

  it('runs_if_elif_else', () => {
    const sourceCode = `
def sign(n):
    if n > 0:
        return "positive"
    elif n < 0:
        return "negative"
    else:
        return "zero"
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'sign', input: [5] }).returnedValue).toBe("positive");
    expect(interpreter.run({ sourceCode, entryFunction: 'sign', input: [-2] }).returnedValue).toBe("negative");
    expect(interpreter.run({ sourceCode, entryFunction: 'sign', input: [0] }).returnedValue).toBe("zero");
  });

  it('assignment_inside_if_updates_variable', () => {
    const sourceCode = `
def label(n):
    result = "small"
    if n > 10:
        result = "big"
    return result
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'label', input: [20] }).returnedValue).toBe("big");
    expect(interpreter.run({ sourceCode, entryFunction: 'label', input: [5] }).returnedValue).toBe("small");
  });

  it('return_inside_if_bubbles_out', () => {
    const sourceCode = `
def early(n):
    if n > 0:
        return n
    value = 10
    return value
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'early', input: [7] }).returnedValue).toBe(7);
  });

  it('records_condition_step', () => {
    const sourceCode = `
def test(n):
    if n > 0:
        return True
    return False
    `;
    const interpreter = new PythonInterpreter();
    const result = interpreter.run({ sourceCode, entryFunction: 'test', input: [5] });
    const stepTypes = result.steps.map((s: any) => s.type);
    expect(stepTypes).toContain('condition');
  });

  it('runs_while_loop_count', () => {
    const sourceCode = `
def count(n):
    i = 0
    while i < n:
        i += 1
    return i
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'count', input: [5] }).returnedValue).toBe(5);
  });

  it('runs_while_loop_sum', () => {
    const sourceCode = `
def total(n):
    i = 0
    result = 0
    while i < n:
        result += i
        i += 1
    return result
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'total', input: [5] }).returnedValue).toBe(10);
  });

  it('runs_for_range_stop', () => {
    const sourceCode = `
def total(n):
    result = 0
    for i in range(n):
        result += i
    return result
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'total', input: [5] }).returnedValue).toBe(10);
  });

  it('runs_for_range_start_stop', () => {
    const sourceCode = `
def total(n):
    result = 0
    for i in range(1, n):
        result += i
    return result
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'total', input: [5] }).returnedValue).toBe(10);
  });

  it('runs_for_range_step', () => {
    const sourceCode = `
def total(n):
    result = 0
    for i in range(0, n, 2):
        result += i
    return result
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'total', input: [6] }).returnedValue).toBe(6);
  });

  it('runs_nested_for_range', () => {
    const sourceCode = `
def count_pairs(n):
    count = 0
    for i in range(n):
        for j in range(n):
            count += 1
    return count
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'count_pairs', input: [3] }).returnedValue).toBe(9);
  });

  it('return_inside_while_bubbles_out', () => {
    const sourceCode = `
def first_positive(n):
    i = 0
    while i < n:
        return i
    return -1
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'first_positive', input: [5] }).returnedValue).toBe(0);
  });

  it('return_inside_for_bubbles_out', () => {
    const sourceCode = `
def first(n):
    for i in range(n):
        return i
    return -1
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'first', input: [5] }).returnedValue).toBe(0);
  });

  it('enforces_max_loop_iterations_while', () => {
    const sourceCode = `
def bad():
    i = 0
    while i >= 0:
        i += 1
    return i
    `;
    const interpreter = new PythonInterpreter();
    expect(() => interpreter.run({ sourceCode, entryFunction: 'bad', input: [] }))
      .toThrow('Python loop exceeded maximum iterations');
  });

  it('rejects_range_step_zero', () => {
    const sourceCode = `
def bad():
    for i in range(0, 10, 0):
        return i
    return 0
    `;
    const interpreter = new PythonInterpreter();
    expect(() => interpreter.run({ sourceCode, entryFunction: 'bad', input: [] }))
      .toThrow('range() arg 3 must not be zero');
  });

  it('rejects_non_number_range_arg', () => {
    const sourceCode = `
def bad():
    for i in range("x"):
        return i
    return 0
    `;
    const interpreter = new PythonInterpreter();
    expect(() => interpreter.run({ sourceCode, entryFunction: 'bad', input: [] }))
      .toThrow('Range argument must be a number');
  });

  it('records_loop_steps', () => {
    const sourceCode = `
def test():
    for i in range(1):
        pass
    return 0
    `;
    const interpreter = new PythonInterpreter();
    const result = interpreter.run({ sourceCode, entryFunction: 'test', input: [] });
    const stepTypes = result.steps.map((s: any) => s.type);
    expect(stepTypes).toContain('loop_start');
    expect(stepTypes).toContain('loop_iteration');
    expect(stepTypes).toContain('loop_exit');
  });

  it('returns_list_index', () => {
    const sourceCode = `
def second(arr):
    return arr[1]
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'second', input: [[10, 20, 30]] }).returnedValue).toBe(20);
  });

  it('sums_list_with_while_len', () => {
    const sourceCode = `
def sum_list(arr):
    i = 0
    total = 0
    while i < len(arr):
        total += arr[i]
        i += 1
    return total
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'sum_list', input: [[1, 2, 3, 4]] }).returnedValue).toBe(10);
  });

  it('sums_list_with_for_range_len', () => {
    const sourceCode = `
def sum_list(arr):
    total = 0
    for i in range(len(arr)):
        total += arr[i]
    return total
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'sum_list', input: [[1, 2, 3, 4]] }).returnedValue).toBe(10);
  });

  it('returns_len_of_input_list', () => {
    const sourceCode = `
def size(arr):
    return len(arr)
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'size', input: [[1, 2, 3]] }).returnedValue).toBe(3);
  });

  it('supports_list_literal', () => {
    const sourceCode = `
def first():
    arr = [5, 6, 7]
    return arr[0]
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'first', input: [] }).returnedValue).toBe(5);
  });

  it('supports_nested_list_index_if_implemented', () => {
    const sourceCode = `
def matrix_first(matrix):
    return matrix[1][0]
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'matrix_first', input: [[[1, 2], [3, 4]]] }).returnedValue).toBe(3);
  });

  it('matrix_sum_if_chained_index_supported', () => {
    const sourceCode = `
def matrix_sum(matrix):
    total = 0
    for i in range(len(matrix)):
        for j in range(len(matrix[i])):
            total += matrix[i][j]
    return total
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'matrix_sum', input: [[[1, 2], [3, 4]]] }).returnedValue).toBe(10);
  });

  it('rejects_out_of_range_index_safely', () => {
    const sourceCode = `
def bad(arr):
    return arr[5]
    `;
    const interpreter = new PythonInterpreter();
    expect(() => interpreter.run({ sourceCode, entryFunction: 'bad', input: [[1, 2]] }))
      .toThrow('list index out of range');
  });

  it('rejects_list_mutation_method', () => {
    const sourceCode = `
def bad(arr):
    arr.append(1)
    return arr
    `;
    const interpreter = new PythonInterpreter();
    expect(() => interpreter.run({ sourceCode, entryFunction: 'bad', input: [[1, 2]] }))
      .toThrow('Python code contains unsupported syntax for runtime tracing.');
  });

  it('records_list_read_step', () => {
    const sourceCode = `
def test(arr):
    return arr[1]
    `;
    const interpreter = new PythonInterpreter();
    const result = interpreter.run({ sourceCode, entryFunction: 'test', input: [[10, 20, 30]] });
    const stepTypes = result.steps.map((s: any) => s.type);
    expect(stepTypes).toContain('array_read');
  });

  it('runs_factorial_recursion', () => {
    const sourceCode = `
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'factorial', input: [4] }).returnedValue).toBe(24);
  });

  it('runs_sum_to_n_recursion', () => {
    const sourceCode = `
def sum_to_n(n):
    if n <= 0:
        return 0
    return n + sum_to_n(n - 1)
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'sum_to_n', input: [4] }).returnedValue).toBe(10);
  });

  it('runs_fibonacci_small_input_if_safe', () => {
    const sourceCode = `
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'fib', input: [5] }).returnedValue).toBe(5);
  });

  it('recursive_scopes_are_isolated', () => {
    const sourceCode = `
def countdown(n):
    value = n
    if n <= 0:
        return value
    return countdown(n - 1)
    `;
    const interpreter = new PythonInterpreter();
    expect(interpreter.run({ sourceCode, entryFunction: 'countdown', input: [3] }).returnedValue).toBe(0);
  });

  it('enforces_max_call_depth', () => {
    const sourceCode = `
def forever(n):
    return forever(n + 1)
    `;
    const interpreter = new PythonInterpreter();
    expect(() => interpreter.run({ sourceCode, entryFunction: 'forever', input: [0] }))
      .toThrow('Maximum Python call depth exceeded');
  });

  it('rejects_helper_function_call', () => {
    const sourceCode = `
def helper(n):
    return n + 1

def main(n):
    return helper(n)
    `;
    const interpreter = new PythonInterpreter();
    expect(() => interpreter.run({ sourceCode, entryFunction: 'main', input: [1] }))
      .toThrow('Python code contains unsupported syntax for runtime tracing.');
  });

  it('records_recursion_steps', () => {
    const sourceCode = `
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
    `;
    const interpreter = new PythonInterpreter();
    const result = interpreter.run({ sourceCode, entryFunction: 'factorial', input: [2] });
    const stepTypes = result.steps.map((s: any) => s.type);
    expect(stepTypes).toContain('function_call');
  });
});
