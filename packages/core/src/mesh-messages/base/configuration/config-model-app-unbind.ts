import { Mixin } from "ts-mixer";
import {
  AcknowledgedConfigMessage,
  Address,
  ConfigAnyModelMessage,
  ConfigAppKeyMessage,
  Data,
  KeyIndex,
  packUInt16LE,
  readUInt16LE,
  UInt16,
  UInt32,
} from "@mesh-link-js/utils";
import { ConfigModelAppStatus } from "./config-model-app-status.js";
import { concatUint8Arrays } from "uint8array-extras";
import { ApplicationKey } from "../../../mesh-models/index.js";
import { Model } from "../../../mesh-models/model.js";

export class ConfigModelAppUnbind extends Mixin(
  AcknowledgedConfigMessage,
  ConfigAppKeyMessage,
  ConfigAnyModelMessage,
) {
  public static readonly opCode: UInt32 = 0x803f;
  public override opCode: UInt32 = 0x803f;
  public responseType = ConfigModelAppStatus;

  public get parameters(): Data | undefined {
    const data = concatUint8Arrays([this.elementAddress.bytes, this.applicationKeyIndex.bytes]);
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
    public companyIdentifier: UInt16 | undefined = undefined,
  ) {
    super();
  }

  public static fromApplicationKey(applicationKey: ApplicationKey, model: Model) {
    const elementAddress = model.parentElement?.unicastAddress;
    if (elementAddress === undefined) {
      return;
    }
    return new ConfigModelAppUnbind(
      applicationKey.index,
      elementAddress,
      model.modelIdentifier,
      model.companyIdentifier,
    );
  }

  public static fromData(parameters: Data) {
    if (parameters.length !== 6 && parameters.length !== 8) {
      return undefined;
    }
    const elementAddress = new Address(readUInt16LE(parameters.slice(0)));
    const applicationKeyIndex = new KeyIndex(readUInt16LE(parameters.slice(2)));
    if (parameters.length === 8) {
      const companyIdentifier = readUInt16LE(parameters.slice(4));
      const modelIdentifier = readUInt16LE(parameters.slice(6));
      return new ConfigModelAppUnbind(
        applicationKeyIndex,
        elementAddress,
        modelIdentifier,
        companyIdentifier,
      );
    } else {
      const modelIdentifier = readUInt16LE(parameters.slice(4));
      return new ConfigModelAppUnbind(applicationKeyIndex, elementAddress, modelIdentifier);
    }
  }
}
