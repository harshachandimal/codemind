import { PythonStatement } from '../ast/pythonAstTypes';
import { PythonRuntimeValue } from '../runtime/pythonRuntimeValues';
import { StepRecorder } from '../../interpreter/StepRecorder';
import { PythonFunctionCallHandler, evaluatePythonExpression } from '../evaluator/evaluateExpression';

export function executeReturnStatement(
  stmt: import("../ast/pythonAstTypes").PythonReturnStatement,
  variables: Record<string, PythonRuntimeValue>,
  recorder: StepRecorder,
  onFunctionCall: PythonFunctionCallHandler
): { type: 'return', value: PythonRuntimeValue } {
  const retVal = stmt.expression ? evaluatePythonExpression({ expression: stmt.expression, variables, recorder, onFunctionCall }) : null;
  recorder.record({
    line: stmt.line,
    type: 'return',
    description: `Returned ${JSON.stringify(retVal)}`
  });
  return { type: 'return', value: retVal };
}
