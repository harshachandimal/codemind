export function formatTraceValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  try {
    const str = JSON.stringify(value);
    if (str.length > 120) return str.slice(0, 117) + '…';
    return str;
  } catch {
    return '[unserializable value]';
  }
}
