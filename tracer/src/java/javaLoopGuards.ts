import { TRACE_LIMITS } from '../config/traceLimits';
import { TraceInterpreterError } from './errors/javaErrors';

export function assertJavaLoopIterationAvailable(iterationCount: number): void {
  if (iterationCount >= TRACE_LIMITS.maxLoopIterations) {
    throw new TraceInterpreterError(
      `JAVA_MAX_LOOP_ITERATIONS_EXCEEDED: Java loop exceeded maximum iterations of ${TRACE_LIMITS.maxLoopIterations}`
    );
  }
}

export function assertJavaLoopDepthAvailable(currentLoopDepth: number): void {
  if (currentLoopDepth >= TRACE_LIMITS.maxLoopDepth) {
    throw new TraceInterpreterError(
      `JAVA_MAX_LOOP_DEPTH_EXCEEDED: Java loop exceeded maximum depth of ${TRACE_LIMITS.maxLoopDepth}`
    );
  }
}
