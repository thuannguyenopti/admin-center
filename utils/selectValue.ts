/**
 * Ensures a value is one of the option values for Axiom Select (downshift).
 * Prevents "Pass either item or index to getItemProps!" when value is missing from options.
 */
export type SelectOptionLike = { value: string; label?: string };

export function getSelectValueInOptions(
  value: string,
  options: readonly SelectOptionLike[] | SelectOptionLike[],
  fallback?: string
): string {
  if (!options?.length) return fallback ?? "";
  const inList = options.some((o) => o.value === value);
  return inList ? value : (fallback ?? options[0]?.value ?? "");
}
