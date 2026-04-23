/**
 * Returns the keys of a TypeScript enum as an array of strings.
 * @param _enum The enum object.
 */
export function getEnumKeys<T extends object>(_enum: T): string[] {
  return Object.keys(_enum).filter((key) => isNaN(Number(key)));
}

/**
 * Returns the values of a TypeScript enum as an array.
 * @param _enum The enum object.
 */
export function getEnumValues<T extends object, V = T[keyof T]>(_enum: T): V[] {
  return Object.values(_enum).filter(
    (value) => typeof value !== "string" || isNaN(Number(value)),
  ) as V[];
}

/**
 * Returns whether the given value is a valid case of the provided enum.
 * @param value The value to check.
 */
export function isEnumCase<T = unknown>(value: unknown, targetEnum: T): value is T[keyof T] {
  return Object.values(targetEnum as object).includes(value);
}
