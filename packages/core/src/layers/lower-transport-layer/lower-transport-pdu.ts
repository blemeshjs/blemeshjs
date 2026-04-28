import { Address, Data, UInt32, UInt8 } from "@blemeshjs/utils";
import { NetworkKey } from "../../mesh-models/network-key.js";

export enum LowerTransportPduType {
  accessMessage = 0,
  controlMessage = 1,
}

export namespace LowerTransportPduType {
  export function toString(type: LowerTransportPduType): string {
    switch (type) {
      case LowerTransportPduType.accessMessage:
        return "Access Message";
      case LowerTransportPduType.controlMessage:
        return "Control Message";
    }
  }

  export const netMicSize = (type: LowerTransportPduType): UInt8 => {
    switch (type) {
      case LowerTransportPduType.accessMessage:
        return 4; // 32 bits
      case LowerTransportPduType.controlMessage:
        return 8; // 64 bits
    }
  };
}

export abstract class LowerTransportPdu {
  protected abstract $source: Address;
  /**
   * Source Address.
   */
  public get source(): Address {
    return this.$source;
  }

  protected abstract $destination: Address;
  /**
   * Destination Address.
   */
  public get destination(): Address {
    return this.$destination;
  }

  protected abstract $networkKey: NetworkKey;
  /**
   * The Network Key used to decode/encode the PDU.
   */
  public get networkKey(): NetworkKey {
    return this.$networkKey;
  }

  protected abstract $ivIndex: UInt32;
  /**
   * The IV Index used to decode/encode the PDU.
   */
  public get ivIndex(): UInt32 {
    return this.$ivIndex;
  }

  protected abstract $type: LowerTransportPduType;
  /**
   * Message type.
   */
  public get type(): LowerTransportPduType {
    return this.$type;
  }

  /**
   * The raw data of Lower Transport Layer PDU.
   */
  public abstract get transportPdu(): Data;

  protected abstract $upperTransportPdu: Data;
  /**
   * The raw data of Upper Transport Layer PDU.
   */
  public get upperTransportPdu(): Data {
    return this.$upperTransportPdu;
  }
}
