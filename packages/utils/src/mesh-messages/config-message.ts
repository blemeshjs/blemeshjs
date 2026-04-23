import { Mixin } from "ts-mixer";
import {
  StaticAcknowledgedMeshMessage,
  StaticMeshMessage,
  StaticMeshResponse,
  StatusMessage,
  UnacknowledgedMeshMessage,
} from "./mesh-message.js";
import { concatUint8Arrays } from "uint8array-extras";
import { Data, Int32, KeyIndex, UInt16, UInt32 } from "../types/index.js";
import { packUInt32LE } from "../helpers/index.js";
import { Address } from "../constants/index.js";

/**
 * The status of a Config operation.
 *
 * @see `UInt8`
 */
export enum ConfigMessageStatus {
  /**
   * Success.
   */
  success = 0x00,
  /**
   * Invalid Address.
   */
  invalidAddress = 0x01,
  /**
   * Invalid Model.
   */
  invalidModel = 0x02,
  /**
   * Invalid AppKey Index.
   */
  invalidAppKeyIndex = 0x03,
  /**
   * Invalid NetKey Index.
   */
  invalidNetKeyIndex = 0x04,
  /**
   * Insufficient Resources.
   */
  insufficientResources = 0x05,
  /**
   * Key Index Already Stored.
   */
  keyIndexAlreadyStored = 0x06,
  /**
   * Invalid Publish Parameters.
   */
  invalidPublishParameters = 0x07,
  /**
   * Not a Subscribe Model.
   */
  notASubscribeModel = 0x08,
  /**
   * Storage Failure.
   */
  storageFailure = 0x09,
  /**
   * Feature Not Supported.
   */
  featureNotSupported = 0x0a,
  /**
   * Cannot Update.
   */
  cannotUpdate = 0x0b,
  /**
   * Cannot Remove.
   */
  cannotRemove = 0x0c,
  /**
   * Cannot Bind.
   */
  cannotBind = 0x0d,
  /**
   * Temporarily Unable to Change State.
   */
  temporarilyUnableToChangeState = 0x0e,
  /**
   * Cannot Set.
   */
  cannotSet = 0x0f,
  /**
   * Unspecified Error.
   */
  unspecifiedError = 0x10,
  /**
   * Invalid Binding.
   */
  invalidBinding = 0x11,
}

export namespace ConfigMessageStatus {
  export function toString(status: ConfigMessageStatus): string {
    switch (status) {
      case ConfigMessageStatus.success:
        return "Success";
      case ConfigMessageStatus.invalidAddress:
        return "Invalid Address";
      case ConfigMessageStatus.invalidModel:
        return "Invalid Model";
      case ConfigMessageStatus.invalidAppKeyIndex:
        return "Invalid Application Key Index";
      case ConfigMessageStatus.invalidNetKeyIndex:
        return "Invalid Network Key Index";
      case ConfigMessageStatus.insufficientResources:
        return "Insufficient resources";
      case ConfigMessageStatus.keyIndexAlreadyStored:
        return "Key Index already stored";
      case ConfigMessageStatus.invalidPublishParameters:
        return "Invalid publish parameters";
      case ConfigMessageStatus.notASubscribeModel:
        return "Not a Subscribe Model";
      case ConfigMessageStatus.storageFailure:
        return "Storage failure";
      case ConfigMessageStatus.featureNotSupported:
        return "Feature not supported";
      case ConfigMessageStatus.cannotUpdate:
        return "Cannot update";
      case ConfigMessageStatus.cannotRemove:
        return "Cannot remove";
      case ConfigMessageStatus.cannotBind:
        return "Cannot bind";
      case ConfigMessageStatus.temporarilyUnableToChangeState:
        return "Temporarily unable to change state";
      case ConfigMessageStatus.cannotSet:
        return "Cannot set";
      case ConfigMessageStatus.unspecifiedError:
        return "Unspecified error";
      case ConfigMessageStatus.invalidBinding:
        return "Invalid binding";
    }
  }
}

