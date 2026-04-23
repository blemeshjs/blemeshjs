import { isEnumCase } from "../helpers/enum.js";

/**
 * The enum representing Key Refresh phase.
 */
export enum KeyRefreshPhase {
  /**
   * Phase 0: Normal Operation.
   */
  normalOperation = 0,
  /**
   * Phase 1: Distributing new keys to all nodes. Nodes will transmit using
   * old keys, but can receive using old and new keys.
   */
  keyDistribution = 1,
  /**
   * Phase 2: Nodes will use the new keys when encrypting messages
   * but will still receive using the old or new keys. Nodes shall only
   * receive Secure Network beacons secured using the new Network Key.
   */
  usingNewKeys = 2,
}

/**
 * Safely parses numeric input into a KeyRefreshPhase.
 * @param value Numeric value to convert.
 * @returns Corresponding enum member or undefined if invalid.
 */
export namespace KeyRefreshPhase {
  export function from(value: number): KeyRefreshPhase | undefined {
    if (isEnumCase(value, KeyRefreshPhase)) return value;
    return undefined;
  }
}
