import { JavaWhileStatement } from '../parser/parseStatements';
import { JavaEnvironment } from '../runtime/javaEnvironment';
import { evaluateJavaExpression } from '../evaluator/evaluateExpression';
import { assertJavaBooleanCondition } from '../utils/javaCondition';
import { executeProgram } from './executeProgram';
import { assertJavaLoopIterationAvailable, assertJavaLoopDepthAvailable } from '../javaLoopGuards';

export function executeWhileStatement(stmt: JavaWhileStatement, env: JavaEnvironment) {
  env.addStep('loop_start' as any, 'While loop started');
  env.loopDepth++;
  
  try {
    assertJavaLoopDepthAvailable(env.loopDepth);
    
    let iterationCount = 0;
    while (true) {
      assertJavaLoopIterationAvailable(iterationCount);

      const conditionValue = evaluateJavaExpression({
        expression: stmt.condition,
        variables: env.variables,
        onArrayRead: env.onArrayRead,
        onMethodCall: env.onMethodCall
      });
      const isTrue = assertJavaBooleanCondition(conditionValue);

      env.addStep('condition_evaluation' as any, 'While condition ' + stmt.condition + ' evaluated to ' + isTrue);

      if (!isTrue) {
        break;
      }

      env.addStep('loop_iteration' as any, 'While loop iteration ' + (iterationCount + 1));
      
      executeProgram(stmt.body, env);
      if (env.hasReturned) {
        break;
      }

      iterationCount++;
    }
  } finally {
    env.loopDepth--;
    env.addStep('loop_exit' as any, 'While loop exited');
  }
}
