import { PythonIfStatement } from '../ast/pythonAstTypes';
import { PythonRuntimeValue } from '../runtime/pythonRuntimeValues';
import { StepRecorder } from '../../interpreter/StepRecorder';
import { PythonFunctionCallHandler, evaluatePythonExpression } from '../evaluator/evaluateExpression';
import { InterpreterState } from '../../types/interpreter';
import { executeBlock } from './executeBlock';
import { isPythonTruthy } from '../utils/pythonTruthiness';

export function executeIfStatement(
  stmt: PythonIfStatement,
  variables: Record<string, PythonRuntimeValue>,
  recorder: StepRecorder,
  onFunctionCall: PythonFunctionCallHandler,
  state: InterpreterState
): { type: 'continue' } | { type: 'return', value: PythonRuntimeValue } {
  let branchTaken = false;
  for (const branch of stmt.branches) {
    const condVal = evaluatePythonExpression({ expression: branch.condition, variables, recorder, onFunctionCall });
    const isTrue = isPythonTruthy(condVal);
    recorder.record({
      line: stmt.line,
      type: 'condition',
      description: `Condition ${branch.condition} evaluated to ${isTrue}`
    });
    
    if (isTrue) {
      branchTaken = true;
      recorder.record({
        line: stmt.line,
        type: 'branch',
        description: `If branch taken`
      });
      const res = executeBlock(branch.body, variables, recorder, onFunctionCall, state);
      if (res.type === 'return') return res;
      break;
    }
  }
  if (!branchTaken && stmt.elseBody) {
    recorder.record({
      line: stmt.line,
      type: 'condition',
      description: `Else branch executed.`
    });
    const res = executeBlock(stmt.elseBody, variables, recorder, onFunctionCall, state);
    if (res.type === 'return') return res;
  }
  return { type: 'continue' };
}
