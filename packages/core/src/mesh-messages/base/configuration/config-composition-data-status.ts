import {
  ConfigResponse,
  Data,
  packUInt16LE,
  readUInt16LE,
  toPaddedHex16,
  UInt16,
  UInt32,
  UInt8,
} from "@blemeshjs/utils";
import { NodeFeaturesState } from "../../../mesh-models/node-features.js";
import { ElementData, Elements } from "../../../mesh-models-array/elements.js";
import { concatUint8Arrays } from "uint8array-extras";
import { Node } from "../../../mesh-models/node.js";

/**
 * A base protocol of a single Page of Composition Data.
 *
 * The Composition Data state contains information about a Node,
 * the Elements it includes, and the supported models.
 *
 * The Composition Data is composed of a number of pages of information.
 */
export abstract class CompositionDataPage {
  /**
   * Page number of the Composition Data to get.
   */
  public abstract get page(): UInt8;
  /**
   * Composition Data parameters as Data.
   */
  public abstract get parameters(): Data | undefined;
}

export class ConfigCompositionDataStatus extends ConfigResponse {
  public static readonly opCode: UInt32 = 0x02;
  public override opCode: UInt32 = 0x02;

  public get page() {
    return this.$page;
  }
  public get parameters(): Data | undefined {
    return this.page?.parameters;
  }

  constructor(
    /**
     * The Composition Data page.
     */
    private $page: CompositionDataPage,
  ) {
    super();
  }

  public static fromData(parameters: Data) {
    if (parameters.length <= 0) {
      return;
    }
    switch (parameters[0]) {
      case 0:
        const page0 = Page0.fromData(parameters);
        if (!page0) return;
        return new ConfigCompositionDataStatus(page0);
      default:
        // Other Pages are not supported.
        return undefined;
    }
  }

  public toString(): string {
    return `ConfigCompositionDataStatus(page: ${this.page})`;
  }
}

/**
 * Composition Data Page 0 shall be present on a Node.
 *
 * Composition Data Page 0 shall not change during a term of a Node
 * on the network.
 */
export class Page0 extends CompositionDataPage {
  constructor(
    public page: UInt8,

    /**
     * The 16-bit Company Identifier (CID) assigned by the Bluetooth SIG.
     *
     * Company Identifiers are published in
     * [Assigned Numbers](https://www.bluetooth.com/specifications/assigned-numbers/).
     */
    public companyIdentifier: UInt16,
    /**
     * The 16-bit vendor-assigned Product Identifier (PID).
     */
    public productIdentifier: UInt16,
    /**
     * The 16-bit vendor-assigned Version Identifier (VID).
     */
    public versionIdentifier: UInt16,
    /**
     * The minimum number of Replay Protection List (RPL) entries for this
     * node.
     */
    public minimumNumberOfReplayProtectionList: UInt16,
    /**
     * Node's features.
     *
     * The Page 0 of the Composition Data does not provide information
     * whether a feature is enabled or disabled, just whether it is supported
     * or not. Read the state of each feature using corresponding Config
     * message.
     */
    public features: NodeFeaturesState,
    /**
     * An array of Node's Elements.
     */
    public elements: Array<ElementData>,
  ) {
    super();
  }

  public get parameters(): Data | undefined {
    return concatUint8Arrays([
      new Uint8Array([this.page]),
      packUInt16LE(this.companyIdentifier),
      packUInt16LE(this.productIdentifier),
      packUInt16LE(this.versionIdentifier),
      packUInt16LE(this.minimumNumberOfReplayProtectionList),
      packUInt16LE(this.features.rawValue),
      Elements.toData(this.elements),
    ]);
  }

  /**
   * This initializer constructs the Page 0 of Composition Data from
   * the given Node.
   *
   * @param node The Node to construct the Page 0 from.
   */
  public static fromNode(node: Node) {
    const page = 0;
    const companyIdentifier = node.companyIdentifier ?? 0;
    const productIdentifier = node.productIdentifier ?? 0;
    const versionIdentifier = node.versionIdentifier ?? 0;
    const minimumNumberOfReplayProtectionList = node.minimumNumberOfReplayProtectionList ?? 0;
    const features = node.features ?? new NodeFeaturesState();
    const elements = node.elements.map((element) => ElementData.fromElement(element));
    return new Page0(
      page,
      companyIdentifier,
      productIdentifier,
      versionIdentifier,
      minimumNumberOfReplayProtectionList,
      features,
      elements,
    );
  }

  /**
   * This initializer should construct the message based on the
   * received parameters.
   *
   * @param parameters The Access Layer parameters.
   */
  public static fromData(parameters: Data) {
    if (parameters.length < 11 && parameters[0] !== 0) {
      return;
    }
    const page = 0;
    const companyIdentifier = readUInt16LE(parameters.slice(1));
    const productIdentifier = readUInt16LE(parameters.slice(3));
    const versionIdentifier = readUInt16LE(parameters.slice(5));
    const minimumNumberOfReplayProtectionList = readUInt16LE(parameters.slice(7));
    const features = NodeFeaturesState.fromMask(readUInt16LE(parameters.slice(9)));

    const readElements: Array<ElementData> = [];
    let offset = 11;
    while (offset < parameters.length) {
      const element = ElementData.fromCompositionData(parameters, offset, readElements.length);
      if (!element) {
        return;
      }
      readElements.push(element.elementData);
      offset = element.offset;
    }
    const elements = readElements;
    return new Page0(
      page,
      companyIdentifier,
      productIdentifier,
      versionIdentifier,
      minimumNumberOfReplayProtectionList,
      features,
      elements,
    );
  }

  public toString(): string {
    return `Page0(companyId: 0x${toPaddedHex16(this.companyIdentifier)}, productId: 0x${toPaddedHex16(this.productIdentifier)}, versionId: 0x${toPaddedHex16(this.versionIdentifier)}, minimumRPL: ${toPaddedHex16(this.minimumNumberOfReplayProtectionList)}, features: ${this.features}, elements: ${this.elements})`;
  }
}
