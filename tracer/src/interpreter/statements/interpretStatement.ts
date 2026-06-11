import type { Statement, ReturnStatement, VariableDeclaration, ExpressionStatement, ForStatement, IfStatement, AssignmentExpression, UpdateExpression } from '@babel/types';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import type { InterpreterEnvironment } from '../InterpreterEnvironment.js';
import type { RuntimeValue } from '../../types/interpreter.js';
import { executeVariableDeclaration } from './executeVariableDeclaration.js';
import { executeAssignmentExpression } from './executeAssignmentExpression.js';
import { executeUpdateExpression } from './executeUpdateExpression.js';
import { executeForStatement } from './executeForStatement.js';
import { executeIfStatement } from './executeIfStatement.js';
import { evaluateExpression } from '../expressions/evaluateExpression.js';
import { formatRuntimeValue } from '../utils/formatRuntimeValue.js';
import { getNodeLine } from '../core/getNodeLine.js';

export function interpretStatement(
  stmt: Statement,
  env: InterpreterEnvironment,
  fnName: string,
): RuntimeValue | undefined {
  if (stmt.type === 'ReturnStatement') {
    const retStmt = stmt as ReturnStatement;
    let retVal: RuntimeValue = undefined as unknown as RuntimeValue;
    if (retStmt.argument) {
      retVal = evaluateExpression(retStmt.argument, env, fnName);
    }
    env.recorder.record({
      line: getNodeLine(stmt),
      type: 'return',
      description: `Return expression evaluated to ${formatRuntimeValue(retVal)}.`,
    });
    env.state.status = 'returned';
    return retVal;
  }

  if (stmt.type === 'VariableDeclaration') {
    executeVariableDeclaration(stmt as VariableDeclaration, env, fnName);
    return undefined;
  }

  if (stmt.type === 'ExpressionStatement') {
    const exprStmt = stmt as ExpressionStatement;
    if (exprStmt.expression.type === 'AssignmentExpression') {
      executeAssignmentExpression(exprStmt.expression as AssignmentExpression, env, fnName);
      return undefined;
    }
    if (exprStmt.expression.type === 'UpdateExpression') {
      executeUpdateExpression(exprStmt.expression as UpdateExpression, env, fnName);
      return undefined;
    }
    throw new TraceInterpreterError(
      `Unsupported expression in ExpressionStatement: "${exprStmt.expression.type}" in function "${fnName}".`,
      'UNSUPPORTED_STATEMENT',
    );
  }

  if (stmt.type === 'ForStatement') {
    return executeForStatement(stmt as ForStatement, env, fnName);
  }

  if (stmt.type === 'IfStatement') {
    return executeIfStatement(stmt as IfStatement, env, fnName);
  }

  throw new TraceInterpreterError(
    `Unsupported statement type "${stmt.type}" in function "${fnName}".`,
    'UNSUPPORTED_STATEMENT',
  );
}


