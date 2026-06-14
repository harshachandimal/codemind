import { PythonForRangeStatement } from '../ast/pythonAstTypes';
import { PythonRuntimeValue } from '../runtime/pythonRuntimeValues';
import { StepRecorder } from '../../interpreter/StepRecorder';
import { PythonFunctionCallHandler, evaluatePythonExpression } from '../evaluator/evaluateExpression';
import { InterpreterState } from '../../types/interpreter';
import { executeBlock } from './executeBlock';
import { assertPythonLoopDepthAvailable, assertPythonLoopIterationAvailable } from '../guards/pythonLoopGuards';
import { createPythonError } from '../errors/createPythonError';
import { PYTHON_ERROR_CODES } from '../errors/pythonErrors';

export function executeForStatement(
  stmt: PythonForRangeStatement,
  variables: Record<string, PythonRuntimeValue>,
  recorder: StepRecorder,
  onFunctionCall: PythonFunctionCallHandler,
  state: InterpreterState
): { type: 'continue' } | { type: 'return', value: PythonRuntimeValue } {
  const argValues = stmt.rangeArgs.map((arg: string) => {
    const val = evaluatePythonExpression({ expression: arg, variables, recorder, onFunctionCall });
    if (typeof val !== 'number') {
      throw createPythonError(`Range argument must be a number`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
    }
    return val;
  });
  
  let start = 0, stop = 0, step = 1;
  if (argValues.length === 1) {
    stop = argValues[0]!;
  } else if (argValues.length === 2) {
    start = argValues[0]!;
    stop = argValues[1]!;
  } else if (argValues.length === 3) {
    start = argValues[0]!;
    stop = argValues[1]!;
    step = argValues[2]!;
  }
  
  if (step === 0) {
    throw createPythonError(`range() arg 3 must not be zero`, PYTHON_ERROR_CODES.RUNTIME_TYPE_ERROR);
  }
  
  recorder.record({
    line: null,
    type: 'loop_start',
    description: `For loop started over range(${start}, ${stop}, ${step}).`
  });
  
  state.loopDepth++;
  assertPythonLoopDepthAvailable(state.loopDepth);
  
  let iterationCount = 0;
  try {
    let i = start;
    while ((step > 0 && i < stop) || (step < 0 && i > stop)) {
      assertPythonLoopIterationAvailable(iterationCount++);
      variables[stmt.variableName] = i;
      recorder.record({
        line: null,
        type: 'loop_iteration',
        description: `Loop iteration ${iterationCount}, ${stmt.variableName} = ${i}`
      });
      
      const res = executeBlock(stmt.body, variables, recorder, onFunctionCall, state);
      if (res.type === 'return') return res;
      
      i += step;
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
