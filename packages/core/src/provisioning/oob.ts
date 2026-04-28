import {
  BigUInt,
  Data,
  Int32,
  isEnumCase,
  OptionSet,
  readUInt16BE,
  UInt16,
  UInt8,
} from "@blemeshjs/utils";
import { ProvisioningPdu } from "./provisioning-pdu.js";

/**
 * A set of supported Input Out-of-band actions.
 */
export class InputOobActions extends OptionSet<UInt16> {
  public static push = new InputOobActions(1 << 0);
  public static twist = new InputOobActions(1 << 1);
  public static inputNumeric = new InputOobActions(1 << 2);
  public static inputAlphanumeric = new InputOobActions(1 << 3);

  static fromData(data: Data, offset: Int32) {
    return new InputOobActions(readUInt16BE(data, offset));
  }

  public toString(): string {
    if (this.rawValue === 0) {
      return "None";
    }
    return (
      [
        [InputOobActions.push, "Push"],
        [InputOobActions.twist, "Twist"],
        [InputOobActions.inputNumeric, "Input Numeric"],
        [InputOobActions.inputAlphanumeric, "Input Alphanumeric"],
      ] as Array<[InputOobActions, string]>
    )
      .map(([option, name]) => (this.contains(option.rawValue) ? name : undefined))
      .filter((name): name is string => name !== undefined)
      .join(", ");
  }
}

/**
 * A set of supported Output Out-of-band actions.
 */
export class OutputOobActions extends OptionSet<UInt16> {
  public static blink = new OutputOobActions(1 << 0);
  public static beep = new OutputOobActions(1 << 1);
  public static vibrate = new OutputOobActions(1 << 2);
  public static outputNumeric = new OutputOobActions(1 << 3);
  public static outputAlphanumeric = new OutputOobActions(1 << 4);

  static fromData(data: Data, offset: Int32) {
    return new OutputOobActions(readUInt16BE(data, offset));
  }

  public toString(): string {
    if (this.rawValue === 0) {
      return "None";
    }
    return (
      [
        [OutputOobActions.blink, "Blink"],
        [OutputOobActions.beep, "Beep"],
        [OutputOobActions.vibrate, "Vibrate"],
        [OutputOobActions.outputNumeric, "Output Numeric"],
        [OutputOobActions.outputAlphanumeric, "Output Alphanumeric"],
      ] as Array<[OutputOobActions, string]>
    )
      .map(([option, name]) => (this.contains(option.rawValue) ? name : undefined))
      .filter((name) => name !== undefined)
      .join(", ");
  }
}

/**
 * A set of supported Out-Of-Band types.
 */
export class OobType extends OptionSet<UInt8> {
  /**
   * Static OOB Information is available.
   */
  public static staticOobInformationAvailable = new OobType(1 << 0);
  /**
   * Only OOB authenticated provisioning supported.
   */
  public static onlyOobAuthenticatedProvisioningSupported = new OobType(1 << 1);

  public toString(): string {
    if (this.rawValue == 0) {
      return "None";
    }
    return (
      [
        [OobType.staticOobInformationAvailable, "Static OOB Information Available"],
        [
          OobType.onlyOobAuthenticatedProvisioningSupported,
          "Only OOB Authenticated Provisioning Supported",
        ],
      ] as Array<[OobType, string]>
    )
      .map(([option, name]) => (this.contains(option.rawValue) ? name : undefined))
      .filter((name) => name !== undefined)
      .join(", ");
  }
}

/**
 * Available output actions to be performed during provisioning.
 *
 * For example,if the Unprovisioned Device is a light, then it would blink random
 * number of times. That number should be provided to
 * `ProvisioningDelegate.authenticationActionRequired()`.
 */
export enum OutputAction {
  blink = 0,
  beep = 1,
  vibrate = 2,
  outputNumeric = 3,
  outputAlphanumeric = 4,
}
export namespace OutputAction {
  export function fromRawValue(value: UInt8): OutputAction | undefined {
    if (isEnumCase(value, OutputAction)) return value;
    return;
  }
}

