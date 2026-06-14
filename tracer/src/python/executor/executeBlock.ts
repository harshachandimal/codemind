import { PythonStatement } from '../ast/pythonAstTypes';
import { PythonRuntimeValue } from '../runtime/pythonRuntimeValues';
import { StepRecorder } from '../../interpreter/StepRecorder';
import { PythonFunctionCallHandler } from '../evaluator/evaluateExpression';
import { InterpreterState } from '../../types/interpreter';
import { executeStatement } from './executeStatement';

export function executeBlock(
  statements: PythonStatement[],
  variables: Record<string, PythonRuntimeValue>,
  recorder: StepRecorder,
  onFunctionCall: PythonFunctionCallHandler,
  state: InterpreterState
): { type: 'continue' } | { type: 'return', value: PythonRuntimeValue } {
  for (const stmt of statements) {
    const res = executeStatement(stmt, variables, recorder, onFunctionCall, state);
    if (res.type === 'return') return res;
  }
  return { type: 'continue' };
}
