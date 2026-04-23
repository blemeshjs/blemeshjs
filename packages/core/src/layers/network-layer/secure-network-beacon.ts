import { Data, IvIndex, KeyRefreshPhase } from "@mesh-link-js/utils";
import { BeaconType } from "./beacon-pdu.js";
import { NetworkKey } from "../../mesh-models/network-key.js";
import { areUint8ArraysEqual, uint8ArrayToHex } from "uint8array-extras";
import { Crypto } from "@mesh-link-js/crypto";
import { NetworkBeaconPdu } from "./network-beacon-pdu.js";

export class SecureNetworkBeacon extends NetworkBeaconPdu {
  constructor(
    public $pdu: Data,
    protected $networkKey: NetworkKey,
    protected $validForKeyRefreshProcedure: boolean,
    protected $keyRefreshFlag: boolean,
    protected $ivIndex: IvIndex,
    protected $beaconType: BeaconType = BeaconType.secureNetwork,
  ) {
    super();
  }

  /**
   * Creates Secure Network beacon PDU object from received PDU.
   *
   * - parameters:
   *   - pdu: The data received from mesh network.
   *   - networkKey: The Network Key to validate the beacon.
   * - returns: The beacon object, or `nil` if the data are invalid.
   */
  public static decode(pdu: Data, networkKey: NetworkKey): SecureNetworkBeacon | undefined {
    if (!(pdu.length === 22 && pdu[0] == 1)) {
      return undefined;
    }
    const keyRefreshFlag = (pdu[1] & 0x01) !== 0;
    const updateActive = (pdu[1] & 0x02) !== 0;
    const networkId = pdu.slice(2, 10);
    const index = new DataView(pdu.buffer, pdu.byteOffset, pdu.byteLength).getUint32(10, false);
    const ivIndex = new IvIndex(index, updateActive);

    // Authenticate beacon using given Network Key.
    // During Key Refresh Procedure when in Phase 1 (key distribution) the
    // Secure Network beacon may be decoded using the old Network Key.
    if (areUint8ArraysEqual(networkId, networkKey.networkId)) {
      if (!Crypto.authenticate(pdu, networkKey.keys.beaconKey)) {
        return undefined;
      }
      return new SecureNetworkBeacon(
        pdu,
        networkKey,
        typeof networkKey.oldKey !== "undefined",
        keyRefreshFlag,
        ivIndex,
      );
    } else if (
      KeyRefreshPhase.keyDistribution === networkKey.phase &&
      typeof networkKey.oldNetworkId !== "undefined" &&
      areUint8ArraysEqual(networkId, networkKey.oldNetworkId) &&
      typeof networkKey.oldKeys !== "undefined"
    ) {
      if (!Crypto.authenticate(pdu, networkKey.oldKeys.beaconKey)) {
        return undefined;
      }
      return new SecureNetworkBeacon(pdu, networkKey, false, keyRefreshFlag, ivIndex);
    } else {
      return undefined;
    }
  }

  toString(): string {
    return `Secure Network beacon (Network ID: ${uint8ArrayToHex(this.networkKey.networkId)}, ${this.ivIndex}, Key Refresh Flag: ${this.keyRefreshFlag})`;
  }
}
