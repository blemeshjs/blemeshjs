import { Mixin } from "ts-mixer";
import {
  Data,
  StaticMeshResponse,
  TransitionStatusMessage,
  TransitionTime,
  UInt32,
} from "@blemeshjs/utils";
import { concatUint8Arrays } from "uint8array-extras";

export class GenericOnOffStatus extends Mixin(StaticMeshResponse, TransitionStatusMessage) {
  public static readonly opCode: UInt32 = 0x8204;
  public override opCode: UInt32 = 0x8204;

  public get parameters(): Data | undefined {
    const data = new Uint8Array([this.isOn ? 0x01 : 0x00]);
    if (this.targetState !== undefined && this.remainingTime !== undefined) {
      return concatUint8Arrays([
        data,
        new Uint8Array([this.targetState ? 0x01 : 0x00, this.remainingTime.rawValue]),
      ]);
    } else {
      return data;
    }
  }

  constructor(
    /**
     * The present state of Generic OnOff Server.
     */
    public isOn: boolean,
    public remainingTime: TransitionTime | undefined = undefined,
    /**
     * The target state of Generic OnOff Server.
     */
    public targetState?: boolean,
  ) {
    super();
  }

  /**
   * Creates the Generic OnOff Status message.
   *
   * @param isOn The current value of the Generic OnOff state.
   */
  public static fromIsOn(isOn: boolean) {
    return new GenericOnOffStatus(isOn);
  }

  /**
   * Creates the Generic OnOff Status message.
   *
   * @param isOn The current value of the Generic OnOff state.
   * @param targetState The target value of the Generic OnOff state.
   * @param remainingTime The time that an element will take to transition
   *                    to the target state from the present state.
   */
  public static withStateAndTime(
    isOn: boolean,
    targetState: boolean,
    remainingTime: TransitionTime,
  ) {
    return new GenericOnOffStatus(isOn, remainingTime, targetState);
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 1 && parameters.length !== 3) {
      return;
    }
    const isOn = parameters[0] === 0x01;
    if (parameters.length === 3) {
      const targetState = parameters[1] === 0x01;
      const remainingTime = TransitionTime.fromRawValue(parameters[2]);
      return new GenericOnOffStatus(isOn, remainingTime, targetState);
    } else {
      return new GenericOnOffStatus(isOn);
    }
  }

  public toString() {
    return `GenericOnOffStatus(isOn: ${this.isOn}, targetState: ${this.targetState}, remainingTime: ${this.remainingTime})`;
  }
}
