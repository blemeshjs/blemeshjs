import { Data, isEnumCase } from "@mesh-link-js/utils";
import { MeshNetwork } from "../../mesh-models/mesh-network.js";
import { BeaconType } from "./beacon-pdu.js";
import { NetworkBeaconPdu } from "./network-beacon-pdu.js";
import { PrivateBeacon } from "./private-beacon.js";
import { SecureNetworkBeacon } from "./secure-network-beacon.js";

export class NetworkBeaconDecoder {
  private constructor() {}

  /**
   * This method goes over all Network Keys in the mesh network and tries
   * to parse the beacon.
   *
   * @param pdu The received PDU.
   * @param meshNetwork The mesh network for which the PDU should be decoded.
   * @returns The beacon object.
   */
  static decode(pdu: Data, meshNetwork: MeshNetwork): NetworkBeaconPdu | undefined {
    const beaconType = isEnumCase(pdu[0], BeaconType) ? pdu[0] : undefined;
    if (!(pdu.length > 1 && typeof beaconType !== "undefined")) {
      return undefined;
    }
    switch (beaconType) {
      case BeaconType.secureNetwork:
        for (const networkKey of meshNetwork.networkKeys) {
          const beacon = SecureNetworkBeacon.decode(pdu, networkKey);
          if (typeof beacon !== "undefined") {
            return beacon;
          }
        }
        return undefined;
      case BeaconType.private:
        for (const networkKey of meshNetwork.networkKeys) {
          const beacon = PrivateBeacon.decode(pdu, networkKey);
          if (typeof beacon !== "undefined") {
            return beacon;
          }
        }
        return undefined;
      default:
        return undefined;
    }
  }
}
