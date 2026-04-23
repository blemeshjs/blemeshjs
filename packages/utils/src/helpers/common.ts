import { Class } from "../types/common.js";
import { isEnumCase } from "./enum.js";

/**
 * Returns a string representing the type of the given value.
 * Handles null and undefined explicitly, otherwise returns the constructor name or typeof value.
 *
 * @param value - The value to check the type of.
 * @returns The type of the value as a string.
 */
export function typeOf<T>(value: T): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return (value as unknown as { constructor?: { name: string } }).constructor?.name || typeof value;
}

/**
 * Executes an asynchronous function and returns its result.
 * If the function throws an error, returns null instead.
 * Useful for optional async operations where failure is not critical.
 * @param fn - A function that returns a Promise.
 * @returns The resolved value of the Promise, or null if an error occurs.
 */
export async function tryOptionalAsync<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export function meshTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    date.getUTCFullYear() +
    "-" +
    pad(date.getUTCMonth() + 1) +
    "-" +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    ":" +
    pad(date.getUTCMinutes()) +
    ":" +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

const typedArrayTypeNames = [
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Uint16Array",
  "Int32Array",
  "Uint32Array",
  "Float32Array",
  "Float64Array",
  "BigInt64Array",
  "BigUint64Array",
] as const;

const objectTypeNames = [
  "Function",
  "Generator",
  "AsyncGenerator",
  "GeneratorFunction",
  "AsyncGeneratorFunction",
  "AsyncFunction",
  "Observable",
  "Array",
  "Buffer",
  "Blob",
  "Object",
  "RegExp",
  "Date",
  "Error",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "WeakRef",
  "ArrayBuffer",
  "SharedArrayBuffer",
  "DataView",
  "Promise",
  "URL",
  "FormData",
  "URLSearchParams",
  "HTMLElement",
  "NaN",
  ...typedArrayTypeNames,
] as const;

const primitiveTypeNames = [
  "null",
  "undefined",
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
] as const;

const _assertionTypeDescriptions = [
  "positive number",
  "negative number",
  "Class",
  "string with a number",
  "null or undefined",
  "Iterable",
  "AsyncIterable",
  "native Promise",
  "EnumCase",
  "string with a URL",
  "truthy",
  "falsy",
  "primitive",
  "integer",
  "plain object",
  "TypedArray",
  "array-like",
  "tuple-like",
  "Node.js Stream",
  "infinite number",
  "empty array",
  "non-empty array",
  "empty string",
  "empty string or whitespace",
  "non-empty string",
  "non-empty string and not whitespace",
  "empty object",
  "non-empty object",
  "empty set",
  "non-empty set",
  "empty map",
  "non-empty map",
  "PropertyKey",
  "even integer",
  "odd integer",
  "T",
  "in range",
  "predicate returns truthy for any value",
  "predicate returns truthy for all values",
  "valid Date",
  "valid length",
  "whitespace string",
  ...objectTypeNames,
  ...primitiveTypeNames,
] as const;

export type AssertionTypeDescription = (typeof _assertionTypeDescriptions)[number];

function typeErrorMessage(description: AssertionTypeDescription, value: unknown): string {
  return `Expected value which is \`${description}\`, received value of type \`${typeof value}\`.`;
}

export function assertString(value: unknown, message?: string): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(message ?? typeErrorMessage("string", value));
  }
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export function assertNumber(value: unknown, message?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new TypeError(message ?? typeErrorMessage("number", value));
  }
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === "function";
}

export function isArray<T = unknown>(
  value: unknown,
  assertion?: (value: T) => value is T,
): value is T[] {
  if (!Array.isArray(value)) {
    return false;
  }

  if (!isFunction(assertion)) {
    return true;
  }

  return value.every((element) => assertion(element));
}

export function assertArray<T = unknown>(
  value: unknown,
  assertion?: (element: unknown, message?: string) => asserts element is T,
  message?: string,
): asserts value is T[] {
  if (!isArray(value)) {
    throw new TypeError(message ?? typeErrorMessage("Array", value));
  }

  if (assertion) {
    for (const element of value) {
      // @ts-expect-error: "Assertions require every name in the call target to be declared with an explicit type annotation."
      assertion(element, message);
    }
  }
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isObject(value: unknown): value is object {
  return !isNull(value) && (typeof value === "object" || isFunction(value));
}

export function assertObject(value: unknown, message?: string): asserts value is object {
  if (!isObject(value)) {
    throw new TypeError(message ?? typeErrorMessage("Object", value));
  }
}

export function isDirectInstanceOf<T>(instance: unknown, class_: Class<T>): instance is T {
  if (instance === undefined || instance === null) {
    return false;
  }

  return Object.getPrototypeOf(instance) === class_.prototype;
}

export function assertDirectInstanceOf<T>(
  instance: unknown,
  class_: Class<T>,
  message?: string,
): asserts instance is T {
  if (!isDirectInstanceOf(instance, class_)) {
    throw new TypeError(message ?? typeErrorMessage("T", instance));
  }
}

export function assertEnumCase<T = unknown>(
  value: unknown,
  targetEnum: T,
  message?: string,
): asserts value is T[keyof T] {
  if (!isEnumCase(value, targetEnum)) {
    throw new TypeError(message ?? typeErrorMessage("EnumCase", value));
  }
}

export function assertBoolean(value: unknown, message?: string): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new TypeError(message ?? typeErrorMessage("boolean", value));
  }
}
