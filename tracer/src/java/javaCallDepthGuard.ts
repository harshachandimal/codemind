import { TRACE_LIMITS } from '../config/traceLimits';
import { TraceInterpreterError } from './errors/javaErrors';

export function assertJavaCallDepthAvailable(currentCallDepth: number): void {
  if (currentCallDepth >= TRACE_LIMITS.maxCallDepth) {
    throw new TraceInterpreterError(
      `JAVA_MAX_CALL_DEPTH_EXCEEDED: Maximum Java call depth exceeded.`
    );
  }
}
