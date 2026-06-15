import { JavaForStatement } from '../parser/parseStatements';
import { JavaEnvironment } from '../runtime/javaEnvironment';
import { evaluateJavaExpression } from '../evaluator/evaluateExpression';
import { assertJavaBooleanCondition } from '../utils/javaCondition';
import { executeProgram } from './executeProgram';
import { assertJavaLoopIterationAvailable, assertJavaLoopDepthAvailable } from '../javaLoopGuards';
import { executeVariableDeclaration } from './executeVariableDeclaration';
import { executeAssignment } from './executeAssignment';
import { executeAugmentedAssignment } from './executeAugmentedAssignment';
import { executeIncrement } from './executeIncrement';

export function executeForStatement(stmt: JavaForStatement, env: JavaEnvironment) {
  if (stmt.init) {
    if (stmt.init.type === 'variable_declaration') executeVariableDeclaration(stmt.init, env);
    else if (stmt.init.type === 'assignment') executeAssignment(stmt.init, env);
  }

  env.addStep('loop_start' as any, 'For loop started');
  env.loopDepth++;
  
  try {
    assertJavaLoopDepthAvailable(env.loopDepth);
    
    let iterationCount = 0;
    while (true) {
      assertJavaLoopIterationAvailable(iterationCount);

      if (stmt.condition) {
        const conditionValue = evaluateJavaExpression({
          expression: stmt.condition,
          variables: env.variables,
          onArrayRead: env.onArrayRead,
          onMethodCall: env.onMethodCall
        });
        const isTrue = assertJavaBooleanCondition(conditionValue);

        env.addStep('condition_evaluation' as any, 'For condition ' + stmt.condition + ' evaluated to ' + isTrue);

        if (!isTrue) {
          break;
        }
      }

      env.addStep('loop_iteration' as any, 'For loop iteration ' + (iterationCount + 1));
      
      executeProgram(stmt.body, env);
      if (env.hasReturned) {
        break;
      }

      if (stmt.update) {
        if (stmt.update.type === 'assignment') executeAssignment(stmt.update, env);
        else if (stmt.update.type === 'augmented_assignment') executeAugmentedAssignment(stmt.update, env);
        else if (stmt.update.type === 'increment') executeIncrement(stmt.update, env);
      }

      iterationCount++;
    }
  } finally {
    env.loopDepth--;
    env.addStep('loop_exit' as any, 'For loop exited');
  }
}
