import {
  Data,
  Int32,
  isEnumCase,
  packUInt16LE,
  readUInt16LE,
  UInt16,
  UInt32,
  UInt8,
  Location,
} from "@blemeshjs/utils";
import { Element } from "../mesh-models/element.js";
import { concatUint8Arrays } from "uint8array-extras";
import { Model } from "../mesh-models/model.js";

export class ElementData {
  constructor(
    /**
     * Numeric order of the Element within this Node.
     */
    public index: UInt8,
    /**
     * Description of the Element's location.
     */
    public location: Location,
    /**
     * An array of Model objects in the Element.
     */
    public models: Array<ModelData>,
  ) {}

  public static fromElement(element: Element) {
    return new ElementData(
      element.index,
      element.location,
      element.models.map((model) => ModelData.fromModel(model)),
    );
  }

  public static fromCompositionData(
    compositionData: Data,
    offset: Int32,
    index: Int32,
  ): { elementData: ElementData; offset: number } | undefined {
    // Composition Data must have at least 4 bytes: 2 for Location and one for NumS and NumV.
    if (compositionData.length < offset + 4) {
      return;
    }
    // Is Location valid?
    const rawValue: UInt16 = readUInt16LE(compositionData.slice(offset));
    const location = isEnumCase(rawValue, Location) ? (rawValue as Location) : undefined;
    if (location === undefined) {
      return;
    }

    // Read NumS and NumV.
    const sigModelsByteCount = compositionData[offset + 2] * 2; // SIG Model ID is 16-bit long.
    const vendorModelsByteCount = compositionData[offset + 3] * 4; // Vendor Model ID is 32-bit long.

    // Ensure the Composition Data have enough data.
    if (compositionData.length < offset + 3 + sigModelsByteCount + vendorModelsByteCount) {
      return;
    }
    // 4 bytes have been read.
    offset += 4;

    // Read models.
    const models: Array<ModelData> = [];
    for (let o = offset; o < offset + sigModelsByteCount; o += 2) {
      const sigModelId: UInt16 = readUInt16LE(compositionData.slice(o));
      models.push(ModelData.fromSigModelId(sigModelId));
    }
    offset += sigModelsByteCount;

    for (let o = offset; o < offset + vendorModelsByteCount; o += 4) {
      const companyId: UInt16 = readUInt16LE(compositionData.slice(o));
      const vendorModelId: UInt16 = readUInt16LE(compositionData.slice(o + 2));
      models.push(ModelData.fromVendorModelId(vendorModelId, companyId));
    }
    const elementData = new ElementData(index, location, models);
    offset += vendorModelsByteCount;
    return { elementData, offset };
  }

  public toString(): string {
    return `Element(index: ${this.index}, location: ${Location.toString(this.location)}, models: ${this.models})`;
  }
}

export class ModelData {
  constructor(public modelId: UInt32) {}

  /**
   * Bluetooth SIG or vendor-assigned model identifier.
   */
  public get modelIdentifier(): UInt16 {
    return this.modelId & 0x0000ffff;
  }
  /**
   * The Company Identifier or `undefined`, if the model is Bluetooth SIG-assigned.
   */
  public get companyIdentifier(): UInt16 | undefined {
    if (this.modelId > 0xffff) {
      return this.modelId >>> 16;
    }
    return undefined;
  }
  /**
   * Returns `true` for Models with identifiers assigned by Bluetooth SIG, `false` otherwise.
   */
  public get isBluetoothSIGAssigned(): boolean {
    return this.modelId <= 0xffff;
  }

  public static fromModel(model: Model) {
    return new ModelData(model.modelId);
  }

  public static fromSigModelId(sigModelId: UInt16) {
    return new ModelData(sigModelId);
  }

  public static fromVendorModelId(vendorModelId: UInt16, companyId: UInt16) {
    return new ModelData(((companyId << 16) | vendorModelId) >>> 0);
  }

  public toString(): string {
    if (this.companyIdentifier !== undefined) {
      return `${this.modelIdentifier.toString(16).padStart(4, "0")} (companyId: 0x${this.companyIdentifier.toString(16).padStart(4, "0")})`;
    }
    return this.modelIdentifier.toString(16).padStart(4, "0");
  }
}

export namespace Elements {
  /**
   * Returns whether any of Elements in the array contains a Model with given
   * Model identifier.
   *
   * @param sigModelId Bluetooth SIG model identifier.
   * @returns `True` if the array contains an Element with a Model with given Model identifier, `false` otherwise.
   */
  export const containsModelWithSigModelId = (
    elements: Array<Element>,
    sigModelId: UInt16,
  ): boolean => {
    return elements.some((element) => element.containsModelWithSigModelId(sigModelId));
  };

  /**
   * Returns Elements and their Models as Data, to be sent in
   * Page 0 of the Composition Data.
   *
   * @param elements The array of Elements to be converted to Data.
   */
  export function toData(elements: Array<ElementData>): Data {
    let data = new Uint8Array();
    for (const element of elements) {
      let elementData = packUInt16LE(element.location);

      const sigModels: Array<ModelData> = [];
      const vendorModel: Array<ModelData> = [];
      for (const model of element.models) {
        if (model.isBluetoothSIGAssigned) {
          sigModels.push(model);
        } else {
          vendorModel.push(model);
        }
      }
      elementData = concatUint8Arrays([
        elementData,
        new Uint8Array([sigModels.length]),
        new Uint8Array([vendorModel.length]),
      ]);

      for (const model of sigModels) {
        elementData = concatUint8Arrays([elementData, packUInt16LE(model.modelIdentifier)]);
      }
      for (const model of vendorModel) {
        elementData = concatUint8Arrays([
          elementData,
          packUInt16LE(model.companyIdentifier!),
          packUInt16LE(model.modelIdentifier),
        ]);
      }
      data = concatUint8Arrays([data, elementData]);
    }
    return data;
  }
}
