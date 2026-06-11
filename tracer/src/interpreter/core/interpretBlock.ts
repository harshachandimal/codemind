import type { BlockStatement } from '@babel/types';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { interpretStatement } from '../statements/interpretStatement.js';

export function interpretBlock(
  block: BlockStatement,
  env: InterpreterEnvironment,
  fnName: string,
): RuntimeValue | undefined {
  for (const stmt of block.body) {
    const result = interpretStatement(stmt, env, fnName);

    if (env.state.status === 'returned') {
      return result;
    }
  }

  return undefined;
}
