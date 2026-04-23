import {
  CompanyIdentifier,
  DecodingError,
  KeyIndex,
  SigModelId,
  UInt16,
  UInt32,
  MeshCDB,
  isEnumCase,
  toPaddedHex16,
} from "@mesh-link-js/utils";
import { Element } from "./element.js";
import { Clazz, createModelSchema, custom, list, object, primitive } from "serializr";
import { isUndefined } from "lodash";
import { action, computed, makeObservable, observable } from "mobx";
import { ApplicationKey } from "./application-key.js";
import { produce } from "immer";
import { ApplicationKeys } from "../mesh-models-array/index.js";
import { ModelHandler } from "./model-handler.js";
import { Group } from "./group.js";
import { Publish } from "./publish.js";
import { MeshAddress } from "./mesh-address.js";

/**
 * A Model defines the basic functionality of a `Node`.
 *
 * A Node may include one or more `Element`, each with one or mode models.
 * A model defines the required states, the messages that act upon those states,
 * and any associated behavior.
 *
 * Two Models with the same `Model.modelId` cannot be located on the same Element.
 *
 * A Model may extend another Model. Models in Extend relationship may share states.
 * A Model which does not extend any other Model is called a *base* Model.
 *
 * Models in Extend relationship located on the same Element share the Subscription List.
 */
