import { PythonStatement } from '../ast/pythonAstTypes';
import { PythonRuntimeValue } from '../runtime/pythonRuntimeValues';
import { StepRecorder } from '../../interpreter/StepRecorder';
import { PythonFunctionCallHandler, evaluatePythonExpression } from '../evaluator/evaluateExpression';
import { InterpreterState } from '../../types/interpreter';

export function executeAssignment(
  stmt: { type: 'assignment', name: string, expression: string },
  variables: Record<string, PythonRuntimeValue>,
  recorder: StepRecorder,
  onFunctionCall: PythonFunctionCallHandler
): void {
  const val = evaluatePythonExpression({ expression: stmt.expression, variables, recorder, onFunctionCall });
  variables[stmt.name] = val;
  recorder.record({
    line: null,
    type: 'assignment',
    description: `Assigned ${stmt.name} = ${JSON.stringify(val)}`
  });
}

export function executeAugmentedAssignment(
  stmt: { type: 'augmented_assignment', name: string, operator: string, expression: string },
  variables: Record<string, PythonRuntimeValue>,
  recorder: StepRecorder,
  onFunctionCall: PythonFunctionCallHandler
): void {
  const rightVal = evaluatePythonExpression({ expression: stmt.expression, variables, recorder, onFunctionCall });
  const leftVal = variables[stmt.name];
  if (typeof leftVal !== 'number' || typeof rightVal !== 'number') {
    throw new Error(`Augmented assignment requires numbers`);
  }
  let newVal = leftVal;
  if (stmt.operator === '+=') newVal += rightVal;
  else if (stmt.operator === '-=') newVal -= rightVal;
  else if (stmt.operator === '*=') newVal *= rightVal;
  else if (stmt.operator === '/=') newVal /= rightVal;
  else if (stmt.operator === '//=') newVal = Math.floor(newVal / rightVal);
  else if (stmt.operator === '%=') newVal %= rightVal;
  
  variables[stmt.name] = newVal;
  recorder.record({
    line: null,
    type: 'assignment',
    description: `Assigned ${stmt.name} = ${JSON.stringify(newVal)}`
  });
}
