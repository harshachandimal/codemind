import { PythonWhileStatement } from '../ast/pythonAstTypes';
import { PythonRuntimeValue } from '../runtime/pythonRuntimeValues';
import { StepRecorder } from '../../interpreter/StepRecorder';
import { PythonFunctionCallHandler, evaluatePythonExpression } from '../evaluator/evaluateExpression';
import { InterpreterState } from '../../types/interpreter';
import { executeBlock } from './executeBlock';
import { isPythonTruthy } from '../utils/pythonTruthiness';
import { assertPythonLoopDepthAvailable, assertPythonLoopIterationAvailable } from '../guards/pythonLoopGuards';

export function executeWhileStatement(
  stmt: PythonWhileStatement,
  variables: Record<string, PythonRuntimeValue>,
  recorder: StepRecorder,
  onFunctionCall: PythonFunctionCallHandler,
  state: InterpreterState
): { type: 'continue' } | { type: 'return', value: PythonRuntimeValue } {
  recorder.record({
    line: null,
    type: 'loop_start',
    description: `While loop started.`
  });
  state.loopDepth++;
  assertPythonLoopDepthAvailable(state.loopDepth);
  
  let iterationCount = 0;
  try {
    while (true) {
      const condVal = evaluatePythonExpression({ expression: stmt.condition, variables, recorder, onFunctionCall });
      const isTrue = isPythonTruthy(condVal);
      recorder.record({
        line: null,
        type: 'condition',
        description: `While condition ${stmt.condition} evaluated to ${isTrue}`
      });
      if (!isTrue) break;
      
      assertPythonLoopIterationAvailable(iterationCount++);
      recorder.record({
        line: null,
        type: 'loop_iteration',
        description: `Loop iteration ${iterationCount}`
      });
      
      const res = executeBlock(stmt.body, variables, recorder, onFunctionCall, state);
      if (res.type === 'return') return res;
    }
  } finally {
    state.loopDepth--;
    recorder.record({
      line: null,
      type: 'loop_exit',
      description: `Loop exited.`
    });
  }
  return { type: 'continue' };
}
