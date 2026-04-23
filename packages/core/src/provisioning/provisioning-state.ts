import { BigUInt, Data, isEnumCase, UInt8 } from "@mesh-link-js/utils";
import { ProvisioningCapabilities } from "./provisioning-capabilities.js";
import Long from "long";
import { InputAction, OutputAction } from "./oob.js";

export enum ProvisioningStateType {
  ready,
  requestingCapabilities,
  capabilitiesReceived,
  provisioning,
  complete,
  failed,
}

/**
 * Provisioning Manager is ready to start.
 */
export type Ready = { type: ProvisioningStateType.ready };

/**
 * The manager is requesting Provisioning Capabilities from the device.
 */
export type RequestingCapabilities = {
  type: ProvisioningStateType.requestingCapabilities;
};

/**
 * Provisioning has been started.
 */
export type Provisioning = { type: ProvisioningStateType.provisioning };

/**
 * The provisioning process is complete.
 */
export type Complete = { type: ProvisioningStateType.complete };

/**
 * Provisioning Capabilities were received.
 */
export type CapabilitiesReceived = {
  type: ProvisioningStateType.capabilitiesReceived;
  capabilities: ProvisioningCapabilities;
};

/**
 * The provisioning has failed because of a local error.
 */
export type Failed = { type: ProvisioningStateType.failed; error: Error };

export type ProvisioningState =
  | Failed
  | CapabilitiesReceived
  | Complete
  | Provisioning
  | RequestingCapabilities
  | Ready;
export namespace ProvisioningState {
  export const provisioning: Provisioning = {
    type: ProvisioningStateType.provisioning,
  };
  export const ready: Ready = {
    type: ProvisioningStateType.ready,
  };
  export const complete: Complete = {
    type: ProvisioningStateType.complete,
  };

  export function failed(error: Error): Failed {
    return { type: ProvisioningStateType.failed, error };
  }

  export function capabilitiesReceived(
    capabilities: ProvisioningCapabilities,
  ): CapabilitiesReceived {
    return { type: ProvisioningStateType.capabilitiesReceived, capabilities };
  }

  export const requestingCapabilities: RequestingCapabilities = {
    type: ProvisioningStateType.requestingCapabilities,
  };

  export function toString(state: ProvisioningState): string {
    switch (state.type) {
      case ProvisioningStateType.ready:
        return "Provisioner is ready";
      case ProvisioningStateType.requestingCapabilities:
        return "Requesting Provisioning Capabilities";
      case ProvisioningStateType.capabilitiesReceived:
        return "Provisioning Capabilities received";
      case ProvisioningStateType.provisioning:
        return "Provisioning started";
      case ProvisioningStateType.complete:
        return "Provisioning complete";
      case ProvisioningStateType.failed:
        return `Provisioning failed: ${state.error.message}`;
      default:
        return "Unknown state";
    }
  }
}

/**
 * A set of authentication actions aiming to strengthen device provisioning
 * security.
 */
export type AuthAction =
  /**
   * The user shall provide 16 byte OOB Static Key.
   */
  | { action: "provideStaticKey"; callback: (data: Data) => void }
  /**
   * The user shall provide a number.
   */
  | {
      action: "provideNumeric";
      maximumNumberOfDigits: UInt8;
      outputAction: OutputAction;
      callback: (val: Long) => void;
    }
  /**
   * The user shall provide an alphanumeric text.
   */
  | {
      action: "provideAlphanumeric";
      maximumNumberOfCharacters: UInt8;
      callback: (text: string) => void;
    }
  /**
   * The application should display this number to the user.
   *
   * User should perform selected action given number of times,
   * or enter the number on the remote device.
   *
   * The `inputAction` will NOT be `InputAction.inputAlphanumeric`,
   * which is handled by `displayAlphanumeric()` case.
   */
  | { action: "displayNumber"; value: BigUInt; inputAction: InputAction }
  /**
   * The application should display the text to the user.
   *
   * User should enter the text on the provisioning device.
   */
  | { action: "displayAlphanumeric"; text: string };

/**
 * Set of errors which may be thrown during provisioning a device.
 */
export class ProvisioningError extends Error {
  public readonly code: string;
  public readonly cause?: unknown;

  private constructor(code: string, cause?: unknown) {
    super(code);
    this.name = "ProvisioningError";
    this.code = code;
    this.cause = cause;
  }
  /**
   *
   * Thrown when the ProvisioningManager is in invalid state.
   */
  public static invalidState = new ProvisioningError("invalidState");
  /**
   * The received PDU is invalid.
   */
  public static invalidPdu = new ProvisioningError("invalidPdu");
  /**
   * The received Public Key is invalid or equal to Provisioner's Public Key.
   */
  public static invalidPublicKey = new ProvisioningError("invalidPublicKey");
  /**
   * Thrown when an unsupported algorithm has been selected for provisioning.
   */
  public static unsupportedAlgorithm = new ProvisioningError("unsupportedAlgorithm");
  /**
   * Thrown when the Unprovisioned Device is not supported by the manager.
   */
  public static unsupportedDevice = new ProvisioningError("unsupportedDevice");
  /**
   * Thrown when the provided alphanumeric value could not be converted into
   * bytes using ASCII encoding.
   */
  public static invalidOobValueFormat = new ProvisioningError("invalidOobValueFormat");
  /**
   * Thrown when no available Unicast Address was found in the Provisioner's
   * range that could be allocated for the device.
   */
  public static noAddressAvailable = new ProvisioningError("noAddressAvailable");
  /**
   * Throws when the Unicast Address has not been set.
   */
  public static addressNotSpecified = new ProvisioningError("addressNotSpecified");
  /**
   * Throws when the Network Key has not been set.
   */
  public static networkKeyNotSpecified = new ProvisioningError("networkKeyNotSpecified");
  /**
   * Thrown when confirmation value received from the device does not match
   * calculated value. Authentication failed.
   */
  public static confirmationFailed = new ProvisioningError("confirmationFailed");
  /**
   * Thrown when the remote device sent a failure indication.
   */
  public static remoteError(error: RemoteProvisioningError) {
    return new ProvisioningError("remoteError", error);
  }
  /**
   * Thrown when the key pair generation has failed.
   */
  public static keyGenerationFailed(error: Error) {
    return new ProvisioningError("keyGenerationFailed", error);
  }
}

/**
 * Set of errors which may be reported by an unprovisioned device
 * during provisioning process.
 */
export enum RemoteProvisioningError {
  /**
   * The provisioning protocol PDU is not recognized by the device.
   */
  invalidPdu = 1,
  /**
   * The arguments of the protocol PDUs are outside expected values
   * or the length of the PDU is different than expected.
   */
  invalidFormat = 2,
  /**
   * The PDU received was not expected at this moment of the procedure.
   */
  unexpectedPdu = 3,
  /**
   * The computed confirmation value was not successfully verified.
   */
  confirmationFailed = 4,
  /**
   * The provisioning protocol cannot be continued due to insufficient
   * resources in the device.
   */
  outOfResources = 5,
  /**
     * The Data block was not successfully decrypted.
     *
    decryptionFailed      = 6,
    /**
     * An unexpected error occurred that may not be recoverable.
     */
  unexpectedError = 7,
  /**
   * The device cannot assign consecutive unicast addresses to all elements.
   */
  cannotAssignAddresses = 8,
  /**
   * The Data block contains values that cannot be accepted because of
   * general constraints.
   */
  invalidData = 9,
}

export namespace RemoteProvisioningError {
  export function fromRawValue(value: number): RemoteProvisioningError | undefined {
    return isEnumCase(value, RemoteProvisioningError) ? value : undefined;
  }
}