/**
 * A base protocol for all Configuration messages.
 *
 * Configuration messages are used to configure Nodes. They are sent between
 * Configuration Client model on the Configuration Manager and Configuration Server
 * model on the device, which is being configured. All Config messages are encrypted
 * using target Node's Device Key.
 */
export abstract class ConfigMessage extends StaticMeshMessage {
  // No additional fields.

  /**
   * Encodes given list of Key Indexes into a Data.
   * As each Key Index is 12 bits long, a pair of them can fit 3 bytes.
   * This method ensures that they are packed in compliance to the
   * Bluetooth Mesh specification.
   *
   * @param indexes An array of 12-bit Key Indexes.
   * @param limit Maximum number of Key Indexes to encode.
   * @returns Key Indexes encoded to a Data.
   */
  public encode(indexes: Array<KeyIndex>, limit: Int32 = 10000): Data {
    if (limit === 0 || indexes.length === 0) {
      return new Uint8Array(0);
    }
    if (limit === 1 || indexes.length === 1) {
      // Encode a single Key Index into 2 bytes.
      return indexes[0].bytes;
    } else {
      // Encode a pair of Key Indexes into 3 bytes.
      const first = indexes[0];
      const second = indexes[1];
      const pair: UInt32 = (first.valueOf() << 12) | second.valueOf();
      const pairBytes = packUInt32LE(pair);
      return concatUint8Arrays([
        pairBytes.slice(0, pairBytes.length - 1),
        this.encode(indexes.slice(2), limit - 2),
      ]);
    }
  }

  /**
   * Decodes number of Key Indexes from the given Data from the given offset.
   * This will decode as many Indexes as possible, until the end of data is
   * reached.
   *
   * @param limit Maximum number of Key Indexes to decode.
   * @param data The data from where the indexes should be read.
   * @param offset The offset from where to read the indexes.
   * @returns Decoded Key Indexes.
   */
  public static decode(data: Data, offset: Int32, limit: Int32 = 10000): Array<KeyIndex> {
    const size = data.length - offset;
    if (!(limit > 0 && size >= 2)) {
      return [];
    }
    if (limit === 1 || size === 2) {
      // Decode a single Key Index from 2 bytes.
      const index: KeyIndex = new KeyIndex((data[offset + 1] << 8) | data[offset]);
      return [index];
    } else {
      // Decode a pair of Key Indexes from 3 bytes.
      const first: KeyIndex = new KeyIndex((data[offset + 2] << 4) | (data[offset + 1] >> 4));
      const second: KeyIndex = new KeyIndex(((data[offset + 1] & 0x0f) << 8) | data[offset]);
      return [first, second].concat(this.decode(data, offset + 3, limit - 2));
    }
  }
}

/**
 * A base protocol for config status messages.
 */
export abstract class ConfigStatusMessage extends Mixin(ConfigMessage, StatusMessage) {
  /**
   * Operation status.
   */
  public abstract get status(): ConfigMessageStatus;
  /**
   * Whether the operation was successful or not.
   */
  public get isSuccess(): boolean {
    return this.status === ConfigMessageStatus.success;
  }

  /**
   * String representation of the status.
   */
  public get message(): string {
    return `${this.status}`;
  }
}

/**
 * A base protocol for unacknowledged Configuration messages.
 *
 * Unacknowledged configuration messages are sent as replies to acknowledged messages.
 */
export abstract class UnacknowledgedConfigMessage extends Mixin(
  ConfigMessage,
  UnacknowledgedMeshMessage,
) {
  // No additional fields.
}

/**
 * The base class for response messages.
 */
export abstract class ConfigResponse extends Mixin(
  StaticMeshResponse,
  UnacknowledgedConfigMessage,
) {
  // No additional fields.
}

/**
 * A base protocol for acknowledged Configuration messages.
 *
 * Acknowledged messages will be responded with a status message.
 */
export abstract class AcknowledgedConfigMessage extends Mixin(
  ConfigMessage,
  StaticAcknowledgedMeshMessage,
) {
  // No additional fields.
}
/**
 * A base protocol for config messages related to Elements.
 */
