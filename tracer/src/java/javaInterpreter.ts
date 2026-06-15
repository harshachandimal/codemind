import { TraceStep } from '../types/trace';
import { RuntimeValue } from '../types/interpreter';
import { assertJavaSupportedSyntax } from './utils/javaUnsupportedNodes';
import { parseJavaMethods } from './parser/parseMethods';
import { parseJavaStatements } from './parser/parseStatements';
import { TraceInterpreterError } from './errors/javaErrors';
import { JavaEnvironment } from './runtime/javaEnvironment';
import { executeProgram } from './executor/executeProgram';
import { createJavaArrayValue, JavaRuntimeValue, JavaArrayElementType, javaValueToRuntimeValue } from './runtime/javaRuntimeValues';
import { assertJavaCallDepthAvailable } from './javaCallDepthGuard';

export type JavaInterpreterInput = {
  sourceCode: string;
  entryFunction: string;
  input: unknown[];
};

export type JavaInterpreterResult = {
  returnedValue: RuntimeValue | undefined;
  steps: TraceStep[];
  summary: any;
};

export class JavaInterpreter {
  public run(input: JavaInterpreterInput): JavaInterpreterResult {
    const cleanCode = input.sourceCode;
    assertJavaSupportedSyntax({ sourceCode: cleanCode, entryFunction: input.entryFunction });

    const methods = parseJavaMethods(cleanCode);
    const entryMethod = methods.find(m => m.name === input.entryFunction);
    if (!entryMethod) {
      throw new TraceInterpreterError('JAVA_ENTRY_METHOD_NOT_FOUND: Method ' + input.entryFunction + ' not found.');
    }

    if (entryMethod.params.length !== input.input.length) {
      throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Expected ' + entryMethod.params.length + ' inputs, got ' + input.input.length);
    }

    const env = new JavaEnvironment(input.entryFunction);

    // We use the imported helper functions from javaRuntimeValues
    
    function convertInput(val: unknown, typeName: string, name: string): JavaRuntimeValue {
      if (typeName === 'int' || typeName === 'double') {
        if (typeof val !== 'number') throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Expected number for ' + name);
        if (typeName === 'int' && !Number.isInteger(val)) throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Expected integer for ' + name);
        return val;
      } else if (typeName === 'boolean') {
        if (typeof val !== 'boolean') throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Expected boolean for ' + name);
        return val;
      } else if (typeName === 'String') {
        if (typeof val !== 'string') throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Expected string for ' + name);
        return val;
      } else if (typeName.endsWith('[]')) {
        if (!Array.isArray(val)) throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Expected array for ' + name);
        const baseType = typeName.slice(0, -2);
        const items = val.map((item, idx) => convertInput(item, baseType, name + '[' + idx + ']'));
        
        let elementType: JavaArrayElementType;
        if (baseType.endsWith('[]')) {
          elementType = 'array';
        } else {
          elementType = baseType as JavaArrayElementType;
        }

        return createJavaArrayValue(elementType, items);
      }
      throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Unsupported type ' + typeName);
    }

    entryMethod.params.forEach((param, i) => {
      const val = input.input[i];
      const converted = convertInput(val, param.typeName, param.name);
      env.variables.set(param.name, converted as any);
      env.varStore[param.name] = javaValueToRuntimeValue(converted);
    });

    env.onMethodCall = (callParams) => {
      if (callParams.methodName !== input.entryFunction) {
        throw new TraceInterpreterError('JAVA_METHOD_CALL_UNSUPPORTED: Method calls to anything other than the entry function are not supported.');
      }
      return this.executeMethod(callParams.methodName, callParams.args, env, methods);
    };

    env.addStep('function_call', 'Entered method ' + input.entryFunction);

    const statements = parseJavaStatements(entryMethod.bodyText);
    executeProgram(statements, env);

    if (!env.hasReturned) {
      if (entryMethod.returnType !== 'void') {
         throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Method missing return statement');
      }
      env.returnedValue = null;
    }

    return {
      returnedValue: env.returnedValue,
      steps: env.steps,
      summary: { totalSteps: env.stepCount, terminatedReason: 'completed' }
    };
  }

  private executeMethod(
    methodName: string,
    args: RuntimeValue[],
    env: JavaEnvironment,
    methods: any[]
  ): RuntimeValue {
    assertJavaCallDepthAvailable(env.callStack.length);

    const method = methods.find(m => m.name === methodName);
    if (!method) throw new TraceInterpreterError('JAVA_ENTRY_METHOD_NOT_FOUND: Method ' + methodName + ' not found.');

    // Save parent scope
    const parentVars = env.variables;
    const parentStore = env.varStore;
    const parentHasReturned = env.hasReturned;
    const parentReturnedValue = env.returnedValue;

    // Push new frame
    env.callStack.push(methodName);
    env.variables = new Map<string, RuntimeValue>();
    env.varStore = {};
    env.hasReturned = false;
    env.returnedValue = undefined;

    // Bind parameters
    method.params.forEach((param: any, i: number) => {
      const argValue = args[i] ?? null;
      env.variables.set(param.name, argValue);
      env.varStore[param.name] = argValue;
    });

    env.addStep('function_call', `Recursive call ${methodName}(...)`);

    try {
      const statements = parseJavaStatements(method.bodyText);
      executeProgram(statements, env);

      if (!env.hasReturned) {
        if (method.returnType !== 'void') {
          throw new TraceInterpreterError('JAVA_RUNTIME_TYPE_ERROR: Method missing return statement');
        }
        env.addStep('return', `Returning from ${methodName} with null`);
      }
      return env.returnedValue ?? null;
    } finally {
      // Pop frame and restore scope
      env.callStack.pop();
      env.variables = parentVars;
      env.varStore = parentStore;
      env.hasReturned = parentHasReturned;
      env.returnedValue = parentReturnedValue;
    }
  }
}