/**
 * Available input actions to be performed during provisioning.
 *
 * For example, if the unprovisioned device is a light switch, then it would allow
 * the user to input the random number by pressing a button an appropriate number
 * of times. When the action is complete, `ProvisioningDelegate.inputComplete()`
 * will be called.
 */
export enum InputAction {
  push = 0,
  twist = 1,
  inputNumeric = 2,
  inputAlphanumeric = 3,
}
export namespace InputAction {
  export function fromRawValue(value: UInt8): InputAction | undefined {
    if (isEnumCase(value, InputAction)) return value;
    return;
  }
}

export enum AuthenticationMethodType {
  /**
   * No OOB authentication.
   *
   * WARN: This method is considered not secure.
   */
  noOob,
  /**
   * Static OOB authentication.
   *
   * User will be asked to provide 16 or 32 byte hexadecimal value.
   * The value can be read from the device, QR code, website, etc.
   * See `UnprovisionedDevice.oobInformation` for location.
   */
  staticOob,
  /**
   * OOB authentication.
   *
   * The Provisionee will signal a random value using specified method.
   * The value should be provided during provisioning using
   * `ProvisioningDelegate.authenticationActionRequired()`.
   *
   * @param action The chosen action.
   * @param size Number of digits or letters that can be output (e.g., displayed or spoken). Size must be in range 1...32.
   */
  outputOob,
  /**
   * Input OOB authentication.
   *
   * User need to input a value displayed on the Provisioner's screen on the
   * Unprovisioned Device. The value to display to the user will be given using
   * `ProvisioningDelegate.authenticationActionRequired()`.
   *
   * When user completes entering the value `ProvisioningDelegate.inputComplete()`
   * will be called.
   *
   * @param action The chosen input action.
   * @param size Number of digits or letters that can be entered. Size must be in range 1...32.
   */
  inputOob,
}

export interface NoOob {
  type: AuthenticationMethodType.noOob;
}

export interface StaticOob {
  type: AuthenticationMethodType.staticOob;
}

export interface OutputOob {
  type: AuthenticationMethodType.outputOob;
  action: OutputAction;
  size: UInt8;
}
export interface InputOob {
  type: AuthenticationMethodType.inputOob;
  action: InputAction;
  size: UInt8;
}

/**
 * The authentication method chosen for provisioning.
 */
export type AuthenticationMethod = InputOob | OutputOob | StaticOob | NoOob;

export namespace AuthenticationMethod {
  export const noOob: AuthenticationMethod = {
    type: AuthenticationMethodType.noOob,
  };
  export function fromProvisioningPdu(pdu: ProvisioningPdu): AuthenticationMethod | undefined {
    const type = isEnumCase(pdu[3], AuthenticationMethodType) ? pdu[3] : undefined;
    switch (type) {
      case AuthenticationMethodType.noOob:
      case AuthenticationMethodType.staticOob:
        return { type };
      case AuthenticationMethodType.outputOob: {
        const outputAction = OutputAction.fromRawValue(pdu[4]);
        if (typeof outputAction === "undefined") return undefined;
        if (!(pdu[5] >= 1 && pdu[5] <= BigUInt.maxDecimalDigits)) return undefined;
        return { type, action: outputAction, size: pdu[5] };
      }
      case AuthenticationMethodType.inputOob: {
        const inputAction = InputAction.fromRawValue(pdu[4]);
        if (typeof inputAction === "undefined") return;
        if (!(pdu[5] >= 1 && pdu[5] <= BigUInt.maxDecimalDigits)) return;
        return { type, action: inputAction, size: pdu[5] };
      }
      default:
        return;
    }
  }
  export function value(method: AuthenticationMethod): Data {
    switch (method.type) {
      case AuthenticationMethodType.noOob:
        return new Uint8Array([0, 0, 0]);
      case AuthenticationMethodType.staticOob:
        return new Uint8Array([1, 0, 0]);
      case AuthenticationMethodType.outputOob:
        return new Uint8Array([2, method.action, method.size]);
      case AuthenticationMethodType.inputOob:
        return new Uint8Array([3, method.action, method.size]);
    }
  }
}
