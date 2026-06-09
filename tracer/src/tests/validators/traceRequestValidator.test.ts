import { describe, it, expect } from 'vitest';
import { validateTraceRequest } from '../../validators/traceRequestValidator.js';
import { TraceValidationError } from '../../errors/TraceValidationError.js';
import { TRACE_LIMITS } from '../../config/traceLimits.js';

describe('traceRequestValidator', () => {
  it('accepts_valid_javascript_trace_request', () => {
    const validRequest = {
      language: 'javascript',
      sourceCode: 'function add(a, b) { return a + b; }',
      entryFunction: 'add',
      input: [1, 2]
    };

    const result = validateTraceRequest(validRequest);
    expect(result.language).toBe('javascript');
    expect(result.sourceCode).toBe(validRequest.sourceCode);
    expect(result.entryFunction).toBe('add');
    expect(result.input).toEqual([1, 2]);
  });

  it('rejects_non_object_request', () => {
    expect(() => validateTraceRequest(null)).toThrow(TraceValidationError);
    expect(() => validateTraceRequest('string')).toThrow(TraceValidationError);
  });

  it('rejects_unsupported_language', () => {
    const invalidRequest = {
      language: 'python',
      sourceCode: 'print("hi")'
    };

    try {
      validateTraceRequest(invalidRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(TraceValidationError);
      expect((e as TraceValidationError).details).toHaveProperty('language');
    }
  });

  it('rejects_empty_source_code', () => {
    const invalidRequest = {
      language: 'javascript',
      sourceCode: '   '
    };

    try {
      validateTraceRequest(invalidRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(TraceValidationError);
      expect((e as TraceValidationError).details).toHaveProperty('sourceCode');
    }
  });

  it('rejects_too_large_source_code', () => {
    const invalidRequest = {
      language: 'javascript',
      sourceCode: 'a'.repeat(TRACE_LIMITS.maxSourceLength + 1)
    };

    try {
      validateTraceRequest(invalidRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(TraceValidationError);
      expect((e as TraceValidationError).details).toHaveProperty('sourceCode');
    }
  });

  it('rejects_invalid_entry_function_name', () => {
    const invalidRequest1 = {
      language: 'javascript',
      sourceCode: 'function bad() {}',
      entryFunction: 'bad.name'
    };

    try {
      validateTraceRequest(invalidRequest1);
    } catch (e) {
      expect(e).toBeInstanceOf(TraceValidationError);
      expect((e as TraceValidationError).details).toHaveProperty('entryFunction');
    }

    const invalidRequest2 = {
      language: 'javascript',
      sourceCode: 'function bad() {}',
      entryFunction: 'alert(1)'
    };

    try {
      validateTraceRequest(invalidRequest2);
    } catch (e) {
      expect(e).toBeInstanceOf(TraceValidationError);
      expect((e as TraceValidationError).details).toHaveProperty('entryFunction');
    }
  });

  it('rejects_too_many_input_values', () => {
    const invalidRequest = {
      language: 'javascript',
      sourceCode: 'function add() {}',
      input: new Array(11).fill(1)
    };

    try {
      validateTraceRequest(invalidRequest);
    } catch (e) {
      expect(e).toBeInstanceOf(TraceValidationError);
      expect((e as TraceValidationError).details).toHaveProperty('input');
    }
  });
});
