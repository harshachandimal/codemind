import { TraceStep } from '../../types/trace';
import { RuntimeValue, VariableStore } from '../../types/interpreter';

export class JavaEnvironment {
  public variables = new Map<string, RuntimeValue>();
  public varStore: VariableStore = {};
  public steps: TraceStep[] = [];
  public stepCount = 0;
  public callStack: string[] = [];
  public returnedValue: RuntimeValue | undefined = undefined;
  public hasReturned = false;
  public loopDepth = 0;
  
  public onMethodCall?: (params: { methodName: string; args: RuntimeValue[] }) => RuntimeValue;
  public onArrayRead?: (name: string, index: number, value: RuntimeValue) => void;

  constructor(entryFunction: string) {
    this.callStack = [entryFunction];
  }

  public addStep(type: TraceStep['type'], desc: string) {
    this.stepCount++;
    this.steps.push({
      step: this.stepCount,
      line: null,
      type,
      description: desc,
      variables: { ...this.varStore },
      callStack: [...this.callStack]
    });
  }
}
