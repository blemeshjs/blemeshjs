import { BindableTinyEmitter, Data, UInt8 } from "@blemeshjs/utils";
import { BearerDataHandler, BearerHandler } from "./bearer-handler.js";
import { Mixin } from "ts-mixer";
import { ProvisioningRequest } from "../provisioning/provisioning-pdu.js";
/**
 * The PDU Type identifies the type of the message.
 *
 * Bearers may use this type to set the proper value in the
 * payload. For ADV bearer it will be a proper AD Type (see Assigned
 * Numbers / Generic Access Profile), for GATT bearer the correct
 * Message type in the Proxy PDU.
 *
 * Some message types are handled only by some bearers,
 * for example the provisioning PDU type must be sent using a
 * Provisioning Bearer (PB type of bearer).
 */
export enum PduType {
  /**
   * The message is a Network PDU.
   *
   * See: Section 3.4.4 of Bluetooth Mesh Specification 1.0.1.
   */
  networkPdu = 0,
  /**
   * The message is a mesh beacon.
   *
   * See: Section 3.9 of Bluetooth Mesh Specification 1.0.1.
   */
  meshBeacon = 1,
  /**
   * The message is a proxy configuration message.
   *
   * This message type may be used only for GATT Bearer.
   *
   * See: Section 6.5 of Bluetooth Mesh Specification 1.0.1.
   */
  proxyConfiguration = 2,
  /**
   * The message is a Provisioning PDU.
   *
   * This message type may be used only in Provisioning Bearers (PB).
   *
   * See: Section 5.4.1 of Bluetooth Mesh Specification 1.0.1.
   */
  provisioningPdu = 3,
}

export namespace PduType {
  export const nonceId = (pduType: PduType): UInt8 => {
    switch (pduType) {
      case PduType.networkPdu:
        return 0x00;
      case PduType.proxyConfiguration:
        return 0x03;
      default:
        throw new Error(`Unsupported PDU Type: ${pduType}`);
    }
  };

  export const fromData = (data: Data): PduType | undefined => {
    if (data.length <= 0) {
      return undefined;
    }
    const value = data[0] & 0b00111111;
    switch (value) {
      case 0:
        return PduType.networkPdu;
      case 1:
        return PduType.meshBeacon;
      case 2:
        return PduType.proxyConfiguration;
      case 3:
        return PduType.provisioningPdu;
      default:
        return undefined;
    }
  };
}

/**
 * A transmitter is responsible for delivering messages to the mesh network.
 */
export abstract class Transmitter {
  /**
   * This method sends the given data over the bearer.
   *
   * Data longer than MTU will automatically be segmented if bearer
   * implements segmentation.
   *
   * @param parameter data The data to be sent over the Bearer.
   * @param parameter type The PDU type.
   * @throws This method throws an error if the PDU type is not supported, or data could not be sent for some other reason.
   */
  public abstract send(data: Data, type: PduType): void;
}

/**
 * A set of supported PDU types by the bearer object.
 */
export class PduTypes extends Number {
  /**
   * Set, if the bearer supports Network PDUs.
   */
  public static networkPdu = new PduTypes(1 << 0);
  /**
   * Set, if the bearer supports Mesh Beacons.
   */
  public static meshBeacon = new PduTypes(1 << 1);
  /**
   * Set, if the bearer supports proxy filter configuration.
   */
  public static proxyConfiguration = new PduTypes(1 << 2);
  /**
   * Set, if the bearer supports Provisioning PDUs.
   */
  public static provisioningPdu = new PduTypes(1 << 3);

  private constructor(value: UInt8) {
    super(value);
  }
}

/**
 * The Bearer object is responsible for sending and receiving the data
 * to the mesh network.
 */
export abstract class Bearer extends Mixin(
  BindableTinyEmitter<BearerHandler & BearerDataHandler>,
  Transmitter,
) {
  /**
   * Returns the PDU types supported by this bearer.
   */
  protected abstract supportedPduTypes: Array<PduTypes>;
  /**
   * This property returns `true` if the Bearer is open, otherwise `false`.
   */
  public abstract isOpen: boolean;

  /**
   * This method opens the Bearer.
   */
  public abstract open(): Error | void;

  /**
   * This method closes the Bearer.
   */
  public abstract close(): Error | void;

  /**
   * Returns whether the Bearer supports the given message type.
   */
  public supports(pduType: PduType): boolean {
    return this.supportedPduTypes.some((type) => 1 << pduType === type.valueOf());
  }
}

/**
 * A mesh bearer is used to send mesh messages to provisioned nodes.
 */
export abstract class MeshBearer extends Bearer {
  // Empty.
}

/**
 * A provisioning bearer is used to send provisioning PDUs to unprovisioned
 * devices.
 */
export abstract class ProvisioningBearer extends Bearer {
  /**
   * This method sends the given Provisioning Request over the bearer.
   *
   * Data longer than MTU will automatically be segmented if bearer
   * implements segmentation.
   *
   * @param request The Provisioning request to be sent over the Bearer.
   * @throws This method throws an error if the PDU type is not supported, or data could not be sent for some other reason.
   */
  sendProvisioningRequest(request: ProvisioningRequest): void {
    return this.send(ProvisioningRequest.pdu(request), PduType.provisioningPdu);
  }
}
