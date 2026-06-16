import type { FunctionDeclaration } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { TRACE_LIMITS } from '../../config/traceLimits.js';
import { interpretBlock } from './interpretBlock.js';
import { formatRuntimeValue } from '../utils/formatRuntimeValue.js';
import { getNodeLine } from './getNodeLine.js';
import { getLineNumber, getColumnNumber } from '../../utils/sourceLocation.js';

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

  env.pushFrame({
    functionName: fnName,
    variables: {},
    line: getNodeLine(targetFn),
  });

  // Bind parameters
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
      env.defineVariable(paramName, paramValue);
    }
  }

  env.recorder.record({
    line: getNodeLine(targetFn),
    lineNumber: getLineNumber(targetFn),
    columnNumber: getColumnNumber(targetFn),
    type: 'function_call',
    description: `Function ${fnName} was called.`,
  });

  if (targetFn.body.type !== 'BlockStatement') {
    throw new TraceInterpreterError(
      `Function body must be a BlockStatement in function "${fnName}".`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  // Save the parent's current status so the child's 'returned' status
  // does not leak back and cause the parent's interpretBlock to exit early.
  const savedStatus = env.state.status;

  try {
    const returnedValue = interpretBlock(targetFn.body, env, fnName);

    env.recorder.record({
      line: null,
      lineNumber: getLineNumber(targetFn),
      columnNumber: getColumnNumber(targetFn),
      type: 'return',
      description: `Function ${fnName} returned ${formatRuntimeValue(returnedValue as RuntimeValue)}.`,
    });

    // Restore the parent frame's status so its block can keep executing.
    // The actual return value is propagated through the call expression result.
    env.state.status = savedStatus;
    env.state.returnedValue = returnedValue;

    return returnedValue;
  } finally {
    env.popFrame();
  }
}


