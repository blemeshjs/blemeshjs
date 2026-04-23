import {
  Address,
  Data,
  readUInt16BE,
  StaticAcknowledgedProxyConfigurationMessage,
  StaticProxyConfigurationMessage,
  UInt8,
} from "@mesh-link-js/utils";
import { FilterStatus } from "./filter-status.js";
import { concatUint8Arrays } from "uint8array-extras";

/**
 * The Remove Addresses from Filter message is sent by a Proxy Client
 * to remove destination addresses from the proxy filter list.
 */
export class RemoveAddressesFromFilter extends StaticAcknowledgedProxyConfigurationMessage {
  public static opCode: UInt8 = 0x02;
  public get opCode(): UInt8 {
    return RemoveAddressesFromFilter.opCode;
  }
  public static responseType: typeof StaticProxyConfigurationMessage = FilterStatus;

  public get parameters(): Data | undefined {
    return concatUint8Arrays(Array.from(this.addresses.values()).map((address) => address.bytesBE));
  }

  /**
   * Arrays of addresses to be removed from the proxy filter.
   */
  public addresses: Map<string, Address>;

  /**
   * Creates the Remove Addresses To Filter message.
   *
   * @param addresses The array of addresses to be removed from the current filter.
   */
  public constructor(addresses: Map<string, Address>) {
    super();
    this.addresses = addresses;
  }

  public static fromData(parameters: Data) {
    if (parameters.length % 2 !== 0) {
      return undefined;
    }
    const tmp: Map<string, Address> = new Map();
    for (let i = 0; i < parameters.length; i += 2) {
      const address: Address = new Address(readUInt16BE(parameters.slice(i)));
      tmp.set(address.hex, address);
    }
    return new RemoveAddressesFromFilter(tmp);
  }
}
