import type { IfStatement } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { evaluateExpression } from '../expressions/evaluateExpression.js';
import { describeCondition } from '../utils/describeCondition.js';
import { interpretBlock } from '../core/interpretBlock.js';
import { getNodeLine } from '../core/getNodeLine.js';

export function executeIfStatement(
  node: IfStatement,
  env: InterpreterEnvironment,
  fnName: string,
): RuntimeValue | undefined {
  const testValue = evaluateExpression(node.test, env, fnName);
  
  if (typeof testValue !== 'boolean') {
    throw new TraceInterpreterError(
      `If statement condition must evaluate to a boolean in function "${fnName}".`,
      'TYPE_ERROR',
    );
  }

  env.recorder.record({
    line: getNodeLine(node),
    type: 'condition',
    description: `Condition ${describeCondition(node.test)} evaluated to ${testValue}.`,
  });

  if (testValue) {
    env.recorder.record({
      line: getNodeLine(node.consequent),
      type: 'branch',
      description: 'Entered if branch.',
    });

    if (node.consequent.type !== 'BlockStatement') {
      throw new TraceInterpreterError(
        `If statement consequent must be a BlockStatement in function "${fnName}".`,
        'UNSUPPORTED_STATEMENT',
      );
    }

    return interpretBlock(node.consequent, env, fnName);
  } else if (node.alternate) {
    if (node.alternate.type === 'BlockStatement') {
      env.recorder.record({
        line: getNodeLine(node.alternate),
        type: 'branch',
        description: 'Entered else branch.',
      });
      return interpretBlock(node.alternate, env, fnName);
    } else if (node.alternate.type === 'IfStatement') {
      env.recorder.record({
        line: getNodeLine(node.alternate),
        type: 'branch',
        description: 'Entered else-if branch.',
      });
      return executeIfStatement(node.alternate, env, fnName);
    } else {
      throw new TraceInterpreterError(
        `If statement alternate must be a BlockStatement or IfStatement in function "${fnName}".`,
        'UNSUPPORTED_STATEMENT',
      );
    }
  } else {
    env.recorder.record({
      line: getNodeLine(node),
      type: 'branch',
      description: 'Skipped if branch.',
    });
    return undefined;
  }
}


