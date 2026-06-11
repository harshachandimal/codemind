import type { BinaryExpression, Node } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { evaluateExpression } from './evaluateExpression.js';

export function evaluateBinary(
  node: BinaryExpression,
  env: InterpreterEnvironment,
  fnName: string,
): RuntimeValue {
  const left = evaluateExpression(node.left as Node, env, fnName);
  const right = evaluateExpression(node.right as Node, env, fnName);

  switch (node.operator) {
    case '+':
      if (typeof left === 'number' && typeof right === 'number') {
        return left + right;
      }
      if (typeof left === 'string' && typeof right === 'string') {
        return left + right;
      }
      throw new TraceInterpreterError(
        `Operator "+" requires two numbers or two strings.`,
        'TYPE_ERROR',
      );

    case '-':
      if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
      }
      throw new TraceInterpreterError(
        `Operator "-" requires two numbers.`,
        'TYPE_ERROR',
      );

    case '*':
      if (typeof left === 'number' && typeof right === 'number') {
        return left * right;
      }
      throw new TraceInterpreterError(
        `Operator "*" requires two numbers.`,
        'TYPE_ERROR',
      );

    case '/':
      if (typeof left === 'number' && typeof right === 'number') {
        if (right === 0) {
          throw new TraceInterpreterError(
            `Division by zero.`,
            'DIVISION_BY_ZERO',
          );
        }
        return left / right;
      }
      throw new TraceInterpreterError(
        `Operator "/" requires two numbers.`,
        'TYPE_ERROR',
      );

    case '<':
      if (typeof left === 'number' && typeof right === 'number') return left < right;
      throw new TraceInterpreterError(`Operator "<" requires two numbers.`, 'TYPE_ERROR');

    case '<=':
      if (typeof left === 'number' && typeof right === 'number') return left <= right;
      throw new TraceInterpreterError(`Operator "<=" requires two numbers.`, 'TYPE_ERROR');

    case '>':
      if (typeof left === 'number' && typeof right === 'number') return left > right;
      throw new TraceInterpreterError(`Operator ">" requires two numbers.`, 'TYPE_ERROR');

    case '>=':
      if (typeof left === 'number' && typeof right === 'number') return left >= right;
      throw new TraceInterpreterError(`Operator ">=" requires two numbers.`, 'TYPE_ERROR');

    case '===':
      return left === right;

    case '!==':
      return left !== right;

    default:
      throw new TraceInterpreterError(
        `Unsupported binary operator "${node.operator}".`,
        'UNSUPPORTED_OPERATOR',
      );
  }
}


