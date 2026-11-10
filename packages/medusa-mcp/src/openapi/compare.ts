/**
 * Orders strings by UTF-16 code unit. Unlike `localeCompare`, the result never depends on the host's locale or ICU
 * version, which matters because ordering feeds the spec revision hash.
 */
export function compareCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
