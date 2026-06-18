import { JavaIfStatement } from '../parser/parseStatements';
import { JavaEnvironment } from '../runtime/javaEnvironment';
import { evaluateJavaExpression } from '../evaluator/evaluateExpression';
import { assertJavaBooleanCondition } from '../utils/javaCondition';
import { executeProgram } from './executeProgram';

export function executeIfStatement(stmt: JavaIfStatement, env: JavaEnvironment) {
  let branchTaken = false;

  for (const branch of stmt.branches) {
    const conditionValue = evaluateJavaExpression({
      expression: branch.condition,
      variables: env.variables,
      onArrayRead: env.onArrayRead,
      onMethodCall: env.onMethodCall
    });

    const isTrue = assertJavaBooleanCondition(conditionValue);

    // Using condition_evaluation as requested for condition tracing
    env.addStep('condition_evaluation' as any, 'Condition ' + branch.condition + ' evaluated to ' + isTrue, stmt.line);

    if (isTrue) {
      branchTaken = true;
      executeProgram(branch.body, env);
      break;
    }
  }

  if (!branchTaken && stmt.elseBody) {
    env.addStep('condition_evaluation' as any, 'Else branch executed', stmt.line);
    executeProgram(stmt.elseBody, env);
  }
}
