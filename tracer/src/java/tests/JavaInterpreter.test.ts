import { describe, it, expect } from 'vitest';
import { JavaInterpreter } from '../javaInterpreter';
import { TraceInterpreterError } from '../errors/javaErrors';

describe('JavaInterpreter MVP', () => {
  it('A) runs_add_method', () => {
    const source = "public class Main { public static int add(int a, int b) { int result = a + b; return result; } }";
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({
      sourceCode: source,
      entryFunction: 'add',
      input: [2, 3]
    });
    expect(result.returnedValue).toBe(5);
    expect(result.steps.map(s => s.type)).toEqual([
      'function_call',
      'variable_declaration',
      'return'
    ]);
  });

  it('B) runs_calculation_with_assignment', () => {
    const source = "public class Main { public static int calc(int a, int b) { int result = a + b; result = result * 2; return result; } }";
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({
      sourceCode: source,
      entryFunction: 'calc',
      input: [2, 3]
    });
    expect(result.returnedValue).toBe(10);
    expect(result.steps.map(s => s.type)).toContain('assignment');
  });

  it('runs_if_true_branch', () => {
    const source = `
      public class Main {
        public static boolean isPositive(int n) {
          if (n > 0) {
            return true;
          }
          return false;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'isPositive', input: [5] });
    expect(result.returnedValue).toBe(true);
  });

  it('runs_if_false_fallthrough', () => {
    const source = `
      public class Main {
        public static boolean isPositive(int n) {
          if (n > 0) {
            return true;
          }
          return false;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'isPositive', input: [-1] });
    expect(result.returnedValue).toBe(false);
  });

  it('runs_if_else', () => {
    const source = `
      public class Main {
        public static String sign(int n) {
          if (n > 0) {
            return "positive";
          } else {
            return "zero_or_negative";
          }
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(interpreter.run({ sourceCode: source, entryFunction: 'sign', input: [3] }).returnedValue).toBe("positive");
    expect(interpreter.run({ sourceCode: source, entryFunction: 'sign', input: [0] }).returnedValue).toBe("zero_or_negative");
  });

  it('runs_else_if_else', () => {
    const source = `
      public class Main {
        public static String sign(int n) {
          if (n > 0) {
            return "positive";
          } else if (n < 0) {
            return "negative";
          } else {
            return "zero";
          }
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(interpreter.run({ sourceCode: source, entryFunction: 'sign', input: [5] }).returnedValue).toBe("positive");
    expect(interpreter.run({ sourceCode: source, entryFunction: 'sign', input: [-2] }).returnedValue).toBe("negative");
    expect(interpreter.run({ sourceCode: source, entryFunction: 'sign', input: [0] }).returnedValue).toBe("zero");
  });

  it('assignment_inside_if_updates_variable', () => {
    const source = `
      public class Main {
        public static String label(int n) {
          String result = "small";
          if (n > 10) {
            result = "big";
          }
          return result;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(interpreter.run({ sourceCode: source, entryFunction: 'label', input: [20] }).returnedValue).toBe("big");
    expect(interpreter.run({ sourceCode: source, entryFunction: 'label', input: [5] }).returnedValue).toBe("small");
  });

  it('return_inside_if_bubbles_out', () => {
    const source = `
      public class Main {
        public static int early(int n) {
          if (n > 0) {
            return n;
          }
          int value = 10;
          return value;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(interpreter.run({ sourceCode: source, entryFunction: 'early', input: [7] }).returnedValue).toBe(7);
    expect(interpreter.run({ sourceCode: source, entryFunction: 'early', input: [-1] }).returnedValue).toBe(10);
  });

  it('rejects_non_boolean_condition', () => {
    const source = `
      public class Main {
        public static int bad(int n) {
          if (1) {
            return n;
          }
          return 0;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(() => interpreter.run({ sourceCode: source, entryFunction: 'bad', input: [5] }))
      .toThrowError(TraceInterpreterError);
  });

  it('records_condition_step', () => {
    const source = `
      public class Main {
        public static int check(int n) {
          if (n > 0) {
            return 1;
          }
          return 0;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'check', input: [5] });
    expect(result.steps.map(s => s.type)).toContain('condition_evaluation');
  });

  it('runs_while_loop_count', () => {
    const source = `
      public class Main {
        public static int count(int n) {
          int i = 0;
          while (i < n) {
              i++;
          }
          return i;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'count', input: [5] });
    expect(result.returnedValue).toBe(5);
  });

  it('runs_while_loop_sum', () => {
    const source = `
      public class Main {
        public static int total(int n) {
          int i = 0;
          int result = 0;
          while (i < n) {
              result += i;
              i++;
          }
          return result;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'total', input: [5] });
    expect(result.returnedValue).toBe(10);
  });

  it('runs_for_loop_sum', () => {
    const source = `
      public class Main {
        public static int total(int n) {
          int result = 0;
          for (int i = 0; i < n; i++) {
              result += i;
          }
          return result;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'total', input: [5] });
    expect(result.returnedValue).toBe(10);
  });

  it('runs_for_loop_with_i_plus_equal', () => {
    const source = `
      public class Main {
        public static int evenTotal(int n) {
          int result = 0;
          for (int i = 0; i < n; i += 2) {
              result += i;
          }
          return result;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'evenTotal', input: [6] });
    expect(result.returnedValue).toBe(6); // 0 + 2 + 4 = 6
  });

  it('runs_nested_for_loop', () => {
    const source = `
      public class Main {
        public static int countPairs(int n) {
          int count = 0;
          for (int i = 0; i < n; i++) {
              for (int j = 0; j < n; j++) {
                  count++;
              }
          }
          return count;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'countPairs', input: [3] });
    expect(result.returnedValue).toBe(9);
  });

  it('runs_mixed_for_while_loop', () => {
    const source = `
      public class Main {
        public static int mixed(int n) {
          int count = 0;
          for (int i = 0; i < n; i++) {
              int j = 0;
              while (j < n) {
                  count++;
                  j++;
              }
          }
          return count;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'mixed', input: [2] });
    expect(result.returnedValue).toBe(4);
  });

  it('return_inside_while_bubbles_out', () => {
    const source = `
      public class Main {
        public static int early(int n) {
          int i = 0;
          while (i < n) {
              if (i == 2) {
                  return 100;
              }
              i++;
          }
          return i;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(interpreter.run({ sourceCode: source, entryFunction: 'early', input: [5] }).returnedValue).toBe(100);
    expect(interpreter.run({ sourceCode: source, entryFunction: 'early', input: [1] }).returnedValue).toBe(1);
  });

  it('rejects_non_boolean_while_condition', () => {
    const source = `
      public class Main {
        public static int bad() {
          while (1) {
          }
          return 0;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(() => interpreter.run({ sourceCode: source, entryFunction: 'bad', input: [] }))
      .toThrowError(TraceInterpreterError);
  });

  it('enforces_max_loop_iterations_while', () => {
    const source = `
      public class Main {
        public static int bad() {
          int i = 0;
          while (i >= 0) {
              i++;
          }
          return i;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(() => interpreter.run({ sourceCode: source, entryFunction: 'bad', input: [] }))
      .toThrowError('JAVA_MAX_LOOP_ITERATIONS_EXCEEDED');
  });

  it('enforces_max_loop_iterations_for', () => {
    const source = `
      public class Main {
        public static int bad() {
          for (int i = 0; i >= 0; i++) {
          }
          return 0;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(() => interpreter.run({ sourceCode: source, entryFunction: 'bad', input: [] }))
      .toThrowError('JAVA_MAX_LOOP_ITERATIONS_EXCEEDED');
  });

  it('records_loop_steps', () => {
    const source = `
      public class Main {
        public static int loop() {
          for (int i = 0; i < 1; i++) {
          }
          return 0;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'loop', input: [] });
    const types = result.steps.map(s => s.type);
    expect(types).toContain('loop_start');
    expect(types).toContain('loop_iteration');
    expect(types).toContain('loop_exit');
  });

  it('returns_array_index', () => {
    const source = `
      public class Main {
        public static int second(int[] arr) {
          return arr[1];
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'second', input: [[10, 20, 30]] });
    expect(result.returnedValue).toBe(20);
  });

  it('returns_array_length', () => {
    const source = `
      public class Main {
        public static int size(int[] arr) {
          return arr.length;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'size', input: [[1, 2, 3]] });
    expect(result.returnedValue).toBe(3);
  });

  it('sums_array_with_for_loop', () => {
    const source = `
      public class Main {
        public static int sumArray(int[] arr) {
          int total = 0;
          for (int i = 0; i < arr.length; i++) {
            total += arr[i];
          }
          return total;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'sumArray', input: [[1, 2, 3, 4]] });
    expect(result.returnedValue).toBe(10);
  });

  it('supports_local_array_initializer', () => {
    const source = `
      public class Main {
        public static int first() {
          int[] arr = {5, 6, 7};
          return arr[0];
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'first', input: [] });
    expect(result.returnedValue).toBe(5);
  });

  it('supports_matrix_index', () => {
    const source = `
      public class Main {
        public static int firstOfSecondRow(int[][] matrix) {
          return matrix[1][0];
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'firstOfSecondRow', input: [[[1, 2], [3, 4]]] });
    expect(result.returnedValue).toBe(3);
  });

  it('matrix_sum_if_chained_index_supported', () => {
    const source = `
      public class Main {
        public static int matrixSum(int[][] matrix) {
          int total = 0;
          for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix[i].length; j++) {
              total += matrix[i][j];
            }
          }
          return total;
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    const result = interpreter.run({ sourceCode: source, entryFunction: 'matrixSum', input: [[[1, 2], [3, 4]]] });
    expect(result.returnedValue).toBe(10);
  });

  it('rejects_wrong_array_input_type', () => {
    const source = `
      public class Main {
        public static int first(int[] arr) {
          return arr[0];
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(() => interpreter.run({ sourceCode: source, entryFunction: 'first', input: [["a", "b"]] }))
      .toThrowError('JAVA_RUNTIME_TYPE_ERROR');
  });

  it('rejects_out_of_range_index_safely', () => {
    const source = `
      public class Main {
        public static int out(int[] arr) {
          return arr[5];
        }
      }
    `;
    const interpreter = new JavaInterpreter();
    expect(() => interpreter.run({ sourceCode: source, entryFunction: 'out', input: [[1, 2]] }))
      .toThrowError('JAVA_RUNTIME_LIMIT_EXCEEDED');
  });
  describe('Recursion', () => {
    it('A) runs_factorial_recursion', () => {
      const source = `
        public class Main {
          public static int factorial(int n) {
            if (n <= 1) {
              return 1;
            }
            return n * factorial(n - 1);
          }
        }
      `;
      const interpreter = new JavaInterpreter();
      const result = interpreter.run({ sourceCode: source, entryFunction: 'factorial', input: [4] });
      expect(result.returnedValue).toBe(24);
    });

    it('B) runs_sum_to_n_recursion', () => {
      const source = `
        public class Main {
          public static int sumToN(int n) {
            if (n <= 0) {
              return 0;
            }
            return n + sumToN(n - 1);
          }
        }
      `;
      const interpreter = new JavaInterpreter();
      const result = interpreter.run({ sourceCode: source, entryFunction: 'sumToN', input: [4] });
      expect(result.returnedValue).toBe(10);
    });

    it('D) recursive_scopes_are_isolated', () => {
      const source = `
        public class Main {
          public static int countdown(int n) {
            int value = n;
            if (n <= 0) {
              return value;
            }
            return countdown(n - 1);
          }
        }
      `;
      const interpreter = new JavaInterpreter();
      const result = interpreter.run({ sourceCode: source, entryFunction: 'countdown', input: [3] });
      expect(result.returnedValue).toBe(0);
    });

    it('E) enforces_max_call_depth', () => {
      const source = `
        public class Main {
          public static int forever(int n) {
            return forever(n + 1);
          }
        }
      `;
      const interpreter = new JavaInterpreter();
      expect(() => interpreter.run({ sourceCode: source, entryFunction: 'forever', input: [0] }))
        .toThrowError('JAVA_MAX_CALL_DEPTH_EXCEEDED');
    });

    it('F) rejects_helper_method_call', () => {
      const source = `
        public class Main {
          public static int helper(int n) {
            return n + 1;
          }
          public static int main(int n) {
            return helper(n);
          }
        }
      `;
      const interpreter = new JavaInterpreter();
      expect(() => interpreter.run({ sourceCode: source, entryFunction: 'main', input: [0] }))
        .toThrowError('JAVA_METHOD_CALL_UNSUPPORTED');
    });

    it('G) records_recursion_steps', () => {
      const source = `
        public class Main {
          public static int fact(int n) {
            if (n <= 1) {
              return 1;
            }
            return n * fact(n - 1);
          }
        }
      `;
      const interpreter = new JavaInterpreter();
      const result = interpreter.run({ sourceCode: source, entryFunction: 'fact', input: [2] });
      const types = result.steps.map(s => s.type);
      expect(types.filter(t => t === 'function_call').length).toBe(2);
      expect(types.filter(t => t === 'return').length).toBe(2);
    });
  });
});
