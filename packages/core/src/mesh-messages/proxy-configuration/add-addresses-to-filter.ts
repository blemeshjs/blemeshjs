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
 * The Add Addresses to Filter message is sent by a Proxy Client
 * to add destination addresses to the proxy filter list.
 */
export class AddAddressesToFilter extends StaticAcknowledgedProxyConfigurationMessage {
  public static opCode: UInt8 = 0x01;
  public get opCode(): UInt8 {
    return AddAddressesToFilter.opCode;
  }
  public static responseType: typeof StaticProxyConfigurationMessage = FilterStatus;

  public get parameters(): Data | undefined {
    // Send addresses sorted. The primary Element will be added as a first one,
    // so if the Proxy Filter supports only one address, it will be that one.
    let data: Uint8Array = new Uint8Array();
    Array.from(this.addresses.values())
      .sort((a, b) => parseInt(a.hex) - parseInt(b.hex))
      .forEach((address) => {
        data = concatUint8Arrays([data, address.bytesBE]);
      });
    return data;
  }

  /**
   * Arrays of addresses to be added to the proxy filter.
   */
  public addresses: Map<string, Address>;

  /**
   * Creates the Add Addresses To Filter message.
   *
   * @param addresses The array of addresses to be added to the current filter.
   */
  public constructor(addresses: Map<string, Address>) {
    super();
    this.addresses = addresses;
  }

  public fromData(parameters: Data): AddAddressesToFilter | undefined {
    if (parameters.length % 2 !== 0) {
      return undefined;
    }
    const tmp: Map<string, Address> = new Map();
    for (let i = 0; i < parameters.length; i += 2) {
      const address: Address = new Address(readUInt16BE(parameters.slice(i)));
      tmp.set(address.hex, address);
    }
    return new AddAddressesToFilter(tmp);
  }

  public toString() {
    return `AddAddressesToFilter(addresses: [${Array.from(this.addresses.values())
      .map((address) => address.dec)
      .join(", ")}])`;
  }
}
