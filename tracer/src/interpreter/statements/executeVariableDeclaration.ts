import type { VariableDeclaration } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { evaluateExpression } from '../expressions/evaluateExpression.js';
import { formatRuntimeValue } from '../utils/formatRuntimeValue.js';
import { getNodeLine } from '../core/getNodeLine.js';

export function executeVariableDeclaration(
  node: VariableDeclaration,
  env: InterpreterEnvironment,
  fnName: string,
): void {
  if (node.kind === 'var') {
    throw new TraceInterpreterError(
      `"var" declarations are not supported. Use "let" or "const".`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  for (const decl of node.declarations) {
    if (decl.id.type !== 'Identifier') {
      throw new TraceInterpreterError(
        `Destructuring in variable declarations is not supported.`,
        'UNSUPPORTED_STATEMENT',
      );
    }

    if (!decl.init) {
      throw new TraceInterpreterError(
        `Variable declarations must have an initializer.`,
        'UNSUPPORTED_STATEMENT',
      );
    }

    const varName = decl.id.name;
    const initialValue = evaluateExpression(decl.init, env, fnName);

    env.defineVariable(varName, initialValue);

    env.recorder.record({
      line: getNodeLine(decl),
      type: 'variable_declaration',
      description: `Variable ${varName} was declared with value ${formatRuntimeValue(initialValue)}.`,
    });
  }
}


