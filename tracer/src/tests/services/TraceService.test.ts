import { describe, it, expect, afterEach } from 'vitest';
import { TraceService } from '../../services/TraceService.js';

describe('TraceService', () => {
  const service = new TraceService();

  it('default_valid_request_returns_planned_mode', () => {
    const validRequest = {
      language: 'javascript',
      sourceCode: 'function add(a, b) { return a + b; }',
      entryFunction: 'add',
      input: [1, 2],
    };

    const result = service.trace(validRequest);

    expect(result.success).toBe(false);
    expect(result.mode).toBe('planned');
    expect(result.executionEnabled).toBe(false);
    expect(result.plan).not.toBeNull();
    expect(result.result).toBeNull();
    expect(result.error).toBeNull();
    expect(result.metadata.language).toBe('javascript');
    expect((result as any).sourceCode).toBeUndefined();
    expect(result.trace.steps).toEqual([]);
    expect(result.trace.summary.terminatedReason).toBe('not_executed');
  });

  it('invalid_language_returns_error_contract', () => {
    const invalidRequest = {
      language: 'ruby',
      sourceCode: 'puts "hi"',
    };

    const result = service.trace(invalidRequest);

    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
    expect(result.error?.code).toBe('VALIDATION_ERROR');
    expect(result.error?.message).toContain('Invalid trace request');
    expect(JSON.stringify(result)).not.toContain('System.out.println'); // No source code
  });

  it('unsupported_syntax_returns_error_contract', () => {
    const badSyntaxRequest = {
      language: 'javascript',
      sourceCode: 'class User {}',
      entryFunction: 'User',
    };

    const result = service.trace(badSyntaxRequest);

    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
    expect(result.error?.code).toBe('UNSUPPORTED_SYNTAX');
    expect(JSON.stringify(result)).not.toContain('class User');
  });

  it('preflight_blocked_code_returns_error_contract', () => {
    const dangerousRequest = {
      language: 'javascript',
      sourceCode: "function bad() { eval('2 + 2'); }",
      entryFunction: 'bad',
    };

    const result = service.trace(dangerousRequest);

    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
    expect(result.error?.code).toBe('SAFETY_ERROR');
    expect(result.error?.message).toContain('safety preflight');
  });
  const originalExecutionFlag = process.env.TRACER_EXECUTION_ENABLED;
  const originalPythonFlag = process.env.PYTHON_TRACER_ENABLED;

  afterEach(() => {
    if (originalExecutionFlag !== undefined) {
      process.env.TRACER_EXECUTION_ENABLED = originalExecutionFlag;
    } else {
      delete process.env.TRACER_EXECUTION_ENABLED;
    }
    if (originalPythonFlag !== undefined) {
      process.env.PYTHON_TRACER_ENABLED = originalPythonFlag;
    } else {
      delete process.env.PYTHON_TRACER_ENABLED;
    }
  });

  it('python_trace_returns_planned_when_global_execution_disabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'false';
    process.env.PYTHON_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'python',
      sourceCode: 'def add(a, b):\n  return a + b',
      entryFunction: 'add',
      input: [2, 3]
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(false);
    expect(result.mode).toBe('planned');
    expect(result.executionEnabled).toBe(false);
    expect(result.trace.steps).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('def add');
  });

  it('python_trace_returns_planned_when_python_flag_disabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.PYTHON_TRACER_ENABLED = 'false';
    
    const request = {
      language: 'python',
      sourceCode: 'def add(a, b):\n  return a + b',
      entryFunction: 'add',
      input: [2, 3]
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(false);
    expect(result.mode).toBe('planned');
    expect(result.message).toContain('Python runtime tracing is not enabled yet');
  });

  it('python_trace_executes_when_both_flags_enabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.PYTHON_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'python',
      sourceCode: 'def add(a, b):\n    result = a + b\n    return result',
      entryFunction: 'add',
      input: [2, 3]
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(true);
    expect(result.mode).toBe('executed');
    expect(result.executionEnabled).toBe(true);
    expect(result.result?.returnedValue).toBe(5);
    expect(result.trace.steps.map(s => s.type)).toContain('function_call');
    expect(result.trace.steps.map(s => s.type)).toContain('assignment');
    expect(result.trace.steps.map(s => s.type)).toContain('return');
  });

  it('python_trace_factorial_executes_when_enabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.PYTHON_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'python',
      sourceCode: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)',
      entryFunction: 'factorial',
      input: [4]
    };
    const result = service.trace(request);
    
    expect(result.result?.returnedValue).toBe(24);
    expect(result.trace.steps.length).toBeGreaterThan(5);
  });

  it('python_trace_sum_list_executes_when_enabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.PYTHON_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'python',
      sourceCode: 'def sum_list(arr):\n    total = 0\n    for i in range(len(arr)):\n        total += arr[i]\n    return total',
      entryFunction: 'sum_list',
      input: [[1, 2, 3, 4]]
    };
    const result = service.trace(request);
    
    expect(result.result?.returnedValue).toBe(10);
    expect(result.trace.steps.map(s => s.type)).toContain('loop_iteration');
    expect(result.trace.steps.map(s => s.type)).toContain('array_read');
  });

  it('python_trace_rejects_unsupported_import_safely', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.PYTHON_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'python',
      sourceCode: 'import os\ndef bad():\n    return 1',
      entryFunction: 'bad',
      input: []
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
    expect(result.error?.code).toBe('PYTHON_UNSUPPORTED_SYNTAX');
    expect(JSON.stringify(result)).not.toContain('import os');
    expect(JSON.stringify(result)).not.toContain('stack');
  });

  it('python_trace_enforces_max_call_depth', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.PYTHON_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'python',
      sourceCode: 'def forever(n):\n    return forever(n + 1)',
      entryFunction: 'forever',
      input: [0]
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
    expect(result.error?.message).toContain('Maximum Python call depth exceeded');
  });

  const originalJavaFlag = process.env.JAVA_TRACER_ENABLED;

  afterEach(() => {
    if (originalJavaFlag !== undefined) {
      process.env.JAVA_TRACER_ENABLED = originalJavaFlag;
    } else {
      delete process.env.JAVA_TRACER_ENABLED;
    }
  });

  it('java_trace_returns_planned_when_global_execution_disabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'false';
    process.env.JAVA_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'java',
      sourceCode: 'public class Main { public static int add(int a, int b) { int result = a + b; return result; } }',
      entryFunction: 'add',
      input: [2, 3]
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(false);
    expect(result.mode).toBe('planned');
    expect(result.executionEnabled).toBe(false);
    expect(result.trace.steps).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('public static int add');
  });

  it('java_trace_returns_planned_when_java_flag_disabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.JAVA_TRACER_ENABLED = 'false';
    
    const request = {
      language: 'java',
      sourceCode: 'public class Main { public static int add(int a, int b) { int result = a + b; return result; } }',
      entryFunction: 'add',
      input: [2, 3]
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(false);
    expect(result.mode).toBe('planned');
    expect(result.message).toContain('Java runtime tracing is not enabled yet');
  });

  it('java_trace_executes_when_both_flags_enabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.JAVA_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'java',
      sourceCode: 'public class Main { public static int add(int a, int b) { int result = a + b; return result; } }',
      entryFunction: 'add',
      input: [2, 3]
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(true);
    expect(result.mode).toBe('executed');
    expect(result.executionEnabled).toBe(true);
    expect(result.result?.returnedValue).toBe(5);
    expect(result.trace.steps.map(s => s.type)).toContain('function_call');
    expect(result.trace.steps.map(s => s.type)).toContain('variable_declaration');
    expect(result.trace.steps.map(s => s.type)).toContain('return');
  });

  it('java_trace_factorial_executes_when_enabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.JAVA_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'java',
      sourceCode: 'public class Main { public static int factorial(int n) { if (n <= 1) { return 1; } return n * factorial(n - 1); } }',
      entryFunction: 'factorial',
      input: [4]
    };
    const result = service.trace(request);
    
    expect(result.result?.returnedValue).toBe(24);
    expect(result.trace.steps.length).toBeGreaterThan(5);
  });

  it('java_trace_sum_array_executes_when_enabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.JAVA_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'java',
      sourceCode: 'public class Main { public static int sumArray(int[] arr) { int total = 0; for (int i = 0; i < arr.length; i++) { total += arr[i]; } return total; } }',
      entryFunction: 'sumArray',
      input: [[1, 2, 3, 4]]
    };
    const result = service.trace(request);
    
    expect(result.result?.returnedValue).toBe(10);
    expect(result.trace.steps.map(s => s.type)).toContain('loop_iteration');
  });

  it('java_trace_nested_loop_executes_when_enabled', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.JAVA_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'java',
      sourceCode: 'public class Main { public static int countPairs(int n) { int count = 0; for (int i = 0; i < n; i++) { for (int j = 0; j < n; j++) { count++; } } return count; } }',
      entryFunction: 'countPairs',
      input: [3]
    };
    const result = service.trace(request);
    
    expect(result.result?.returnedValue).toBe(9);
    expect(result.trace.steps.map(s => s.type)).toContain('loop_iteration');
  });

  it('java_trace_rejects_unsupported_import_safely', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.JAVA_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'java',
      sourceCode: 'import java.util.*;\npublic class Main { public static int bad() { return 1; } }',
      entryFunction: 'bad',
      input: []
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
    expect(JSON.stringify(result)).not.toContain('import java.util');
    expect(JSON.stringify(result)).not.toContain('stack');
  });

  it('java_trace_rejects_system_out_safely', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.JAVA_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'java',
      sourceCode: 'public class Main { public static int bad() { System.out.println("unsafe"); return 1; } }',
      entryFunction: 'bad',
      input: []
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
  });

  it('java_trace_enforces_max_call_depth', () => {
    process.env.TRACER_EXECUTION_ENABLED = 'true';
    process.env.JAVA_TRACER_ENABLED = 'true';
    
    const request = {
      language: 'java',
      sourceCode: 'public class Main { public static int forever(int n) { return forever(n + 1); } }',
      entryFunction: 'forever',
      input: [0]
    };
    const result = service.trace(request);
    
    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
    expect(result.error?.message).toContain('JAVA_MAX_CALL_DEPTH_EXCEEDED');
  });
});
