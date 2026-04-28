import { UInt16, MeshCDB } from "@blemeshjs/utils";
import { createModelSchema, optional, primitive } from "serializr";
import { z } from "zod";

// Extract the features schema from the Node schema
const NodeFeaturesSchema = z
  .object({
    relay: MeshCDB.FeatureState.optional(),
    proxy: MeshCDB.FeatureState.optional(),
    friend: MeshCDB.FeatureState.optional(),
    lowPower: MeshCDB.FeatureState.optional(),
  })
  .strict();

/**
 * A feature of a Node.
 *
 * Bluetooth Mesh Protocol 1.1 defines 4 features:
 * - If the Relay feature is set, the Relay feature of a Node is in use.
 * - If the Proxy feature is set, the GATT Proxy feature of a Node is in use.
 * - If the Friend feature is set, the Friend feature of a Node is in use.
 * - If the Low Power feature is set, the Node has active relationship with a Friend Node.
 */
export enum NodeFeature {
  /**
   * The Relay feature is used to relay/forward Network PDUs received by a node
   * over the advertising bearer.
   *
   * This feature is optional and if supported can be enabled and disabled.
   */
  relay = "relay",
  /**
   * The Proxy feature is used to relay/forward Network PDUs received by a node
   * between GATT and advertising bearers.
   *
   * This feature is optional and if supported can be enabled and disabled.
   */
  proxy = "proxy",
  /**
   * The Friend feature is used to establish friendship with a Low Power node.
   *
   * This feature is optional and if supported can be enabled and disabled.
   */
  friend = "friend",
  /**
   * The Low Power feature specifies that the node can work as a Low Power device.
   *
   * This feature is optional but cannot be disabled if supported. A Low Power
   * node can have friendship established or not, but this flag only says if
   * the feature is enabled, not the status of the friendship.
   */
  lowPower = "lowPower",
}

/**
 * A set of currently active features of a Node.
 */
export class NodeFeatures {
  /**
   * If present, the `NodeFeatures.relay` feature is enabled on the Node.
   */
  public static relay = new NodeFeatures(1 << 0);
  /**
   * If present, the `NodeFeatures.proxy` feature is enabled on the Node.
   */
  public static proxy = new NodeFeatures(1 << 1);
  /**
   * If present, the `NodeFeatures.friend` feature is enabled on the Node.
   */
  public static friend = new NodeFeatures(1 << 2);
  /**
   * If present, the `NodeFeatures.lowPower` feature is enabled on the Node.
   */
  public static lowPower = new NodeFeatures(1 << 3);

  constructor(public rawValue: UInt16) {}

  public asArray(): Array<NodeFeature> {
    const result: Array<NodeFeature> = [];
    if (this.contains(NodeFeatures.relay)) {
      result.push(NodeFeature.relay);
    }
    if (this.contains(NodeFeatures.proxy)) {
      result.push(NodeFeature.proxy);
    }
    if (this.contains(NodeFeatures.friend)) {
      result.push(NodeFeature.friend);
    }
    if (this.contains(NodeFeatures.lowPower)) {
      result.push(NodeFeature.lowPower);
    }
    return result;
  }

  public contains(feature: NodeFeatures): boolean {
    return this.rawValue === feature.rawValue;
  }
}

/**
 * The state of a feature.
 *
 * A Node can have features enabled, disabled, or may not support one.
 */
export enum NodeFeatureState {
  /**
   * The feature is disabled.
   */
  notEnabled = 0,
  /**
   * The feature is enabled.
   */
  enabled = 1,
  /**
   * The feature is not supported by the Node.
   */
  notSupported = 2,
}

/**
 * The features state object represents the functionality of a mesh node
 * that is determined by the set features that the node supports.
 */
export class NodeFeaturesState {
  /**
   * The state of Relay feature or `undefined` if unknown.
   */
  public relay?: NodeFeatureState;
  /**
   * The state of Proxy feature or `undefined` if unknown.
   */
  public proxy?: NodeFeatureState;
  /**
   * The state of Friend feature or `undefined` if unknown.
   */
  public friend?: NodeFeatureState;
  /**
   * The state of Low Power feature or `undefined` if unknown.
   */
  public lowPower?: NodeFeatureState;

  public get rawValue(): UInt16 {
    let bitField = 0;
    if (this.relay !== NodeFeatureState.notSupported) bitField |= 0x01;
    if (this.proxy !== NodeFeatureState.notSupported) bitField |= 0x02;
    if (this.friend !== NodeFeatureState.notSupported) bitField |= 0x04;
    if (this.lowPower !== NodeFeatureState.notSupported) bitField |= 0x08;
    return bitField;
  }

  public static fromStates(
    relay?: NodeFeatureState,
    proxy?: NodeFeatureState,
    friend?: NodeFeatureState,
    lowPower?: NodeFeatureState,
  ): NodeFeaturesState {
    const nodeFeaturesState = new NodeFeaturesState();
    nodeFeaturesState.relay = relay;
    nodeFeaturesState.proxy = proxy;
    nodeFeaturesState.friend = friend;
    nodeFeaturesState.lowPower = lowPower;
    return nodeFeaturesState;
  }

  public static decode(jv: Record<string, unknown>): NodeFeaturesState {
    const parsed = NodeFeaturesSchema.parse(jv);
    const state = new NodeFeaturesState();
    state.relay = parsed.relay;
    state.proxy = parsed.proxy;
    state.friend = parsed.friend;
    state.lowPower = parsed.lowPower;
    return state;
  }

  public constructor() {}

  /**
   * This method creates the Node Features State object based on the
   * feature bit-field from the Page 0 of the Composition Data.
   *
   * @param mask Features field from the Page 0 of the Composition Page.
   */
  public static fromMask(mask: UInt16): NodeFeaturesState {
    // The state of the following features is unknown until the corresponding
    // Config ... Get message is sent.
    return NodeFeaturesState.fromStates(
      (mask & 0x01) == 0 ? NodeFeatureState.notSupported : undefined,
      (mask & 0x02) == 0 ? NodeFeatureState.notSupported : undefined,
      (mask & 0x04) == 0 ? NodeFeatureState.notSupported : undefined,
      // The Low Power feature if supported is enabled and cannot be disabled.
      (mask & 0x08) == 0 ? NodeFeatureState.notSupported : NodeFeatureState.enabled,
    );
  }

  public applyMissing(other: NodeFeaturesState) {
    if (typeof this.friend === "undefined") {
      this.friend = other.friend;
    }
    if (typeof this.lowPower === "undefined") {
      this.lowPower = other.lowPower;
    }
    if (typeof this.proxy === "undefined") {
      this.proxy = other.proxy;
    }
    if (typeof this.relay === "undefined") {
      this.relay = other.relay;
    }
  }
}

createModelSchema(NodeFeaturesState, {
  relay: optional(primitive()),
  proxy: optional(primitive()),
  friend: optional(primitive()),
  lowPower: optional(primitive()),
});
