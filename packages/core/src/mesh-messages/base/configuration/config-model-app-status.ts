import { Mixin } from "ts-mixer";
import { concatUint8Arrays } from "uint8array-extras";
import {
  Address,
  CompanyIdentifier,
  ConfigAnyModelMessage,
  ConfigAppKeyMessage,
  ConfigMessageStatus,
  ConfigResponse,
  ConfigStatusMessage,
  Data,
  isEnumCase,
  KeyIndex,
  packUInt16LE,
  readUInt16LE,
  UInt16,
  UInt32,
} from "@mesh-link-js/utils";

export class ConfigModelAppStatus extends Mixin(
  ConfigResponse,
  ConfigStatusMessage,
  ConfigAppKeyMessage,
  ConfigAnyModelMessage,
) {
  public static readonly opCode: UInt32 = 0x803e;
  public override opCode: UInt32 = 0x803e;

  public get parameters(): Data | undefined {
    const data = concatUint8Arrays([
      new Uint8Array([this.status]),
      this.elementAddress.bytes,
      this.applicationKeyIndex.bytes,
    ]);
    if (this.companyIdentifier !== undefined) {
      return concatUint8Arrays([
        data,
        packUInt16LE(this.companyIdentifier),
        packUInt16LE(this.modelIdentifier),
      ]);
    } else {
      return concatUint8Arrays([data, packUInt16LE(this.modelIdentifier)]);
    }
  }

  constructor(
    public applicationKeyIndex: KeyIndex,
    public elementAddress: Address,
    public modelIdentifier: UInt16,
    public status: ConfigMessageStatus,
    public companyIdentifier: UInt16 | undefined = undefined,
  ) {
    super();
  }

  public static confirm<T extends ConfigAppKeyMessage & ConfigAnyModelMessage>(request: T) {
    return ConfigModelAppStatus.responseTo(request, ConfigMessageStatus.success);
  }

  public static responseTo<T extends ConfigAppKeyMessage & ConfigAnyModelMessage>(
    request: T,
    status: ConfigMessageStatus,
  ) {
    return new ConfigModelAppStatus(
      request.applicationKeyIndex,
      request.elementAddress,
      request.modelIdentifier,
      status,
      request.companyIdentifier,
    );
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 7 && parameters.length !== 9) {
      return;
    }
    const status = isEnumCase(parameters[0], ConfigMessageStatus)
      ? (parameters[0] as ConfigMessageStatus)
      : undefined;
    if (status === undefined) return;
    const elementAddress = new Address(readUInt16LE(parameters.slice(1)));
    const applicationKeyIndex = new KeyIndex(readUInt16LE(parameters.slice(3)));
    if (parameters.length == 9) {
      const companyIdentifier = readUInt16LE(parameters.slice(5));
      const modelIdentifier = readUInt16LE(parameters.slice(7));
      return new ConfigModelAppStatus(
        applicationKeyIndex,
        elementAddress,
        modelIdentifier,
        status,
        companyIdentifier,
      );
    } else {
      const modelIdentifier = readUInt16LE(parameters.slice(5));
      return new ConfigModelAppStatus(applicationKeyIndex, elementAddress, modelIdentifier, status);
    }
  }
  toString() {
    return `ConfigModelAppStatus (status: ${ConfigMessageStatus.toString(this.status)}, elementAddress: 0x${this.elementAddress.hex}, applicationKeyIndex: ${this.applicationKeyIndex}, modelIdentifier: ${this.modelIdentifier}, companyIdentifier: ${CompanyIdentifier.nameForId(this.companyIdentifier)})`;
  }
}
