export function getTraceStepLabel(type: string): string {
  const labels: Record<string, string> = {
    function_call:         'Function',
    variable_declaration:  'Declare',
    assignment:            'Assign',
    loop_start:            'Loop Start',
    loop_iteration:        'Iteration',
    loop_exit:             'Loop Exit',
    condition:             'Condition',
    branch:                'Branch',
    array_read:            'Array Read',
    return:                'Return',
    error:                 'Error',
  };
  return labels[type] ?? type;
}

export type StepTone = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

export function getTraceStepTone(type: string): StepTone {
  const tones: Record<string, StepTone> = {
    function_call:         'info',
    variable_declaration:  'neutral',
    assignment:            'neutral',
    loop_start:            'warning',
    loop_iteration:        'warning',
    loop_exit:             'warning',
    condition:             'info',
    branch:                'info',
    array_read:            'neutral',
    return:                'success',
    error:                 'danger',
  };
  return tones[type] ?? 'neutral';
}
