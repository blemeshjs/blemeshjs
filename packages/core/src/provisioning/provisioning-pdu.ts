import { Algorithm, Data, isEnumCase } from "@mesh-link-js/utils";
import { AuthenticationMethod } from "./oob.js";
import { PublicKeyMethod } from "./public-key.js";
import { ProvisioningError, RemoteProvisioningError } from "./provisioning-state.js";
import { concatUint8Arrays, uint8ArrayToHex } from "uint8array-extras";
import { ProvisioningCapabilities } from "./provisioning-capabilities.js";

/**
 * The Provisioning Pdu.
 */
export type ProvisioningPdu = Data;

export namespace ProvisioningPdu {
  /**
   * Returns the PDU type from the Provisioning PDU, or `nil` if the PDU is
   * empty, or the type is not supported.
   */
  export function type(pdu: ProvisioningPdu): ProvisioningPduType | undefined {
    if (pdu.length === 0) return;
    const pduType = ProvisioningPduType.from(pdu[0]);
    if (typeof pduType === "undefined") return;
    return pduType;
  }
  /**
   * Checks whether the PDU is valid and supported.
   *
   * Validation is performed only based no length.
   */
  export function isValid(pdu: ProvisioningPdu): boolean {
    const type = ProvisioningPdu.type(pdu);
    switch (type) {
      case undefined:
        return false;
      case ProvisioningPduType.invite:
      case ProvisioningPduType.failed:
        return pdu.length === 1 + 1;
      case ProvisioningPduType.capabilities:
        return pdu.length === 1 + 11;
      case ProvisioningPduType.start:
        return pdu.length === 1 + 5;
      case ProvisioningPduType.publicKey:
        return pdu.length === 1 + 32 + 32;
      case ProvisioningPduType.inputComplete:
      case ProvisioningPduType.complete:
        return pdu.length === 1 + 0;
      case ProvisioningPduType.confirmation:
      case ProvisioningPduType.random:
        return pdu.length === 1 + 16 || pdu.length === 1 + 32;
      case ProvisioningPduType.data:
        return pdu.length === 1 + 25 + 8;
    }
  }
}

/**
 * Provisioning PDU Type.
 */
export enum ProvisioningPduType {
  /**
   * A Provisioner sends a Provisioning Invite PDU to indicate to the intended
   * Provisionee that the provisioning process is starting.
   */
  invite = 0,
  /**
   * The Provisionee sends a Provisioning Capabilities PDU to indicate its
   * supported provisioning capabilities to a Provisioner.
   */
  capabilities = 1,
  /**
   * A Provisioner sends a Provisioning Start PDU to indicate the method it
   * has selected from the options in the Provisioning Capabilities PDU.
   */
  start = 2,
  /**
   * The Provisioner sends a Provisioning Public Key PDU to deliver the
   * public key to be used in the ECDH calculations.
   */
  publicKey = 3,
  /**
   * The Provisionee sends a Provisioning Input Complete PDU when the user
   * completes the input operation.
   */
  inputComplete = 4,
  /**
   * The Provisioner or the Provisionee sends a Provisioning Confirmation PDU
   * to its peer to confirm the values exchanged so far, including the
   * OOB Authentication value and the random number that has yet to be exchanged.
   */
  confirmation = 5,
  /**
   * The Provisioner or the Provisionee sends a Provisioning Random PDU to
   * enable its peer device to validate the confirmation.
   */
  random = 6,
  /**
   * The Provisioner sends a Provisioning Data PDU to deliver provisioning
   * data to a Provisionee.
   */
  data = 7,
  /**
   * The Provisionee sends a Provisioning Complete PDU to indicate that it
   * has successfully received and processed the provisioning data.
   */
  complete = 8,
  /**
   * The Provisionee sends a Provisioning Failed PDU if it fails to process
   * a received provisioning protocol PDU.
   */
  failed = 9,
}

export namespace ProvisioningPduType {
  export function from(value: number): ProvisioningPduType | undefined {
    return isEnumCase(value, ProvisioningPduType) ? value : undefined;
  }
}

export interface InvitePdu {
  type: ProvisioningPduType.invite;
  attentionTimer: number;
}

export interface StartPdu {
  type: ProvisioningPduType.start;
  algorithm: Algorithm;
  publicKey: PublicKeyMethod;
  authenticationMethod: AuthenticationMethod;
}

export interface PublicKeyPdu {
  type: ProvisioningPduType.publicKey;
  key: Data;
}

export interface ConfirmationPdu {
  type: ProvisioningPduType.confirmation;
  data: Data;
}

export interface RandomPdu {
  type: ProvisioningPduType.random;
  data: Data;
}