export class Model {
  /**
   * The Model name as defined in Bluetooth Mesh Model Specification.
   */
  public get name(): string | undefined {
    if (!this.isBluetoothSIGAssigned) {
      return "Vendor Model";
    }
    const identifier = isEnumCase(this.modelIdentifier, SigModelId)
      ? (this.modelIdentifier as SigModelId)
      : undefined;
    switch (identifier) {
      // Foundation, from Mesh Profile 1.0.1
      case SigModelId.configurationServerModelId:
        return "Configuration Server";
      case SigModelId.configurationClientModelId:
        return "Configuration Client";
      case SigModelId.healthServerModelId:
        return "Health Server";
      case SigModelId.healthClientModelId:
        return "Health Client";
      // Foundation, added in Mesh Protocol 1.1
      case SigModelId.remoteProvisioningServerModelId:
        return "Remote Provisioning Server";
      case SigModelId.remoteProvisioningClientModelId:
        return "Remote Provisioning Client";
      case SigModelId.directedForwardingConfigurationServerModelId:
        return "Directed Forwarding Configuration Server";
      case SigModelId.directedForwardingConfigurationClientModelId:
        return "Directed Forwarding Configuration Client";
      case SigModelId.bridgeConfigurationServerModelId:
        return "Bridge Configuration Server";
      case SigModelId.bridgeConfigurationClientModelId:
        return "Bridge Configuration Client";
      case SigModelId.privateBeaconServerModelId:
        return "Mesh Private Beacon Server";
      case SigModelId.privateBeaconClientModelId:
        return "Mesh Private Beacon Client";
      case SigModelId.onDemandPrivateProxyServerModelId:
        return "On-­Demand Private Proxy Server";
      case SigModelId.onDemandPrivateProxyClientModelId:
        return "On-­Demand Private Proxy Client";
      case SigModelId.sarConfigurationServerModelId:
        return "SAR Configuration Server";
      case SigModelId.sarConfigurationClientModelId:
        return "SAR Configuration Client";
      case SigModelId.opcodesAggregatorServerModelId:
        return "Opcodes Aggregator Server";
      case SigModelId.opcodesAggregatorClientModelId:
        return "Opcodes Aggregator Client";
      case SigModelId.largeCompositionDataServerModelId:
        return "Large Composition Data Server";
      case SigModelId.largeCompositionDataClientModelId:
        return "Large Composition Data Client";
      case SigModelId.solicitationPduRplConfigurationServerModelId:
        return "Solicitation PDU RPL Configuration Server";
      case SigModelId.solicitationPduRplConfigurationClientModelId:
        return "Solicitation PDU RPL Configuration Client";
      // Generic
      case SigModelId.genericOnOffServerModelId:
        return "Generic OnOff Server";
      case SigModelId.genericOnOffClientModelId:
        return "Generic OnOff Client";
      case SigModelId.genericLevelServerModelId:
        return "Generic Level Server";
      case SigModelId.genericLevelClientModelId:
        return "Generic Level Client";
      case SigModelId.genericDefaultTransitionTimeServerModelId:
        return "Generic Default Transition Time Server";
      case SigModelId.genericDefaultTransitionTimeClientModelId:
        return "Generic Default Transition Time Client";
      case SigModelId.genericPowerOnOffServerModelId:
        return "Generic Power OnOff Server";
      case SigModelId.genericPowerOnOffSetupServerModelId:
        return "Generic Power OnOff Setup Server";
      case SigModelId.genericPowerOnOffClientModelId:
        return "Generic Power OnOff Client";
      case SigModelId.genericPowerLevelServerModelId:
        return "Generic Power Level Server";
      case SigModelId.genericPowerLevelSetupServerModelId:
        return "Generic Power Level Setup Server";
      case SigModelId.genericPowerLevelClientModelId:
        return "Generic Power Level Client";
      case SigModelId.genericBatteryServerModelId:
        return "Generic Battery Server";
      case SigModelId.genericBatteryClientModelId:
        return "Generic Battery Client";
      case SigModelId.genericLocationServerModelId:
        return "Generic Location Server";
      case SigModelId.genericLocationSetupServerModelId:
        return "Generic Location Setup Server";
      case SigModelId.genericLocationClientModelId:
        return "Generic Location Client";
      case SigModelId.genericAdminPropertyServerModelId:
        return "Generic Admin Property Server";
      case SigModelId.genericManufacturerPropertyServerModelId:
        return "Generic Manufacturer Property Server";
      case SigModelId.genericUserPropertyServerModelId:
        return "Generic User Property Server";
      case SigModelId.genericClientPropertyServerModelId:
        return "Generic Client Property Server";
      case SigModelId.genericPropertyClientModelId:
        return "Generic Property Client";
      // Sensors
      case SigModelId.sensorServerModelId:
        return "Sensor Server";
      case SigModelId.sensorSetupServerModelId:
        return "Sensor Setup Server";
      case SigModelId.sensorClientModelId:
        return "Sensor Client";
      // Time and Scenes
      case SigModelId.timeServerModelId:
        return "Time Server";
      case SigModelId.timeSetupServerModelId:
        return "Time Setup Server";
      case SigModelId.timeClientModelId:
        return "Time Client";
      case SigModelId.sceneServerModelId:
        return "Scene Server";
      case SigModelId.sceneSetupServerModelId:
        return "Scene Setup Server";
      case SigModelId.sceneClientModelId:
        return "Scene Client";
      case SigModelId.schedulerServerModelId:
        return "Scheduler Server";
      case SigModelId.schedulerSetupServerModelId:
        return "Scheduler Setup Server";
      case SigModelId.schedulerClientModelId:
        return "Scheduler Client";
      // Lighting
      case SigModelId.lightLightnessServerModelId:
        return "Light Lightness Server";
      case SigModelId.lightLightnessSetupServerModelId:
        return "Light Lightness Setup Server";
      case SigModelId.lightLightnessClientModelId:
        return "Light Lightness Client";
      case SigModelId.lightCTLServerModelId:
        return "Light CTL Server";
      case SigModelId.lightCTLSetupServerModelId:
        return "Light CTL Setup Server";
      case SigModelId.lightCTLClientModelId:
        return "Light CTL Client";
      case SigModelId.lightCTLTemperatureServerModelId:
        return "Light CTL Temperature Server";
      case SigModelId.lightHSLServerModelId:
        return "Light HSL Server";
      case SigModelId.lightHSLSetupServerModelId:
        return "Light HSL Setup Server ";
      case SigModelId.lightHSLClientModelId:
        return "Light HSL Client";
      case SigModelId.lightHSLHueServerModelId:
        return "Light HSL Hue Server";
      case SigModelId.lightHSLSaturationServerModelId:
        return "Light HSL Saturation Server";
      case SigModelId.lightXyLServerModelId:
        return "Light xyL Server";
      case SigModelId.lightXyLSetupServerModelId:
        return "Light xyL Setup Server";
      case SigModelId.lightXyLClientModelId:
        return "Light xyL Client";
      case SigModelId.lightLCServerModelId:
        return "Light LC Server";
      case SigModelId.lightLCSetupServerModelId:
        return "Light LC Setup Server";
      case SigModelId.lightLCClientModelId:
        return "Light LC Client";
      // BLOB Transfer
      case SigModelId.blobTransferServerModelId:
        return "BLOB Transfer Server";
      case SigModelId.blobTransferClientModelId:
        return "BLOB Transfer Client";
      // Device Firmware Update (DFU), added in Mesh Protocol 1.1
      case SigModelId.firmwareUpdateServerModelId:
        return "Firmware Update Server";
      case SigModelId.firmwareUpdateClientModelId:
        return "Firmware Update Client";
      case SigModelId.firmwareDistributionServerModelId:
        return "Firmware Distribution Server";
      case SigModelId.firmwareDistributionClientModelId:
        return "Firmware Distribution Client";

      default:
        return undefined;
    }
  }

