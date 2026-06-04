/**
 * Converts a snake_case string to Title Case.
 * Example: "nested_loop" → "Nested Loop"
 */
export function toTitleCaseFromSnakeCase(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
