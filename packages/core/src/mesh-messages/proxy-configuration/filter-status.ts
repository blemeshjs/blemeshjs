import {
  Data,
  packUInt16BE,
  ProxyFilterType,
  readUInt16BE,
  StaticProxyConfigurationMessage,
  UInt16,
  UInt8,
} from "@blemeshjs/utils";
import { concatUint8Arrays } from "uint8array-extras";

/**
 * The Filter Status message is sent by a Proxy Server to report the status of
 * the Proxy Filter.
 */
export class FilterStatus extends StaticProxyConfigurationMessage {
  public static opCode: UInt8 = 0x03;
  public get opCode(): UInt8 {
    return FilterStatus.opCode;
  }

  public get parameters(): Data | undefined {
    return concatUint8Arrays([new Uint8Array([this.filterType]), packUInt16BE(this.listSize)]);
  }

  /**
   * The current filter type.
   */
  public filterType!: ProxyFilterType;
  /**
   * Number of addresses in the proxy filter list.
   */
  public listSize!: UInt16;

  /**
   * Creates a new Filter Status message.
   *
   * @param type The current filter type.
   * @param listSize Number of addresses in the proxy filter list.
   */
  public static fromTypeAndListSize(type: ProxyFilterType, listSize: UInt16): FilterStatus {
    const filterStatus = new FilterStatus();
    filterStatus.filterType = type;
    filterStatus.listSize = listSize;
    return filterStatus;
  }

  public static fromData(parameters: Data): FilterStatus | undefined {
    if (parameters.length !== 3) {
      return undefined;
    }
    const type = ProxyFilterType.fromRawValue(parameters[0]);
    if (typeof type === "undefined") return undefined;
    return FilterStatus.fromTypeAndListSize(type, readUInt16BE(parameters, 1));
  }

  public toString() {
    return `FilterStatus(filterType: ${ProxyFilterType.toString(this.filterType)}, listSize: ${this.listSize})`;
  }
}
