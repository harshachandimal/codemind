import { RuntimeValue, InterpreterState } from '../../types/interpreter';
import { PythonFunctionDefinition } from '../parser/parseFunctions';
import { createPythonError } from '../errors/createPythonError';
import { PYTHON_ERROR_CODES } from '../errors/pythonErrors';

export function createPythonRuntimeState(
  functions: PythonFunctionDefinition[],
  entryFunctionName: string,
  inputArgs: unknown[]
): InterpreterState {
  const entryDef = functions.find(f => f.name === entryFunctionName);
  if (!entryDef) {
    throw createPythonError(`Entry function not found.`, PYTHON_ERROR_CODES.ENTRY_FUNCTION_NOT_FOUND);
  }

  const variables: Record<string, RuntimeValue> = {};

  function sanitizeInput(rawVal: unknown): RuntimeValue {
    if (typeof rawVal === 'number' || typeof rawVal === 'string' || typeof rawVal === 'boolean' || rawVal === null) {
      return rawVal;
    }
    if (Array.isArray(rawVal)) {
      if (rawVal.length > 1000) { 
        throw createPythonError(`Array length exceeds maximum`, PYTHON_ERROR_CODES.UNSUPPORTED_STATEMENT);
      }
      return rawVal.map(sanitizeInput);
    }
    throw createPythonError(`Unsupported input type for param`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
  }

  for (let i = 0; i < entryDef.params.length; i++) {
    const pName = entryDef.params[i]!;
    const rawVal = inputArgs[i];
    variables[pName] = sanitizeInput(rawVal);
  }

  return {
    status: 'running',
    stepCount: 0,
    variables,
    callStack: [{ functionName: entryDef.name, variables, line: null }],
    returnedValue: undefined,
    loopDepth: 0
  };
}
