import type { WhileStatement } from '@babel/types';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import { evaluateExpression } from '../expressions/evaluateExpression.js';
import { interpretBlock } from '../core/interpretBlock.js';
import { getNodeLine } from '../core/getNodeLine.js';
import { TRACE_LIMITS } from '../../config/traceLimits.js';
import { assertLoopDepthAvailable } from '../assertLoopDepth.js';

export function executeWhileStatement(
  stmt: WhileStatement,
  env: InterpreterEnvironment,
  fnName: string,
): RuntimeValue | undefined {
  if (stmt.body.type !== 'BlockStatement') {
    throw new TraceInterpreterError(
      `Unsupported while-loop body in function "${fnName}". Only block statements "{}" are supported.`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  // ── Depth guard ──────────────────────────────────────────────────────────
  assertLoopDepthAvailable(env.state);
  env.state.loopDepth++;

  const line = getNodeLine(stmt);
  let iterationCount = 0;

  try {
    const depth = env.state.loopDepth;

    env.recorder.record({
      line,
      type: 'loop_start',
      description: `While loop started at depth ${depth}.`,
    });

    while (true) {
      if (iterationCount >= TRACE_LIMITS.maxLoopIterations) {
        throw new TraceInterpreterError(
          `While loop exceeded maximum iterations (${TRACE_LIMITS.maxLoopIterations}) in function "${fnName}".`,
          'MAX_LOOP_ITERATIONS_EXCEEDED',
        );
      }

      const testValue = evaluateExpression(stmt.test, env, fnName);

      if (typeof testValue !== 'boolean') {
        throw new TraceInterpreterError(
          `While loop condition must evaluate to a boolean in function "${fnName}".`,
          'UNSUPPORTED_EXPRESSION',
        );
      }

      if (!testValue) {
        break;
      }

      iterationCount++;

      env.recorder.record({
        line,
        type: 'loop_iteration',
        description: `While loop iteration ${iterationCount} started at depth ${depth}.`,
      });

      const returnedValue = interpretBlock(stmt.body, env, fnName);

      if (env.state.status === 'returned') {
        return returnedValue;
      }
    }

    env.recorder.record({
      line,
      type: 'loop_exit',
      description: `While loop exited after ${iterationCount} iteration(s) at depth ${depth}.`,
    });

    return undefined;
  } finally {
    // Always restore depth, even if a return/error bubbles out of the loop.
    env.state.loopDepth--;
  }
}