export interface DataPdu {
  type: ProvisioningPduType.data;
  encryptedDataWithMic: Data;
}

export type ProvisioningRequest =
  | InvitePdu
  | StartPdu
  | PublicKeyPdu
  | ConfirmationPdu
  | RandomPdu
  | DataPdu;

export namespace ProvisioningRequest {
  export function publicKey(key: Data): PublicKeyPdu {
    return { type: ProvisioningPduType.publicKey, key };
  }
  export function start(
    algorithm: Algorithm,
    publicKey: PublicKeyMethod,
    authenticationMethod: AuthenticationMethod,
  ): StartPdu {
    return {
      type: ProvisioningPduType.start,
      algorithm,
      publicKey,
      authenticationMethod,
    };
  }
  export function confirmation(data: Data): ConfirmationPdu {
    return { type: ProvisioningPduType.confirmation, data };
  }
  export function invite(attentionTimer: number): InvitePdu {
    return { type: ProvisioningPduType.invite, attentionTimer };
  }
  export function random(data: Data): RandomPdu {
    return { type: ProvisioningPduType.random, data };
  }

  export function data(encryptedDataWithMic: Data): DataPdu {
    return { type: ProvisioningPduType.data, encryptedDataWithMic };
  }

  export function toString(request: ProvisioningRequest): string {
    switch (request.type) {
      case ProvisioningPduType.invite:
        return `Provisioning Invite (attention timer: ${request.attentionTimer} sec)`;
      case ProvisioningPduType.start:
        return `Provisioning Start (algorithm: ${request.algorithm}, public key: ${request.publicKey}, authentication method: ${request.authenticationMethod})`;
      case ProvisioningPduType.publicKey:
        return `Provisioner Public Key (0x${uint8ArrayToHex(request.key)})`;
      case ProvisioningPduType.confirmation:
        return `Provisioner Confirmation (0x${uint8ArrayToHex(request.data)})`;
      case ProvisioningPduType.random:
        return `Provisioner Random (0x${uint8ArrayToHex(request.data)})`;
      case ProvisioningPduType.data:
        return `Encrypted Provisioning Data (0x${uint8ArrayToHex(request.encryptedDataWithMic)})`;
    }
  }

  export function fromProvisioningPdu(pdu: Uint8Array): ProvisioningRequest | ProvisioningError {
    const type = isEnumCase(pdu[0], ProvisioningPduType)
      ? (pdu[0] as ProvisioningPduType)
      : undefined;
    switch (type) {
      case ProvisioningPduType.invite:
        return { type, attentionTimer: pdu[1] };
      case ProvisioningPduType.start:
        const algorithm = Algorithm.from(pdu.slice(1, 2));
        const publicKey = PublicKeyMethod.from(pdu.slice(2, 3));
        const authenticationMethod = AuthenticationMethod.fromProvisioningPdu(pdu.slice(3, 4));
        if (
          typeof algorithm === "undefined" ||
          typeof publicKey === "undefined" ||
          typeof authenticationMethod === "undefined"
        )
          return ProvisioningError.invalidPdu;
        return {
          type,
          algorithm,
          publicKey,
          authenticationMethod,
        };
      case ProvisioningPduType.publicKey:
        return { type, key: pdu.slice(1) };
      case ProvisioningPduType.confirmation:
        return { type, data: pdu.slice(1) };
      case ProvisioningPduType.random:
        return { type, data: pdu.slice(1) };
      case ProvisioningPduType.data:
        return { type, encryptedDataWithMic: pdu.slice(1) };
      default:
        return ProvisioningError.invalidPdu;
    }
  }

  export function pdu(req: ProvisioningRequest): Data {
    switch (req.type) {
      case ProvisioningPduType.invite:
        return new Uint8Array([req.type, req.attentionTimer]);
      case ProvisioningPduType.start:
        return concatUint8Arrays([
          new Uint8Array([req.type, Algorithm.value(req.algorithm), req.publicKey]),
          AuthenticationMethod.value(req.authenticationMethod),
        ]);
      case ProvisioningPduType.publicKey:
        return concatUint8Arrays([new Uint8Array([req.type]), req.key]);
      case ProvisioningPduType.confirmation:
        return concatUint8Arrays([new Uint8Array([req.type]), req.data]);
      case ProvisioningPduType.random:
        return concatUint8Arrays([new Uint8Array([req.type]), req.data]);
      case ProvisioningPduType.data:
        return concatUint8Arrays([new Uint8Array([req.type]), req.encryptedDataWithMic]);
    }
  }
}

/**
 * The Provisionee sends a Provisioning Capabilities PDU to indicate its
 * supported provisioning capabilities to a Provisioner.
 */