  /**
   * The Company Identifier or `undefined`, if the model is Bluetooth SIG-assigned.
   */
  public get companyIdentifier(): UInt16 | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (this.modelId > 0xffff) {
      return this.modelId >> 16;
    }
    return undefined;
  }
  public get companyName(): string {
    const companyId = this.companyIdentifier;
    if (companyId !== undefined) {
      return CompanyIdentifier.nameForId(companyId) ?? `Unknown Company ID (${companyId})`;
    } else {
      return "Bluetooth SIG";
    }
  }

  /**
   * An array of Application Key indexes to which this model is bound.
   */
  public get bind(): Array<KeyIndex> {
    return this.$bind;
  }
  private $publish?: Publish;
  public get publish(): Publish | undefined {
    return this.$publish;
  }
  /**
   * The array of Group Addresses (4-character hexadecimal string),
   * or Virtual Label UUIDs (32-character hexadecimal string).
   */
  public get subscribe(): Array<string> {
    return this.$subscribe;
  }

  /**
   * Parent Element.
   */
  public parentElement: Element | undefined = undefined;
  /**
   * Returns `true` for Models with identifiers assigned by Bluetooth SIG,
   * `false` otherwise.
   */
  public get isBluetoothSIGAssigned(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return this.modelId <= 0xffff;
  }

  /**
   * Bluetooth SIG or vendor-assigned model identifier.
   */
  public get modelIdentifier(): UInt16 {
    return this.modelId & 0x0000ffff;
  }

  public get isConfigurationServer(): boolean {
    return this.modelId === SigModelId.configurationServerModelId;
  }
  public get isConfigurationClient(): boolean {
    return this.modelId === SigModelId.configurationClientModelId;
  }
  public get isHealthServer(): boolean {
    return this.modelId === SigModelId.healthServerModelId;
  }
  public get isGenericOnOffServer(): boolean {
    return this.modelId === SigModelId.genericOnOffServerModelId;
  }
  public get isHealthClient(): boolean {
    return this.modelId === SigModelId.healthClientModelId;
  }
  public get isSceneClient(): boolean {
    return this.modelId === SigModelId.sceneClientModelId;
  }
  public get isRemoteProvisioningServer(): boolean {
    return this.modelId === SigModelId.remoteProvisioningServerModelId;
  }
  public get isRemoteProvisioningClient(): boolean {
    return this.modelId === SigModelId.remoteProvisioningClientModelId;
  }
  public get isDirectedForwardingConfigurationServer(): boolean {
    return this.modelId === SigModelId.directedForwardingConfigurationServerModelId;
  }
  public get isDirectedForwardingConfigurationClient(): boolean {
    return this.modelId === SigModelId.directedForwardingConfigurationClientModelId;
  }
  public get isBridgeConfigurationServer(): boolean {
    return this.modelId === SigModelId.bridgeConfigurationServerModelId;
  }
  public get isBridgeConfigurationClient(): boolean {
    return this.modelId === SigModelId.bridgeConfigurationClientModelId;
  }
  public get isPrivateBeaconServer(): boolean {
    return this.modelId === SigModelId.privateBeaconServerModelId;
  }
  public get isPrivateBeaconClient(): boolean {
    return this.modelId === SigModelId.privateBeaconClientModelId;
  }
  public get isOnDemandPrivateProxyServer(): boolean {
    return this.modelId === SigModelId.onDemandPrivateProxyServerModelId;
  }
  public get isOnDemandPrivateProxyClient(): boolean {
    return this.modelId === SigModelId.onDemandPrivateProxyClientModelId;
  }
  public get isSarConfigurationServer(): boolean {
    return this.modelId === SigModelId.sarConfigurationServerModelId;
  }
  public get isSarConfigurationClient(): boolean {
    return this.modelId === SigModelId.sarConfigurationClientModelId;
  }
  public get isOpcodesAggregatorServer(): boolean {
    return this.modelId === SigModelId.opcodesAggregatorServerModelId;
  }
  public get isOpcodesAggregatorClient(): boolean {
    return this.modelId === SigModelId.opcodesAggregatorClientModelId;
  }
  public get isLargeCompositionDataServer(): boolean {
    return this.modelId === SigModelId.largeCompositionDataServerModelId;
  }
  public get isLargeCompositionDataClient(): boolean {
    return this.modelId === SigModelId.largeCompositionDataClientModelId;
  }
  /**
   * Returns whether the access layer security on the Model shall use the Device Key.
   */
  public get requiresDeviceKey(): boolean {
    return (
      this.isConfigurationServer ||
      this.isConfigurationClient ||
      this.isRemoteProvisioningServer ||
      this.isRemoteProvisioningClient ||
      this.isDirectedForwardingConfigurationServer ||
      this.isDirectedForwardingConfigurationClient ||
      this.isBridgeConfigurationServer ||
      this.isBridgeConfigurationClient ||
      this.isPrivateBeaconServer ||
      this.isPrivateBeaconClient ||
      this.isOnDemandPrivateProxyServer ||
      this.isOnDemandPrivateProxyClient ||
      this.isSarConfigurationServer ||
      this.isSarConfigurationClient ||
      this.isLargeCompositionDataServer ||
      this.isLargeCompositionDataClient
    );
  }

  /**
   * Returns whether the access layer security on the Model can use the Device Key.
   */
  public get supportsDeviceKey(): boolean {
    return (
      this.requiresDeviceKey || this.isOpcodesAggregatorServer || this.isOpcodesAggregatorClient
    );
  }

  /**
   * Returns the list of known Groups that this Model is subscribed to.
   * Models on the Primary Element are also subscribed to the All Nodes address.
   *
   * It may be that the Model is subscribed to some other Groups, which are
   * not known to the local database, and those are not returned.
   *
   * Use `Model.isSubscribed()` to check other Groups.
   */
  public get subscriptions(): Array<Group> {
    return [];
  }

  /**
   * Bluetooth SIG or vendor-assigned model identifier.
   *
   * In case of vendor models the 2 most significant bytes of this property are
   * the Company Identifier, as registered in Bluetooth SIG Assigned Numbers database.
   *
   * For Bluetooth SIG defined models these 2 bytes are `0x0000`.
   *
   * Use `Model.modelIdentifier` to get the 16-bit model identifier and
   * `Model.companyIdentifier` to obtain the Company Identifier.
   *
   * Use `Model.isBluetoothSIGAssigned` to check whether the Model is defined by
   * Bluetooth SIG.
   *
   */
  public modelId: SigModelId;
  public static decode(jv: Record<string, unknown>) {
    const parsed = MeshCDB.Model.parse(jv);

    const model = new Model(0);
    const modelId = parseInt(parsed.modelId, 16);
    model.modelId = modelId;
    model.$subscribe = parsed.subscribe;

    model.subscribe.forEach((sub) => {
      const meshAddress = MeshAddress.fromHex(sub);
      if (isUndefined(meshAddress)) {
        throw new DecodingError("Address must be 4-character hexadecimal string or UUID.");
      }
      if (!meshAddress.address.isGroup && !meshAddress.address.isVirtual) {
        throw new DecodingError("Address must be of group or virtual type.");
      }
    });
    // TODO: add publish
    model.$bind = parsed.bind.map((keyIndex) => new KeyIndex(keyIndex));
    model.handler = undefined;
    return model;
  }

  /**
   * Returns all ``Model`` instances that are in a hierarchy of *Extend* relationship with this Model.
   *
   * The *Extend* relationship is explained in Mesh Profile 1.0.1, chapter 2.3.6.
   *
   * NOTE: Models that operate on bound states share a single instance of a Subscription List per Element.
   *
   * NOTE: Model extension is only defined for SIG Models. Currently it is not possible to
   *         get relationships between Vendor Models, and for those this method returns an empty list.
   */
  public get relatedModels(): Array<Model> {
    // The Model must be on an Element on a Node.
    const parentElement = this.parentElement;
    if (!parentElement) return [];
    const node = parentElement.parentNode;
    if (!node) return [];
    // Get a list of all models on the Node.
    const models = node.elements.flatMap((element) => element.models);

    const result: Model[] = [];
    const queue: Model[] = [this];

    while (queue.length) {
      const currentModel = queue.shift()!;
      if (!result.some((model) => model.modelId === currentModel?.modelId)) {
        if (currentModel?.modelId != this.modelId) {
          result.push(currentModel);
        }
        const directlyExtendedModels = models.filter((model) =>
          model.extendsDirectly(currentModel),
        );
        queue.push(...directlyExtendedModels);
        const extendedByModels = models.filter((model) => currentModel.extendsDirectly(model));
        queue.push(...extendedByModels);
      }
    }

    return result.sort((a, b) => {
      if (a.parentElement!.index != b.parentElement!.index) {
        return a.parentElement!.index - b.parentElement!.index;
      }
      return a.modelId - b.modelId;
    });
  }

  /**
   * List of Application Keys bound to this Model.
   *
   * The list will not contain unknown Application Keys bound
   * to this Model, possibly bound by other Provisioner.
   *
   * If the Node does not belong to any mesh network, this method returns an empty array.
   * In that case use ``Model.isBoundTo()`` instead.
   */
  public get boundApplicationKeys(): Array<ApplicationKey> {
    return (
      this.parentElement?.parentNode?.applicationKeys.filter((key) => key.isBoundToModel(this)) ??
      []
    );
  }

  public get applicationKeys() {
    const keys = this.parentElement?.parentNode?.applicationKeys ?? [];
    return ApplicationKeys.applicationKeysAvailableForModel(keys, this);
  }

  public constructor(
    modelId: UInt32,
    private $subscribe: Array<string> = [],
    private $bind: Array<KeyIndex> = [],
    /**
     * The model message handler. This is non-`undefined` for supported local Models
     * and `undefined` for Models of remote Nodes.
     */
    public handler?: ModelHandler,
  ) {
    this.modelId = modelId;

    makeObservable<Model, "$bind">(this, {
      modelId: observable,
      $bind: observable,
      parentElement: observable,

      bind: computed,
      boundApplicationKeys: computed,
      applicationKeys: computed,

      copyFrom: action,
      unbindApplicationKeyWithIndex: action,
      bindApplicationKeyWithIndex: action,
    });
  }

  public static fromSigModelId(sigModelId: SigModelId): Model {
    return new Model(sigModelId);
  }

  public static fromSigModelIdAndHandler(sigModelId: UInt16, handler: ModelHandler) {
    const model = new Model(sigModelId);
    model.handler = handler;
    return model;
  }

  /**
   * Returns whether that Model directly extends the given ``Model``.
   *
   * This method only checks direct Extend relationship, not hierarchical. If a Model A extends B,
   * which extends C, this method will return `false` if checked with A and C. Base Models
   * may be on the same Element or on an Element with a lower index.
   *
   * The *Extend* relationship is explained in Mesh Profile 1.0.1, chapter 2.3.6.
   *
   * NOTE: Models in Extend relationship share their Subscription List if they are on the same Element.
   *
   * NOTE: Model extension is only defined for SIG Models. Currently it is not possible to
   *         get relationships between Vendor Models, and for those this method returns `false`.
   *
   * @param model A Model to be checked.
   * @returns `True` if the given Model is a *base* Model of that one, `false` otherwise.
   */
  public extendsDirectly(_other: Model): boolean {
    return false;
  }

  /**
   * Copies the properties from the given Model.
   *
   * @param model The Model to copy from.
   */
  public copyFrom(model: Model) {
    this.$bind = model.bind;
    this.$publish = model.publish;
    this.$subscribe = model.subscribe;
  }

  /**
   * Returns whether the Model is subscribed to the given `Group`.
   *
   * @param group The Group to check subscription to.
   * @returns `True` if the Model is subscribed to the Group, `false` otherwise.
   */
  public isSubscribedToGroup(group: Group): boolean {
    return this.isSubscribedToMeshAddress(group.address);
  }

  /**
   * Returns whether the Model is subscribed to the given `MeshAddress`.
   *
   * @param address The address to check subscription to.
   * @returns `True` if the Model is subscribed to a `Group` with given, address, `false` otherwise.
   */
  public isSubscribedToMeshAddress(address: MeshAddress): boolean {
    return this.subscribe.includes(address.hex);
  }

  /**
   * Adds the given Application Key Index to the bound keys.
   *
   * @param applicationKeyIndex The Application Key index to bind.
   */
  public bindApplicationKeyWithIndex(applicationKeyIndex: KeyIndex) {
    if (this.bind.some((index) => index.equal(applicationKeyIndex))) {
      return;
    }
    this.$bind = produce(this.$bind, (draft) => {
      draft.push(applicationKeyIndex);
    });
    this.bind.sort((a, b) => a.valueOf() - b.valueOf());
    this.parentElement?.parentNode?.meshNetwork?.updateTimestamp();
  }

  /**
   * Removes the Application Key binding to with the given Key Index
   * and clears the publication, if it was set to use the same key.
   *
   * @param applicationKeyIndex The Application Key index to unbind.
   */
  public unbindApplicationKeyWithIndex(applicationKeyIndex: KeyIndex) {
    const index = this.bind.findIndex((key) => key.equal(applicationKeyIndex));
    if (index === -1) {
      return;
    }
    this.$bind = produce(this.$bind, (draft) => {
      draft.splice(index, 1);
    });
    // If this Application Key was used for publication,
    // the publication has been canceled.
    const publish = this.$publish;
    if (publish && publish.index.equal(applicationKeyIndex)) {
      this.$publish = undefined;
    }
    this.parentElement?.parentNode?.meshNetwork?.updateTimestamp();
  }
}

createModelSchema(Model, {
  modelId: custom(
    (v: UInt16) => toPaddedHex16(v),
    (v: string) => v,
  ),
  bind: list(
    custom(
      (v: KeyIndex) => v.valueOf(),
      (v: string) => v,
    ),
  ),
  publish: object(Publish as unknown as Clazz<object>),
  subscribe: list(primitive()),
});
