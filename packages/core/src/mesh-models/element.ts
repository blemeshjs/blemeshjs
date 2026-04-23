import {
  Address,
  DecodingError,
  Int32,
  isEnumCase,
  SigModelId,
  toPaddedHex16,
  UInt16,
  UInt32,
  UInt8,
  Location,
  MeshCDB,
} from "@mesh-link-js/utils";
import { Node } from "./node.js";
import { Model } from "./model.js";
import { MeshNetwork } from "./mesh-network.js";
import { alias, createModelSchema, custom, list, object, optional, primitive } from "serializr";
import { ConfigurationServerHandler } from "../layers/foundation-layer/configuration-server-handler.js";
import { ConfigurationClientHandler } from "../layers/foundation-layer/configuration-client-handler.js";
import { action, computed, makeObservable, observable } from "mobx";
import { produce } from "immer";
import { MeshNetworkManager } from "./mesh-network-manager.js";

/**
 * An Element is an addressable entity within a `Node`.
 *
 * Each Node has at least one element, the Primary Element, and may have
 * one or more additional secondary elements. The number and structure of
 * elements is static and does not change throughout the lifetime of a node
 * (that is, as long as the node is part of a network).
 *
 * The Primary Element is addressed using the first Unicast Address
 * assigned to the Node during provisioning. Each additional secondary
 * element is addressed using the subsequent addresses. These unicast
 * element addresses allow nodes to identify which element within a node
 * is transmitting or receiving a message.
 */
export class Element {
  /**
   * UTF-8 human-readable name of the Element.
   */
  public name: string | undefined = undefined;

  /**
   * Numeric order of the Element within this Node.
   */
  public index: UInt8;

  /**
   * Parent Node. This may be `undefined` if the Element was obtained in
   * Composition Data and has not yet been added to a Node.
   */
  public parentNode: Node | undefined = undefined;

  private readonly $location: Location;
  public get location(): Location {
    return this.$location;
  }

  private $models: Array<Model>;
  /**
   * An array of Model objects in the Element.
   */
  public get models(): Array<Model> {
    return this.$models;
  }

  /**
   * Returns the Unicast Address of the Element.
   *
   * For Elements not added to Node this returns the Element index
   * value as `Address`.
   */
  public get unicastAddress(): Address {
    return new Address((this.parentNode?.primaryUnicastAddress.valueOf() ?? 0) + this.index);
  }

  /**
   * Returns whether the Element is a Primary Element on the Node,
   * that is its index is equal to 0.
   */
  public get isPrimary(): boolean {
    return this.index === 0;
  }

  public static decode(jv: Record<string, unknown>) {
    const parsed = MeshCDB.Element.parse(jv);

    const location = parseInt(parsed.location, 16);
    if (!isEnumCase(location, Location)) {
      throw new DecodingError(`Unknown location: 0x${parsed.location}.`);
    }
    const models = parsed.models.map((model) => Model.decode(model));
    const element = new Element(parsed.name, location, models);
    element.index = parsed.index;
    models.forEach((model) => {
      model.parentElement = element;
    });
    return element;
  }

  public constructor(name: string | undefined, location: Location, models: Array<Model>) {
    this.name = name;
    this.$location = location;
    this.$models = models;
    // Set temporary index.
    // Final index will be set when Element is added to the Node.
    this.index = 0;

    this.$models.forEach((model) => {
      model.parentElement = this;
    });

    makeObservable<Element, "$location" | "$models">(this, {
      name: observable,
      $location: observable,
      $models: observable,
      index: observable,
      models: computed,
      isPrimary: computed,
      unicastAddress: computed,
      parentNode: observable,
      removePrimaryElementModels: action,
    });
  }

  /**
   * The primary Element for Provisioner's Node.
   *
   * The Element will contain all mandatory Models (Configuration Server and Health Server) and supported clients (Configuration Client and Health Client).
   */
  public static get primaryElement(): Element {
    // The Provisioner will always have a first Element with obligatory
    // Models.
    const element = Element.fromLocation(Location.unknown);
    element.name = "Primary Element";
    // Configuration Server is required for all nodes.
    element.addModel(Model.fromSigModelId(SigModelId.configurationServerModelId));
    // Configuration Client is added, as this is a Provisioner's node.
    element.addModel(Model.fromSigModelId(SigModelId.configurationClientModelId));
    // Health Server is required for all nodes.
    element.addModel(Model.fromSigModelId(SigModelId.healthServerModelId));
    // Health Client is added, as this is a Provisioner's node.
    element.addModel(Model.fromSigModelId(SigModelId.healthClientModelId));
    return element;
  }

  public static fromLocation(location: Location) {
    return new Element(undefined, location, []);
  }

  /**
   * Returns whether the Element contains a Bluetooth SIG defined Model with
   * given Model ID.
   *
   * @param sigModelId Bluetooth SIG Model ID.
   * @returns `True` if the Element contains a Model with given Model ID,`false` otherwise.
   */
  public containsModelWithSigModelId(sigModelId: UInt16): boolean {
    return this.models.some(
      (model) => model.isBluetoothSIGAssigned && model.modelIdentifier === sigModelId,
    );
  }

  /**
   * Removes the models that are or should be supported natively.
   */
  public removePrimaryElementModels() {
    this.$models = this.models.filter((model) => {
      return (
        // Health models are not yet supported
        !model.isHealthServer &&
        !model.isHealthClient &&
        // The library supports Scene Client model natively.
        !model.isSceneClient &&
        // The models that require Device Key should not be managed by users.
        // Some of them are supported natively in the library.
        !model.requiresDeviceKey
      );
    });
  }

  /**
   * Adds given model to the Element.
   *
   * @param model The model to be added.
   */
  public addModel(model: Model) {
    this.$models = produce(this.$models, (draft) => {
      draft.push(model);
    });
    model.parentElement = this;
  }

  /**
   * Inserts the given model to the Element at the specified position.
   *
   * @param model The model to be added.
   */
  public insertModel(model: Model, i: Int32) {
    this.$models = produce(this.$models, (draft) => {
      draft.splice(i, 0, model);
    });
    model.parentElement = this;
  }

  /**
   * This methods adds the natively supported Models to the Element.
   *
   * This method should only be called for the primary Element of the
   * local Node.
   *
   * @param meshNetwork The mesh network object.
   * @param _publisher
   */
  public addPrimaryElementModels(meshNetwork: MeshNetwork, _publisher: MeshNetworkManager) {
    if (!this.isPrimary) return;
    this.insertModel(
      Model.fromSigModelIdAndHandler(
        SigModelId.configurationServerModelId,
        new ConfigurationServerHandler(meshNetwork),
      ),
      0,
    );
    this.insertModel(
      Model.fromSigModelIdAndHandler(
        SigModelId.configurationClientModelId,
        new ConfigurationClientHandler(meshNetwork),
      ),
      0,
    );
  }

  /**
   * Returns the first found Model with given identifier.
   *
   * @param modelId The 32-bit Model identifier.
   * @returns The Model found, or `undefined` if no such exist.
   */
  public modelWithModelId(modelId: UInt32): Model | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return this.models.find((model) => model.modelId == modelId);
  }
}

createModelSchema(Element, {
  name: optional(primitive()),
  index: primitive(),
  $location: alias(
    "location",
    custom(
      (v: Location) => toPaddedHex16(v),
      (v: string) => v,
    ),
  ),
  models: list(object(Model)),
});
