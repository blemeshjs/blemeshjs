import { Data, IvIndex, KeyRefreshPhase } from "@mesh-link-js/utils";
import { NetworkBeaconPdu } from "./network-beacon-pdu.js";
import { NetworkKey } from "../../mesh-models/network-key.js";
import { BeaconType } from "./beacon-pdu.js";
import { Crypto } from "@mesh-link-js/crypto";
import { uint8ArrayToHex } from "uint8array-extras";

export class PrivateBeacon extends NetworkBeaconPdu {
  public constructor(
    protected $pdu: Data,
    protected $networkKey: NetworkKey,
    protected $validForKeyRefreshProcedure: boolean,
    protected $keyRefreshFlag: boolean,
    protected $ivIndex: IvIndex,
    protected $beaconType: BeaconType = BeaconType.private,
  ) {
    super();
  }

  /**
   * Creates Private beacon PDU object from received PDU.
   *
   * @param pdu The data received from mesh network.
   * @param networkKey The Network Key to validate the beacon.
   * @returns The beacon object, or `undefined` if the data are invalid.
   */
  public static decode(pdu: Data, networkKey: NetworkKey): PrivateBeacon | undefined {
    if (!(pdu.length === 27 && pdu[0] === 2)) {
      return undefined;
    }

    // Try to decode and authenticate the Private beacon using current Private Beacon Key.
    let privateBeaconData = Crypto.decodeAndAuthenticate(pdu, networkKey.keys.privateBeaconKey);

    // If the beacon failed to be authenticated, and the old key exists, use that one.
    // During Key Refresh Procedure when in Phase 1 (key distribution) the
    // Private beacon may be decoded using the old Network Key.
    if (
      typeof privateBeaconData !== "undefined" &&
      KeyRefreshPhase.keyDistribution === networkKey.phase &&
      typeof networkKey.oldKeys !== "undefined"
    ) {
      privateBeaconData = Crypto.decodeAndAuthenticate(pdu, networkKey.oldKeys.privateBeaconKey);
    }

    // If the beacon still failed to be authenticated, discard it.
    if (typeof privateBeaconData === "undefined") {
      return undefined;
    }

    // The beacon is authenticated.
    return new PrivateBeacon(
      pdu,
      networkKey,
      typeof networkKey.oldKey !== "undefined",
      privateBeaconData.keyRefreshFlag,
      privateBeaconData.ivIndex,
    );
  }

  toString(): string {
    return `Private beacon (Network ID: ${uint8ArrayToHex(this.networkKey.networkId)}, ${this.ivIndex}, Key Refresh Flag: ${this.keyRefreshFlag})`;
  }
}
