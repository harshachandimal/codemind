import { PythonFunctionDefinition } from '../parser/parseFunctions';
import { PythonRuntimeValue } from '../runtime/pythonRuntimeValues';
import { InterpreterState } from '../../types/interpreter';
import { StepRecorder } from '../../interpreter/StepRecorder';
import { createPythonError } from '../errors/createPythonError';
import { PYTHON_ERROR_CODES } from '../errors/pythonErrors';
import { assertPythonCallDepthAvailable } from '../guards/pythonCallDepthGuard';
import { executeBlock } from './executeBlock';

export function executeFunctionCall(
  funcName: string,
  args: PythonRuntimeValue[],
  functions: PythonFunctionDefinition[],
  entryDef: PythonFunctionDefinition,
  state: InterpreterState,
  recorder: StepRecorder
): PythonRuntimeValue {
  const funcDef = functions.find((f: any) => f.name === funcName);
  if (!funcDef) {
    throw createPythonError(`Function not found: ${funcName}`, PYTHON_ERROR_CODES.UNSUPPORTED_EXPRESSION);
  }
  if (funcName !== entryDef.name) {
    throw createPythonError(`Calling other functions is not supported: ${funcName}`, PYTHON_ERROR_CODES.UNSUPPORTED_EXPRESSION);
  }

  assertPythonCallDepthAvailable(state.callStack.length);

  const localVariables: Record<string, PythonRuntimeValue> = {};
  for (let i = 0; i < funcDef.params.length; i++) {
    const pName = funcDef.params[i]!;
    localVariables[pName] = (args[i] ?? null) as PythonRuntimeValue;
  }

  const isRecursion = state.callStack.length > 0;
  state.callStack.push({ functionName: funcName, variables: localVariables, line: null });

  if (isRecursion) {
    recorder.record({
      line: funcDef.startLine,
      type: 'function_call',
      description: `Recursive call ${funcName}`
    });
  }

  let retVal: PythonRuntimeValue = null;
  try {
    const onFunctionCall = (params: { functionName: string; args: PythonRuntimeValue[] }) => {
      return executeFunctionCall(params.functionName, params.args, functions, entryDef, state, recorder);
    };
    
    const result = executeBlock(funcDef.body, localVariables, recorder, onFunctionCall, state);
    if (result.type === 'return') {
      retVal = result.value;
    }
  } finally {
    state.callStack.pop();
    if (isRecursion) {
      recorder.record({
        line: funcDef.startLine,
        type: 'return',
        description: `Returning from ${funcName} with ${JSON.stringify(retVal)}`
      });
    }
  }
  return retVal;
}
