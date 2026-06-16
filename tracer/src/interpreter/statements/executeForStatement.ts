import type { ForStatement, BlockStatement, VariableDeclaration } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { TRACE_LIMITS } from '../../config/traceLimits.js';
import { executeVariableDeclaration } from './executeVariableDeclaration.js';
import { executeAssignmentExpression } from './executeAssignmentExpression.js';
import { evaluateExpression } from '../expressions/evaluateExpression.js';
import { interpretBlock } from '../core/interpretBlock.js';
import { getNodeLine } from '../core/getNodeLine.js';
import { getLineNumber, getColumnNumber } from '../../utils/sourceLocation.js';
import { executeUpdateExpression } from './executeUpdateExpression.js';
import { assertLoopDepthAvailable } from '../assertLoopDepth.js';

export function executeForStatement(
  node: ForStatement,
  env: InterpreterEnvironment,
  fnName: string,
): RuntimeValue | undefined {
  if (node.body.type !== 'BlockStatement') {
    throw new TraceInterpreterError(
      `For-loop body must be a BlockStatement in function "${fnName}".`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  // ── Depth guard ──────────────────────────────────────────────────────────
  assertLoopDepthAvailable(env.state);
  env.state.loopDepth++;

  let iterationCount = 0;

  try {
    // 1. Initialization
    if (node.init) {
      if (node.init.type === 'VariableDeclaration') {
        executeVariableDeclaration(node.init as VariableDeclaration, env, fnName);
      } else if (node.init.type === 'AssignmentExpression') {
        executeAssignmentExpression(node.init as any, env, fnName);
      } else {
        throw new TraceInterpreterError(
          `Unsupported for-loop initialization in function "${fnName}".`,
          'UNSUPPORTED_STATEMENT',
        );
      }
    }

    const depth = env.state.loopDepth;

    env.recorder.record({
      line: getNodeLine(node),
      lineNumber: getLineNumber(node),
      columnNumber: getColumnNumber(node),
      type: 'loop_start',
      description: `For loop started at depth ${depth}.`,
    });

    // 2. Loop Execution
    for (;;) {
      if (iterationCount >= TRACE_LIMITS.maxLoopIterations) {
        throw new TraceInterpreterError(
          `Max loop iterations (${TRACE_LIMITS.maxLoopIterations}) exceeded in function "${fnName}".`,
          'MAX_LOOP_ITERATIONS_EXCEEDED',
        );
      }

      if (node.test) {
        const testValue = evaluateExpression(node.test, env, fnName);
        if (!testValue) {
          break;
        }
      }

      iterationCount++;
      env.recorder.record({
        line: getNodeLine(node),
        lineNumber: getLineNumber(node),
        columnNumber: getColumnNumber(node),
        type: 'loop_iteration',
        description: `For loop iteration ${iterationCount} started at depth ${depth}.`,
      });

      const bodyResult = interpretBlock(node.body as BlockStatement, env, fnName);

      if (env.state.status === 'returned') {
        return bodyResult;
      }

      if (node.update) {
        if (node.update.type === 'UpdateExpression') {
          executeUpdateExpression(node.update as any, env, fnName);
        } else if (node.update.type === 'AssignmentExpression') {
          executeAssignmentExpression(node.update as any, env, fnName);
        } else {
          throw new TraceInterpreterError(
            `Unsupported for-loop update expression in function "${fnName}".`,
            'UNSUPPORTED_STATEMENT',
          );
        }
      }
    }

    env.recorder.record({
      line: getNodeLine(node),
      lineNumber: getLineNumber(node),
      columnNumber: getColumnNumber(node),
      type: 'loop_exit',
      description: `For loop exited after ${iterationCount} iteration(s) at depth ${depth}.`,
    });

    return undefined;
  } finally {
    // Always restore depth, even if a return/error bubbles out of the loop.
    env.state.loopDepth--;
  }
}
