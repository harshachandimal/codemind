import type { FunctionDeclaration } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { TRACE_LIMITS } from '../../config/traceLimits.js';
import { interpretBlock } from './interpretBlock.js';
import { formatRuntimeValue } from '../utils/formatRuntimeValue.js';
import { getNodeLine } from './getNodeLine.js';

export function executeFunctionCall(
  targetFn: FunctionDeclaration,
  env: InterpreterEnvironment,
  args: RuntimeValue[],
): RuntimeValue | undefined {
  const fnName = targetFn.id?.name ?? '(anonymous)';

  if (env.state.callStack.length >= TRACE_LIMITS.maxCallDepth) {
    throw new TraceInterpreterError(
      `Maximum call stack size exceeded (${TRACE_LIMITS.maxCallDepth}).`,
      'MAX_CALL_DEPTH_EXCEEDED',
    );
  }

  // Bind parameters
  const initialVariables: Record<string, RuntimeValue> = {};
  for (let i = 0; i < targetFn.params.length; i++) {
    const param = targetFn.params[i];
    if (param && param.type !== 'Identifier') {
      throw new TraceInterpreterError(
        `Unsupported parameter type "${param.type}" in function "${fnName}".`,
        'UNSUPPORTED_STATEMENT',
      );
    }
    if (param) {
      const paramName = (param as any).name;
      const paramValue = i < args.length ? args[i]! : undefined as unknown as RuntimeValue;
      initialVariables[paramName] = paramValue;
      env.defineVariable(paramName, paramValue);
    }
  }

  env.pushFrame({
    functionName: fnName,
    variables: initialVariables,
    line: getNodeLine(targetFn),
  });

  env.recorder.record({
    line: getNodeLine(targetFn),
    type: 'function_call',
    description: `Function ${fnName} was called.`,
  });

  if (targetFn.body.type !== 'BlockStatement') {
    throw new TraceInterpreterError(
      `Function body must be a BlockStatement in function "${fnName}".`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  const returnedValue = interpretBlock(targetFn.body, env, fnName);

  env.recorder.record({
    line: null,
    type: 'return',
    description: `Function ${fnName} returned ${formatRuntimeValue(returnedValue as RuntimeValue)}.`,
  });

  env.state.returnedValue = returnedValue;
  env.state.status = 'completed';
  env.popFrame();

  return returnedValue;
}


