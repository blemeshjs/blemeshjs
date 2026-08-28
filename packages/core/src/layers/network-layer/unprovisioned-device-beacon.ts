import { CBUUID, Data, isEnumCase, OobInformation, readUInt16BE, UUID } from "@blemeshjs/utils";
import { BeaconPdu, BeaconType } from "./beacon-pdu.js";
import { uint8ArrayToHex } from "uint8array-extras";

export class UnprovisionedDeviceBeacon extends BeaconPdu {
  private constructor(
    public $pdu: Data,
    /**
     * Device UUID uniquely identifying this device.
     */
    public deviceUuid: UUID,
    /**
     * The OOB Information field is used to help drive the provisioning
     * process by indicating the availability of OOB data, such as
     * a public key of the device.
     */
    public oob: OobInformation,
    /**
     * Hash of the associated URI advertised with the URI AD Type.
     */
    public uriHash?: Data,
    public $beaconType: BeaconType = BeaconType.unprovisionedDevice,
  ) {
    super();
  }

  /**
   * Creates Unprovisioned Device beacon PDU object from received PDU.
   *
   * @param pdu The data received from mesh network.
   * @returns The beacon object, or `undefined` if the data are invalid.
   */
  public static decode(pdu: Data): UnprovisionedDeviceBeacon | undefined {
    if (!(pdu.length >= 19 && pdu[0] === 0)) {
      return undefined;
    }
    const cbuuid = new CBUUID(pdu.slice(1, 17));
    const oob = new OobInformation(readUInt16BE(pdu, 17));
    return new UnprovisionedDeviceBeacon(
      pdu,
      cbuuid.uuid,
      oob,
      pdu.length === 23 ? pdu.slice(19) : undefined,
    );
  }

  toString(): string {
    return `Unprovisioned Device beacon (UUID: ${this.deviceUuid.uuidString}, OOB Info: ${this.oob}, URI hash: ${typeof this.uriHash !== "undefined" ? uint8ArrayToHex(this.uriHash) : "None"})`;
  }
}

export class UnprovisionedDeviceBeaconDecoder {
  private constructor() {}

  /**
   * This method decodes the given pdu and creates an Unprovisioned Device Beacon.
   *
   * @param pdu The received PDU.
   * @returns The beacon object.
   */
  static decode(pdu: Data): UnprovisionedDeviceBeacon | undefined {
    if (pdu.length <= 1) return undefined;
    const beaconType = isEnumCase(pdu[0], BeaconType) ? pdu[0] : undefined;
    if (typeof beaconType === "undefined") return undefined;
    switch (beaconType) {
      case BeaconType.unprovisionedDevice:
        return UnprovisionedDeviceBeacon.decode(pdu);
      default:
        return undefined;
    }
  }
}
