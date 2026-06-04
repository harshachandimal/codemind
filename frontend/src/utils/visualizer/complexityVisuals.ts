import type { VisualizerTone } from '../../types/visualizer';

/**
 * Maps a Big-O complexity string to a VisualizerTone.
 * Returns 'neutral' for unknown or null values.
 */
export function getComplexityTone(value: string | null): VisualizerTone {
  if (!value) return 'neutral';
  const v = value.trim();
  if (v === 'O(1)' || v === 'O(log n)') return 'success';
  if (v === 'O(n)' || v === 'O(n log n)') return 'accent';
  if (v === 'O(n²)' || v === 'O(n^2)') return 'warning';
  if (
    v.startsWith('O(2^') ||
    v.startsWith('O(n!)') ||
    v === 'O(n³)' ||
    v === 'O(n^3)'
  )
    return 'danger';
  return 'neutral';
}

/**
 * Returns a plain-language description of what a complexity value means
 * for either time or space usage. Clearly frames this as an estimate.
 */
export function describeComplexity(
  label: string,
  value: string | null
): string {
  const kind = label.toLowerCase().includes('space') ? 'memory' : 'time';

  if (!value || value === 'Unknown') {
    return `CodeMind could not estimate the ${kind} complexity for this code.`;
  }

  const v = value.trim();

  const descriptions: Record<string, string> = {
    'O(1)':
      kind === 'time'
        ? 'Estimated constant time — the number of steps does not grow with input size.'
        : 'Estimated constant memory — the amount of extra memory used does not grow with input size.',
    'O(log n)':
      kind === 'time'
        ? 'Estimated logarithmic time — the number of steps grows slowly, roughly proportional to log of the input size.'
        : 'Estimated logarithmic memory — extra memory usage grows slowly as input size increases.',
    'O(n)':
      kind === 'time'
        ? 'Estimated linear time — the number of steps grows proportionally with the input size.'
        : 'Estimated linear memory — extra memory grows proportionally with the input size.',
    'O(n log n)':
      kind === 'time'
        ? 'Estimated linearithmic time — slightly worse than linear, common in efficient sorting algorithms.'
        : 'Estimated linearithmic memory usage.',
    'O(n²)':
      kind === 'time'
        ? 'Estimated quadratic time — steps grow as the square of the input, often caused by nested loops.'
        : 'Estimated quadratic memory — extra memory grows as the square of the input size.',
    'O(n^2)':
      kind === 'time'
        ? 'Estimated quadratic time — steps grow as the square of the input, often caused by nested loops.'
        : 'Estimated quadratic memory — extra memory grows as the square of the input size.',
    'O(2^n)':
      kind === 'time'
        ? 'Estimated exponential time — steps double with each additional input element, which can become very slow quickly.'
        : 'Estimated exponential memory usage — may exhaust available memory for large inputs.',
    'O(n!)':
      kind === 'time'
        ? 'Estimated factorial time — extremely slow for all but the smallest inputs.'
        : 'Estimated factorial memory usage — practically limited to very small inputs.',
  };

  return (
    descriptions[v] ??
    `Estimated ${kind} complexity is ${v}. CodeMind detected this based on static code patterns.`
  );
}
