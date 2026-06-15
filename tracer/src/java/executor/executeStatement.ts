import { JavaStatement } from '../parser/parseStatements';
import { JavaEnvironment } from '../runtime/javaEnvironment';
import { executeVariableDeclaration } from './executeVariableDeclaration';
import { executeAssignment } from './executeAssignment';
import { executeReturnStatement } from './executeReturnStatement';
import { executeIfStatement } from './executeIfStatement';
import { executeWhileStatement } from './executeWhileStatement';
import { executeForStatement } from './executeForStatement';
import { executeAugmentedAssignment } from './executeAugmentedAssignment';
import { executeIncrement } from './executeIncrement';
import { assertNever } from '../utils/assertNever';

export function executeStatement(stmt: JavaStatement, env: JavaEnvironment) {
  if (stmt.type === 'variable_declaration') {
    executeVariableDeclaration(stmt, env);
  } else if (stmt.type === 'assignment') {
    executeAssignment(stmt, env);
  } else if (stmt.type === 'augmented_assignment') {
    executeAugmentedAssignment(stmt, env);
  } else if (stmt.type === 'increment') {
    executeIncrement(stmt, env);
  } else if (stmt.type === 'return') {
    executeReturnStatement(stmt, env);
  } else if (stmt.type === 'if') {
    executeIfStatement(stmt, env);
  } else if (stmt.type === 'while') {
    executeWhileStatement(stmt, env);
  } else if (stmt.type === 'for') {
    executeForStatement(stmt, env);
  } else {
    assertNever(stmt);
  }
}
