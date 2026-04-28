import { Data } from "@blemeshjs/utils";

export enum BeaconType {
  unprovisionedDevice = 0,
  secureNetwork = 1,
  private = 2,
}

export abstract class BeaconPdu {
  /**
   * Raw PDU data.
   */
  protected abstract $pdu: Data;
  public get pdu(): Data {
    return this.$pdu;
  }
  /**
   * The beacon type.
   */
  protected abstract $beaconType: BeaconType;
  public get beaconType(): BeaconType {
    return this.$beaconType;
  }
}
