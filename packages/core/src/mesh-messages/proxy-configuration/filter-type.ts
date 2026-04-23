import {
  Data,
  ProxyFilterType,
  StaticAcknowledgedProxyConfigurationMessage,
  StaticProxyConfigurationMessage,
  UInt8,
} from "@mesh-link-js/utils";
import { FilterStatus } from "./filter-status.js";

/**
 * The Set Filter Type message can be sent by a Proxy Client to
 * change the proxy filter type and clear the proxy filter list.
 */
export class SetFilterType extends StaticAcknowledgedProxyConfigurationMessage {
  public static opCode: UInt8 = 0x00;

  public get opCode(): UInt8 {
    return SetFilterType.opCode;
  }

  public static responseType: typeof StaticProxyConfigurationMessage = FilterStatus;

  public get parameters(): Data | undefined {
    return new Uint8Array([this.filterType]);
  }

  /**
   * The new filter type.
   */
  public filterType: ProxyFilterType;

  /**
   * Creates a new Set Filter Type message.
   *
   * This message can be used to set the proxy filter type and
   * clear the proxy filter list.
   *
   * @param type The new filter type. Setting the same filter type as was set before will clear the filter.
   */
  public constructor(type: ProxyFilterType) {
    super();
    this.filterType = type;
  }

  public static fromData(parameters: Data): SetFilterType | undefined {
    if (parameters.length !== 1) return;
    const type = ProxyFilterType.fromRawValue(parameters[0]);
    if (typeof type === "undefined") return;
    return new SetFilterType(type);
  }

  public toString() {
    return `SetFilterType(filterType: ${ProxyFilterType.toString(this.filterType)})`;
  }
}
