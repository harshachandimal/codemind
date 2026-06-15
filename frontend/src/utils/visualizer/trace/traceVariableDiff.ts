function safeSerialize(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function getChangedVariableKeys(
  previousVariables: Record<string, unknown> | null | undefined,
  currentVariables: Record<string, unknown> | null | undefined
): string[] {
  if (!currentVariables) return [];

  const prev = previousVariables ?? {};
  const changed: string[] = [];

  for (const key of Object.keys(currentVariables)) {
    if (
      !(key in prev) ||
      safeSerialize(prev[key]) !== safeSerialize(currentVariables[key])
    ) {
      changed.push(key);
    }
  }

  return changed;
}
