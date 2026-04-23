/**
 * Unique symbol used to represent a special "null" value within the namespace.
 * Useful for distinguishing between JavaScript's native `null` and a custom sentinel value.
 */
export const NSNull = Symbol("NSNull");
export type NSNull = typeof NSNull;

/**
 * Represents a hexadecimal string (e.g., color codes, hashes).
 */
export type Hex = string;

/**
Matches a [`class` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T, Arguments extends unknown[] = any[]> = new (...arguments_: Arguments) => T;

/**
Matches a [`class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Class<T, Arguments extends unknown[] = any[]> = Constructor<T, Arguments> & {
  prototype: T;
};
