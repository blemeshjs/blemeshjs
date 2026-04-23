import { isEnumCase } from "../helpers/index.js";
import { UInt8 } from "./number.js";

/**
 * A type of the Proxy Filter.
 */
export enum ProxyFilterType {
  /**
   * An accept list filter has an associated accept list containing
   * destination addresses that are of interest for the Proxy Client.
   *
   * The accept list filter blocks all messages except those targeting
   * addresses added to the list.
   */
  acceptList = 0x00,
  /**
   * A reject list filter has an associated reject list containing
   * destination addresses that are NOT of the Proxy Client interest.
   *
   * The reject list filter forwards all messages except those targeting
   * addresses added to the list.
   */
  rejectList = 0x01,
}

export namespace ProxyFilterType {
  export const fromRawValue = (rawValue: UInt8): ProxyFilterType | undefined => {
    return isEnumCase(rawValue, ProxyFilterType) ? rawValue : undefined;
  };
  export function toString(type: ProxyFilterType): string {
    switch (type) {
      case ProxyFilterType.acceptList:
        return "Accept List";
      case ProxyFilterType.rejectList:
        return "Reject List";
    }
  }
}
