import { RuntimeValue } from '../types/interpreter';
import { TraceStep } from '../types/trace';
import { parsePythonFunctions } from './parser/parseFunctions';
import { assertPythonSupportedSyntax } from './utils/pythonUnsupportedNodes';
import { createPythonRuntimeState } from './runtime/createPythonRuntime';
import { executeFunctionCall } from './executor/executeFunctionCall';
import { StepRecorder } from '../interpreter/StepRecorder';
import { createPythonError } from './errors/createPythonError';
import { PYTHON_ERROR_CODES } from './errors/pythonErrors';

export type PythonInterpreterInput = {
  sourceCode: string;
  entryFunction: string;
  input: unknown[];
};

export type PythonInterpreterResult = {
  returnedValue: RuntimeValue;
  steps: TraceStep[];
  summary: unknown;
};

export class PythonInterpreter {
  public run(input: PythonInterpreterInput): PythonInterpreterResult {
    // 1. Syntax check
    assertPythonSupportedSyntax({ sourceCode: input.sourceCode, entryFunction: input.entryFunction });

    // 2. Parse functions
    const functions = parsePythonFunctions(input.sourceCode);
    const entryDef = functions.find(f => f.name === input.entryFunction);
    if (!entryDef) {
      throw createPythonError(`Entry function not found.`, PYTHON_ERROR_CODES.ENTRY_FUNCTION_NOT_FOUND);
    }

    // 3. State initialization
    const state = createPythonRuntimeState(functions, input.entryFunction, input.input);
    const recorder = new StepRecorder(state);

    recorder.record({
      line: null,
      type: 'function_call',
      description: `Called ${entryDef.name}`
    });

    // 4. Execution
    let returnedValue: RuntimeValue = null;
    try {
      const args = entryDef.params.map(p => state.variables[p] ?? null);
      
      // Clear callstack before initial call so that executeFunctionCall manages it correctly
      state.callStack = []; 
      
      returnedValue = executeFunctionCall(entryDef.name, args, functions, entryDef, state, recorder);
    } catch (error: any) {
      if (error && error.code) {
        throw error;
      }
      throw createPythonError(error instanceof Error ? error.message : String(error), PYTHON_ERROR_CODES.INTERNAL_ERROR);
    }

    state.status = 'completed';

    return {
      returnedValue,
      steps: recorder.getSteps(),
      summary: {
        totalSteps: state.stepCount,
        maxLoopDepth: state.loopDepth,
        maxCallDepth: state.callStack.length
      }
    };
  }
}
