export function isTracerExecutionEnabled(): boolean {
  return process.env['TRACER_EXECUTION_ENABLED'] === 'true';
}

export function isPythonTracerEnabled(): boolean {
  return process.env['PYTHON_TRACER_ENABLED'] === 'true';
}

export function isJavaTracerEnabled(): boolean {
  return process.env['JAVA_TRACER_ENABLED'] === 'true';
}
