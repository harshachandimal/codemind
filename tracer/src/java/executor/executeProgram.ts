import { JavaStatement } from '../parser/parseStatements';
import { JavaEnvironment } from '../runtime/javaEnvironment';
import { executeStatement } from './executeStatement';

export function executeProgram(statements: JavaStatement[], env: JavaEnvironment) {
  for (const stmt of statements) {
    executeStatement(stmt, env);
    if (env.hasReturned) {
      break;
    }
  }
}
