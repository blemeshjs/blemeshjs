import { Data } from "./buffer.js";

/**
 * Abstract base class for storage engines.
 *
 * Subclasses must implement the core storage methods: `get`, `set`, `remove`, and `clear`.
 * This class defines the contract for key-value storage with asynchronous access.
 *
 */
export abstract class Storage<Value = unknown> {
  /**
   * Loads data from the storage.
   *
   * @returns Data or `undefined` if not found.
   */
  abstract load(): (Data | undefined) | Promise<Data | undefined>;
  /**
   * Save given data.
   *
   * @returns `True` in case of success, `false` otherwise.
   */
  abstract save(data: Data): boolean | Promise<boolean>;
  /**
   * Retrieves the value for the given key.
   * @param key The unique identifier for the value.
   * @returns The stored value or `undefined` if not found.
   */
  abstract get(key: string): (Value | undefined) | Promise<Value | undefined>;

  /**
   * Stores a value for the given key.
   * @param key The unique identifier.
   * @param value The value to store.
   */
  abstract set(key: string, value: Value): void | Promise<void>;

  /**
   * Removes the value associated with the given key.
   * @param key The key to remove.
   */
  abstract remove(key: string): void | Promise<void>;

  /**
   * Clears all stored key-value pairs.
   */
  abstract clear(): void | Promise<void>;
}
