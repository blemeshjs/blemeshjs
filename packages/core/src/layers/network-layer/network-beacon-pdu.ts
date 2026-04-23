import { Data, IvIndex, timeIntervalSinceNow } from "@mesh-link-js/utils";
import { BeaconPdu } from "./beacon-pdu.js";
import { NetworkKey } from "../../mesh-models/network-key.js";
import Long from "long";

export abstract class NetworkBeaconPdu extends BeaconPdu {
  /**
   * The Network Key related to this beacon.
   */
  protected abstract $networkKey: NetworkKey;
  public get networkKey(): NetworkKey {
    return this.$networkKey;
  }
  /**
   * A flag indicating whether the beacon has been secured using the
   * new Network Key during Key Refresh Procedure.
   */
  protected abstract $validForKeyRefreshProcedure: boolean;
  public get validForKeyRefreshProcedure(): boolean {
    return this.$validForKeyRefreshProcedure;
  }
  /**
   * Key Refresh flag value.
   *
   * When this flag is active, the Node shall set the Key Refresh
   * Phase for this Network Key to `KeyRefreshPhase.usingNewKeys`.
   *
   * When in this phase:
   * * the Node shall only transmit messages and beacons using the new keys,
   * * shall receive messages using the old keys and the new keys,
   * * shall only receive Secure Network and Private beacons secured using
   *   the new Network Key.
   */
  protected abstract $keyRefreshFlag: boolean;
  public get keyRefreshFlag(): boolean {
    return this.$keyRefreshFlag;
  }
  /**
   * The IV Index carried by this beacon.
   */
  protected abstract $ivIndex: IvIndex;
  public get ivIndex() {
    return this.$ivIndex;
  }
  /**
   * Creates beacon PDU object from received PDU.
   *
   * @param pdu The data received from mesh network.
   * @param networkKey The Network Key to validate the beacon.
   * @returns The beacon object, or `undefined` if the data are invalid.
   */
  static decode(_pdu: Data, _networkKey: NetworkKey): NetworkBeaconPdu | undefined {
    throw new Error("Method not implemented.");
  }

  /**
   * This method returns whether the received network beacon can override the current IV Index.
   *
   * The following restrictions apply:
   * 1. Normal Operation state must last for at least 96 hours.
   * 2. IV Update In Progress state must take at least 96 hours and may not be longer than 144h.
   * 3. IV Index must not decrease.
   * 4. If received Secure Network beacon or Private beacon has IV Index greater than current
   *    IV Index + 1, the device will go into IV Index Recovery procedure. In this state,
   *    the 96h rule does not apply and the IV Index or IV Update Active flag may change before 96 hours.
   * 5. If received Secure Network beacon or Private beacon has IV Index greater than current
   *    IV Index + 42, the beacon should be ignored (unless a setting
   *    `MeshNetworkManager.ivUpdateTestMode` is set to disable this rule).
   * 6. The node shall not execute more than one IV Index Recovery within a period of 192 hours.
   *
   * @param target The IV Index to compare.
   * @param date The date of the most recent transition to the current IV Index.
   * @param ivRecoveryActive True if the IV Recovery procedure was used to restore the IV Index on the previous connection.
   * @param ivTestMode True, if IV Update test mode is enabled; false otherwise.
   * @param ivRecoveryOver42Allowed Whether the IV Index Recovery procedure should be limited to allow maximum increase of IV Index by 42.
   * @returns True, if the network information can be applied; false otherwise.
   * @see: Bluetooth Mesh Profile 1.0.1, section 3.10.5.
   */
  public canOverwrite(
    target: IvIndex,
    date: Date | undefined,
    ivRecoveryActive: boolean,
    testMode: boolean,
    ivRecoveryOver42Allowed: boolean,
  ): boolean {
    // IV Index must increase, or, in case it's equal to the current one,
    // the IV Update Active flag must change from true to false.
    // The new index must not be greater than the current one + 42,
    // unless this rule is disabled.
    if (
      !(
        (this.ivIndex.index > target.index &&
          (ivRecoveryOver42Allowed || this.ivIndex.index <= target.index + 42)) ||
        (this.ivIndex.index === target.index && (target.updateActive || !this.ivIndex.updateActive))
      )
    ) {
      return false;
    }

    if (typeof date !== "undefined") {
      // Let's define a "state" as a pair of IV and IV Update Active flag.
      // "States" change as follows:
      // 1. IV = X,   IVUA = false (Normal Operation)
      // 2. IV = X+1, IVUA = true  (Update In Progress)
      // 3. IV = X+1, IVUA = false (Normal Operation)
      // 4. IV = X+2, IVUA = true  (Update In Progress)
      // 5. ...

      // Calculate number of states between the state defined by the target
      // IV Index and this Secure Network Beacon.
      const stateDiff = Long.fromNumber(this.ivIndex.index - target.index)
        .mul(2)
        .sub(1)
        .add(target.updateActive ? 1 : 0)
        .add(this.ivIndex.updateActive ? 0 : 1)
        .sub(
          ivRecoveryActive || testMode ? 1 : 0, // this may set stateDiff = -1
        );

      // Each "state" must last for at least 96 hours.
      // Calculate the minimum number of hours that had to pass since last state
      // change for the beacon to be assumed valid.
      // If more has passed, it's also valid, as Normal Operation has no maximum
      // time duration.
      const numberOfHoursRequired = stateDiff.mul(96);

      // Get the number of hours since the state changed last time.
      const numberOfHoursSinceDate = Long.fromNumber(-timeIntervalSinceNow(date.getTime()) / 3600);

      // The node shall not execute more than one IV Index Recovery within a
      // period of 192 hours.
      if (ivRecoveryActive && stateDiff.gt(1) && numberOfHoursSinceDate.lt(192)) {
        return false;
      }

      return numberOfHoursSinceDate.gte(numberOfHoursRequired);
    }
    return true;
  }
}
