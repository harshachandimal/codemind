import { PythonStatement } from '../ast/pythonAstTypes';
import { PythonRuntimeValue } from '../runtime/pythonRuntimeValues';
import { StepRecorder } from '../../interpreter/StepRecorder';
import { PythonFunctionCallHandler } from '../evaluator/evaluateExpression';
import { InterpreterState } from '../../types/interpreter';
import { executeAssignment, executeAugmentedAssignment } from './executeAssignment';
import { executeReturnStatement } from './executeReturnStatement';
import { executeIfStatement } from './executeIfStatement';
import { executeWhileStatement } from './executeWhileStatement';
import { executeForStatement } from './executeForStatement';
import { createPythonError } from '../errors/createPythonError';
import { PYTHON_ERROR_CODES } from '../errors/pythonErrors';

export function executeStatement(
  stmt: PythonStatement,
  variables: Record<string, PythonRuntimeValue>,
  recorder: StepRecorder,
  onFunctionCall: PythonFunctionCallHandler,
  state: InterpreterState
): { type: 'continue' } | { type: 'return', value: PythonRuntimeValue } {
  if (stmt.type === 'return') {
    return executeReturnStatement(stmt, variables, recorder, onFunctionCall);
  } else if (stmt.type === 'assignment') {
    executeAssignment(stmt, variables, recorder, onFunctionCall);
    return { type: 'continue' };
  } else if (stmt.type === 'augmented_assignment') {
    executeAugmentedAssignment(stmt, variables, recorder, onFunctionCall);
    return { type: 'continue' };
  } else if (stmt.type === 'if') {
    return executeIfStatement(stmt, variables, recorder, onFunctionCall, state);
  } else if (stmt.type === 'while') {
    return executeWhileStatement(stmt, variables, recorder, onFunctionCall, state);
  } else if (stmt.type === 'for_range') {
    return executeForStatement(stmt, variables, recorder, onFunctionCall, state);
  } else {
    throw createPythonError(`Unsupported statement type`, PYTHON_ERROR_CODES.UNSUPPORTED_STATEMENT);
  }
}
