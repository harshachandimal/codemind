import type { UpdateExpression, Identifier } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import { getNodeLine } from '../core/getNodeLine.js';

export function executeUpdateExpression(
  node: UpdateExpression,
  env: InterpreterEnvironment,
  fnName: string,
): void {
  if (!node.prefix === false) {
    throw new TraceInterpreterError(
      `Prefix update expressions are not supported.`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  if (node.argument.type !== 'Identifier') {
    throw new TraceInterpreterError(
      `Update expressions on non-identifiers are not supported.`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  const varName = (node.argument as Identifier).name;
  const currentValue = env.getVariable(varName);

  if (typeof currentValue !== 'number') {
    throw new TraceInterpreterError(
      `Update expressions require a numeric variable. "${varName}" is not a number.`,
      'TYPE_ERROR',
    );
  }

  let newValue: number;
  if (node.operator === '++') {
    newValue = currentValue + 1;
  } else if (node.operator === '--') {
    newValue = currentValue - 1;
  } else {
    throw new TraceInterpreterError(
      `Unsupported update operator "${node.operator}".`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  env.assignVariable(varName, newValue);

  env.recorder.record({
    line: getNodeLine(node),
    type: 'assignment',
    description: `Variable ${varName} was assigned value ${newValue}.`,
  });
}


