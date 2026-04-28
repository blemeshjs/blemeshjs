import { UInt8 } from "@blemeshjs/utils";
import { InputOobActions, OobType, OutputOobActions } from "./oob.js";
import { PublicKeyType } from "./public-key.js";
import { Algorithms } from "./algorithm.js";
import { ProvisioningPdu } from "./provisioning-pdu.js";

/**
 * The device sends this PDU to indicate its supported provisioning
 * capabilities to a Provisioner.
 */
export interface ProvisioningCapabilities {
  /**
   * Number of elements supported by the device.
   */
  numberOfElements: UInt8;
  /**
   * Supported algorithms and other capabilities.
   */
  algorithms: Algorithms;
  /**
   * Supported public key types.
   */
  publicKeyType: PublicKeyType;
  /**
   * Supported static OOB Types.
   */
  oobType: OobType;
  /**
   * Maximum supported size of Output OOB value.
   */
  outputOobSize: UInt8;
  /**
   * Supported Output OOB Actions.
   */
  outputOobActions: OutputOobActions;
  /**
   * Maximum supported size of Input OOB value.
   */
  inputOobSize: UInt8;
  /**
   * Supported Input OOB Actions.
   */
  inputOobActions: InputOobActions;
}
export namespace ProvisioningCapabilities {
  export function toString(capabilities: ProvisioningCapabilities): string {
    return `Number of elements: ${capabilities.numberOfElements}
        Algorithms: ${capabilities.algorithms}
        Public Key Type: ${capabilities.publicKeyType}
        OOB Type: ${capabilities.oobType}
        Output OOB Size: ${capabilities.outputOobSize}
        Output OOB Actions: ${capabilities.outputOobActions}
        Input OOB Size: ${capabilities.inputOobSize}
        Input OOB Actions: ${capabilities.inputOobActions}
        `;
  }
  export function fromProvisioningPdu(pdu: ProvisioningPdu): ProvisioningCapabilities {
    return {
      numberOfElements: pdu[1],
      algorithms: Algorithms.fromData(pdu, 2),
      publicKeyType: PublicKeyType.fromData(pdu, 4),
      oobType: OobType.fromData(pdu, 5),
      outputOobSize: pdu[6],
      outputOobActions: OutputOobActions.fromData(pdu, 7),
      inputOobSize: pdu[9],
      inputOobActions: InputOobActions.fromData(pdu, 10),
    };
  }
}
