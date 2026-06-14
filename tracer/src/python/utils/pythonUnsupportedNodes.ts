import { TraceInterpreterError } from '../../errors/TraceInterpreterError';

export type PythonUnsupportedSyntaxViolation = {
  code: string;
  message: string;
  syntax?: string;
};

export function validatePythonSupportedSyntax(params: {
  sourceCode: string;
  entryFunction?: string | null;
}): PythonUnsupportedSyntaxViolation[] {
  const { sourceCode, entryFunction } = params;
  const violations: PythonUnsupportedSyntaxViolation[] = [];

  const addViolation = (code: string, message: string, syntax?: string) => {
    violations.push({ code, message, syntax });
  };

  if (/^\s*(?:import|from)\b/m.test(sourceCode)) {
    addViolation('PYTHON_IMPORT_UNSUPPORTED', 'Python imports are not supported in runtime tracing.');
  }

  if (/^\s*class\b/m.test(sourceCode)) {
    addViolation('PYTHON_CLASS_UNSUPPORTED', 'Python classes are not supported in runtime tracing.');
  }

  if (/^\s*@/m.test(sourceCode)) {
    addViolation('PYTHON_DECORATOR_UNSUPPORTED', 'Python decorators are not supported in runtime tracing.');
  }

  if (/^\s*(?:try|except|finally)\b/m.test(sourceCode)) {
    addViolation('PYTHON_EXCEPTION_UNSUPPORTED', 'Python exception handling is not supported in runtime tracing.');
  }

  if (/^\s*raise\b/m.test(sourceCode)) {
    addViolation('PYTHON_RAISE_UNSUPPORTED', 'Python raise statements are not supported in runtime tracing.');
  }

  if (/^\s*with\b/m.test(sourceCode)) {
    addViolation('PYTHON_WITH_UNSUPPORTED', 'Python with statements are not supported in runtime tracing.');
  }

  if (/\b(?:async\s+def|await)\b/.test(sourceCode)) {
    addViolation('PYTHON_ASYNC_UNSUPPORTED', 'Python async/await is not supported in runtime tracing.');
  }

  if (/\byield\b/.test(sourceCode)) {
    addViolation('PYTHON_YIELD_UNSUPPORTED', 'Python yield is not supported in runtime tracing.');
  }

  if (/\blambda\b/.test(sourceCode)) {
    addViolation('PYTHON_LAMBDA_UNSUPPORTED', 'Python lambdas are not supported in runtime tracing.');
  }

  if (/^\s*global\b/m.test(sourceCode)) {
    addViolation('PYTHON_GLOBAL_UNSUPPORTED', 'Python global keyword is not supported in runtime tracing.');
  }

  if (/^\s*nonlocal\b/m.test(sourceCode)) {
    addViolation('PYTHON_NONLOCAL_UNSUPPORTED', 'Python nonlocal keyword is not supported in runtime tracing.');
  }

  if (/\[[^\]]+\bfor\b[^\]]+\]/.test(sourceCode) || /\{[^\}]+\bfor\b[^\}]+\}/.test(sourceCode)) {
    addViolation('PYTHON_COMPREHENSION_UNSUPPORTED', 'Python comprehensions are not supported in runtime tracing.');
  }

  if (/\b(open|eval|exec|input|print|globals|locals|vars|dir|__import__)\s*\(/.test(sourceCode)) {
    addViolation('PYTHON_BUILTIN_UNSUPPORTED', 'Unsupported Python built-in function used.');
  }

  if (/\b[A-Za-z_][A-Za-z0-9_]*\s*\.\s*[A-Za-z_][A-Za-z0-9_]*\s*\(/.test(sourceCode)) {
    addViolation('PYTHON_METHOD_CALL_UNSUPPORTED', 'Python method calls are not supported in runtime tracing.');
  }

  if (/__[A-Za-z0-9_]+__/.test(sourceCode)) {
    addViolation('PYTHON_DUNDER_UNSUPPORTED', 'Python dunder attributes are not supported in runtime tracing.');
  }

  // Extract function definitions to allow self-calls
  const definedFunctions = new Set<string>();
  const defRegex = /\bdef\s+([A-Za-z_][A-Za-z0-9_]*)\b/g;
  let match;
  while ((match = defRegex.exec(sourceCode)) !== null) {
    if (match[1]) {
      definedFunctions.add(match[1]);
    }
  }

  // Check function calls
  const callRegex = /\b([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
  const allowedCalls = new Set(['range', 'len', 'if', 'for', 'while', 'return', 'def', 'elif']);
  if (entryFunction) {
    allowedCalls.add(entryFunction);
  }

  while ((match = callRegex.exec(sourceCode)) !== null) {
    const callName = match[1];
    
    // Check if this match is actually part of a function definition
    const prefix = sourceCode.substring(Math.max(0, match.index - 4), match.index);
    if (prefix.match(/\bdef\s+$/)) {
      continue;
    }

    if (callName && !allowedCalls.has(callName)) {
      addViolation('PYTHON_FUNCTION_CALL_UNSUPPORTED', `Unsupported function call: ${callName}`);
    }
  }

  return violations;
}

export function assertPythonSupportedSyntax(params: {
  sourceCode: string;
  entryFunction?: string | null;
}): void {
  const violations = validatePythonSupportedSyntax(params);
  if (violations.length > 0) {
    throw new TraceInterpreterError(
      'Python code contains unsupported syntax for runtime tracing.',
      'PYTHON_UNSUPPORTED_SYNTAX'
    );
  }
}
