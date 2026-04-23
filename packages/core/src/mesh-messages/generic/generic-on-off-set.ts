import { Mixin } from "ts-mixer";
import {
  Data,
  StaticAcknowledgedMeshMessage,
  TransactionMessage,
  TransitionMessage,
  TransitionTime,
  UInt32,
  UInt8,
} from "@mesh-link-js/utils";
import { GenericOnOffStatus } from "./generic-on-off-status.js";
import { concatUint8Arrays } from "uint8array-extras";

export class GenericOnOffSet extends Mixin(
  StaticAcknowledgedMeshMessage,
  TransactionMessage,
  TransitionMessage,
) {
  public static readonly opCode: UInt32 = 0x8202;
  public override opCode: UInt32 = 0x8202;
  public responseType = GenericOnOffStatus;

  public tid!: UInt8;

  public get parameters(): Data | undefined {
    const data = new Uint8Array([this.isOn ? 0x01 : 0x00, this.tid]);
    if (this.transitionTime !== undefined && this.delay !== undefined) {
      return concatUint8Arrays([data, new Uint8Array([this.transitionTime.rawValue, this.delay])]);
    } else {
      return data;
    }
  }

  /**
   * Creates the Generic OnOff Set message.
   *
   * @param isOn The target value of the Generic OnOff state.
   * @param transitionTime The time that an element will take to transition to the target state from the present state.
   * @param delay Message execution delay in 5 millisecond steps.
   */
  constructor(
    /**
     * The new state of Generic OnOff Server.
     */
    public isOn: boolean,

    public transitionTime: TransitionTime | undefined = undefined,
    public delay: UInt8 | undefined = undefined,
  ) {
    super();
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 2 && parameters.length !== 4) {
      return;
    }
    const message = new GenericOnOffSet(parameters[0] == 0x01);
    message.tid = parameters[1];
    if (parameters.length == 4) {
      message.transitionTime = TransitionTime.fromRawValue(parameters[2]);
      message.delay = parameters[3];
    }
    return message;
  }
}