export abstract class ConfigElementMessage extends ConfigMessage {
  /**
   * The Unicast Address of the Model's parent Element.
   */
  public abstract get elementAddress(): Address;
}

/**
 * A base protocol for config messages related to Models.
 */
export abstract class ConfigModelMessage extends ConfigElementMessage {
  /**
   * The 16-bit Model identifier.
   */
  public abstract get modelIdentifier(): UInt16;

  /**
   * The 32-bit Model identifier.
   */
  public abstract get modelId(): UInt32;
}

/**
 * A base protocol for config messages related to Models, where the Model can be
 * a vendor model.
 */
export abstract class ConfigAnyModelMessage extends ConfigModelMessage {
  /**
   * The Company identified, as defined in Assigned Numbers, or `undefined`
   * if the Model is defined in Bluetooth Mesh Model Specification.
   *
   * @see https://www.bluetooth.com/specifications/assigned-numbers/company-identifiers/
   */
  public abstract get companyIdentifier(): UInt16 | undefined;

  /**
   * Returns `true` for Models with identifiers assigned by Bluetooth SIG,
   * `false` otherwise.
   */
  public get isBluetoothSIGAssigned(): boolean {
    return this.companyIdentifier === undefined;
  }

  public get modelId(): UInt32 {
    if (this.companyIdentifier !== undefined) {
      return (this.companyIdentifier << 16) | this.modelIdentifier;
    } else {
      return this.modelIdentifier;
    }
  }
}

/**
 * A base protocol for config messages related to Application Keys.
 */
export abstract class ConfigAppKeyMessage extends ConfigMessage {
  /**
   * Application Key Index.
   */
  public abstract get applicationKeyIndex(): KeyIndex;
}

/**
 * A base protocol for config messages related to Network Keys.
 */
export abstract class ConfigNetKeyMessage extends ConfigMessage {
  /**
   * The Network Key Index.
   */
  public abstract get networkKeyIndex(): KeyIndex;
  /**
   * Encodes Network Key Index in 2 bytes using Little Endian.
   *
   * @returns Key Index encoded in 2 bytes.
   */
  public encodeNetKeyIndex(): Data {
    return this.encode([this.networkKeyIndex]);
  }

  /**
   * the Network Key Index from 2 bytes at given offset.
   *
   * There are no any checks whether the data at the given offset
   * are valid, or even if the offset is not outside of the data range.
   *
   * @param data The data from where the indexes should be read.
   * @param offset The offset from where to read the indexes.
   * @returns Decoded Key Index.
   */
  public static decodeNetKeyIndex(data: Data, offset: Int32): KeyIndex {
    return this.decode(data, offset, 1)[0];
  }
}

/**
 * A base protocol for config messages related to Network Key and Application Key.
 */
export abstract class ConfigNetAndAppKeyMessage extends Mixin(
  ConfigNetKeyMessage,
  ConfigAppKeyMessage,
) {
  /**
   * Encodes Network Key Index and Application Key Index in 3 bytes
   * using Little Endian.
   *
   * @returns Key Indexes encoded in 3 bytes.
   */
  public encodeNetAndAppKeyIndex(): Data {
    return this.encode([this.applicationKeyIndex, this.networkKeyIndex]);
  }

  /**
   * Decodes the Network Key Index and Application Key Index from
   * 3 bytes at given offset.
   *
   * There are no any checks whether the data at the given offset
   * are valid, or even if the offset is not outside of the data range.
   *
   * @param data The data from where the indexes should be read.
   * @param offset The offset from where to read the indexes.
   * @returns Decoded Key Indexes.
   */
  public static decodeNetAndAppKeyIndex(
    data: Data,
    offset: Int32,
  ): { networkKeyIndex: KeyIndex; applicationKeyIndex: KeyIndex } {
    const indexes = this.decode(data, offset, 2);
    return { networkKeyIndex: indexes[1], applicationKeyIndex: indexes[0] };
  }
}