export interface Capabilities {
  type: ProvisioningPduType.capabilities;
  capabilities: ProvisioningCapabilities;
}
/**
 * The Provisionee sends a Provisioning Input Complete PDU when the user
 * completes the input operation.
 */
export interface InputComplete {
  type: ProvisioningPduType.inputComplete;
}
/**
 * The Provisioner sends a Provisioning Public Key PDU to deliver the
 * public key to be used in the ECDH calculations.
 */
export interface PublicKey {
  type: ProvisioningPduType.publicKey;
  key: Data;
}
/**
 * The Provisioner or the Provisionee sends a Provisioning Confirmation PDU
 * to its peer to confirm the values exchanged so far, including the
 * OOB Authentication value and the random number that has yet to be exchanged.
 */
export interface Confirmation {
  type: ProvisioningPduType.confirmation;
  data: Data;
}
/**
 * The Provisioner or the Provisionee sends a Provisioning Random PDU to
 * enable its peer device to validate the confirmation.
 */
export interface Random {
  type: ProvisioningPduType.random;
  data: Data;
}
/**
 * The Provisionee sends a Provisioning Complete PDU to indicate that it
 * has successfully received and processed the provisioning data.
 */
export interface Complete {
  type: ProvisioningPduType.complete;
}
/**
 * The Provisionee sends a Provisioning Failed PDU if it fails to process
 * a received provisioning protocol PDU.
 */
export interface Failed {
  type: ProvisioningPduType.failed;
  error: RemoteProvisioningError;
}

export type ProvisioningResponse =
  | Failed
  | Capabilities
  | InputComplete
  | PublicKey
  | Confirmation
  | Random
  | Complete;

export namespace ProvisioningResponse {
  export const inputComplete: InputComplete = {
    type: ProvisioningPduType.inputComplete,
  };
  export const random = (data: Data): Random => ({
    type: ProvisioningPduType.random,
    data,
  });
  export const confirmation = (data: Data): Confirmation => ({
    type: ProvisioningPduType.confirmation,
    data,
  });
  export const publicKey = (data: Data): PublicKey => ({
    type: ProvisioningPduType.publicKey,
    key: data,
  });
  export const capabilities = (capabilities: ProvisioningCapabilities): Capabilities => ({
    type: ProvisioningPduType.capabilities,
    capabilities,
  });
  export const complete: Complete = { type: ProvisioningPduType.complete };
  export const failed = (error: RemoteProvisioningError): Failed => ({
    type: ProvisioningPduType.failed,
    error,
  });

  export function fromProvisioningPdu(
    pdu: ProvisioningPdu,
  ): ProvisioningResponse | ProvisioningError {
    const pduType = ProvisioningPdu.type(pdu);
    if (typeof pduType === "undefined" || !ProvisioningPdu.isValid(pdu))
      return ProvisioningError.invalidPdu;
    switch (pduType) {
      case ProvisioningPduType.capabilities:
        const capabilities = ProvisioningCapabilities.fromProvisioningPdu(pdu);
        if (typeof capabilities === "undefined") return ProvisioningError.invalidPdu;
        return ProvisioningResponse.capabilities(capabilities);
      case ProvisioningPduType.inputComplete:
        return ProvisioningResponse.inputComplete;
      case ProvisioningPduType.publicKey:
        return ProvisioningResponse.publicKey(pdu.slice(1));
      case ProvisioningPduType.confirmation:
        return ProvisioningResponse.confirmation(pdu.slice(1));
      case ProvisioningPduType.random:
        return ProvisioningResponse.random(pdu.slice(1));
      case ProvisioningPduType.complete:
        return ProvisioningResponse.complete;
      case ProvisioningPduType.failed:
        const error = RemoteProvisioningError.fromRawValue(pdu[1]);
        if (typeof error === "undefined") return ProvisioningError.invalidPdu;
        return ProvisioningResponse.failed(error);
      default:
        return ProvisioningError.invalidPdu;
    }
  }
  export function toString(resp: ProvisioningResponse): string {
    switch (resp.type) {
      case ProvisioningPduType.capabilities:
        return `Device Capabilities: ${ProvisioningCapabilities.toString(resp.capabilities)}`;
      case ProvisioningPduType.inputComplete:
        return "Input Complete";
      case ProvisioningPduType.publicKey:
        return `Device Public Key (0x${uint8ArrayToHex(resp.key)})`;
      case ProvisioningPduType.confirmation:
        return `Device Confirmation (0x${uint8ArrayToHex(resp.data)})`;
      case ProvisioningPduType.random:
        return `Device Random (0x${uint8ArrayToHex(resp.data)})`;
      case ProvisioningPduType.complete:
        return "Complete";
      case ProvisioningPduType.failed:
        return `Error: ${resp.error}`;
    }
  }
}
