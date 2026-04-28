import { beforeEach, describe, expect, it } from "vitest";
import {
  Address,
  ClosedRange,
  Data,
  SigModelId,
  Storage,
  UUID,
  Location,
  SceneNumber,
  ExportConfiguration,
} from "@blemeshjs/utils";
import { Crypto } from "@blemeshjs/crypto";
import { serialize } from "serializr";
import { hexToUint8Array, stringToUint8Array } from "uint8array-extras";
import {
  MeshNetwork,
  NetworkKey,
  NetworkKeys,
  ConfigCompositionDataStatus,
  Element,
  Model,
  Node,
  ApplicationKey,
  Provisioner,
  AddressRange,
  SceneRange,
} from "../src/index.js";
import { Security } from "../src/mesh-models/security.js";

class TestStorage extends Storage {
  load(): Promise<Data | undefined> {
    throw new Error("Method not implemented.");
  }
  save(_data: Data): Promise<boolean> {
    return Promise.resolve(true);
  }
  get(_key: string): Promise<unknown> {
    throw new Error("Method not implemented.");
  }
  set(_key: string, _value: unknown): Promise<void> {
    return Promise.resolve();
  }
  remove(_key: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  clear(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

describe("Exporting", () => {
  let meshNetwork: MeshNetwork;

  beforeEach(() => {
    meshNetwork = new MeshNetwork("Test network", new TestStorage(), new UUID());
    // Create 2 Network Keys (Primary Network Key is generated automatically),
    // including one Guest Network Key.
    let primaryNetworkKey: NetworkKey | undefined;
    let guestNetworkKey: NetworkKey | undefined;
    expect(() => {
      const key = meshNetwork.addNetworkKeyWithName(
        Crypto.generateRandom(128),
        "Guest Network Key",
      );
      if (key instanceof NetworkKey) guestNetworkKey = key;
      else throw key;
    }).not.toThrow();
    expect(guestNetworkKey).toBeDefined();
    // eslint-disable-next-line prefer-const
    primaryNetworkKey = NetworkKeys.primaryKey(meshNetwork.networkKeys);
    expect(primaryNetworkKey).toBeDefined();
    expect(meshNetwork.networkKeys.length).toBe(2); // Primary Network Key is created automatically.

    // Create 3 Application Keys, including one Guest Key.
    let lightsKey: ApplicationKey | undefined;
    let locksKey: ApplicationKey | undefined;
    let guestKey: ApplicationKey | undefined;
    expect(() => {
      const key = meshNetwork.addApplicationKeyWithProperties(Crypto.generateRandom(128), "Lights");
      if (key instanceof ApplicationKey) lightsKey = key;
      else throw key;
    }).not.toThrow();
    expect(() => {
      const key = meshNetwork.addApplicationKeyWithProperties(Crypto.generateRandom(128), "Locks");
      if (key instanceof ApplicationKey) locksKey = key;
      else throw key;
    }).not.toThrow();
    expect(() => {
      const key = meshNetwork.addApplicationKeyWithProperties(
        Crypto.generateRandom(128),
        "Guest Lights",
      );
      if (key instanceof ApplicationKey) guestKey = key;
      else throw key;
    }).not.toThrow();
    expect(lightsKey).toBeDefined();
    expect(locksKey).toBeDefined();
    expect(guestKey).toBeDefined();
    expect(() => guestKey?.bindToNetworkKey(guestNetworkKey!)).not.toThrow();
    expect(lightsKey?.boundNetworkKeyIndex).toEqual(primaryNetworkKey?.index);
    expect(locksKey?.boundNetworkKeyIndex).toEqual(primaryNetworkKey?.index);
    expect(guestKey?.boundNetworkKeyIndex).toEqual(guestNetworkKey?.index);

    // Define Provisioners. The main one, and one for the Guest.
    const mainProvisioner = new Provisioner(
      "Main Provisioner",
      new UUID(),
      [new AddressRange(new ClosedRange(new Address(0x0001), new Address(0x0010)))],
      [new AddressRange(new ClosedRange(new Address(0xc001), new Address(0xc010)))],
      [new SceneRange(new ClosedRange(new SceneNumber(0x0001), new SceneNumber(0x0010)))],
    );
    expect(async () => {
      await meshNetwork.addProvisioner(mainProvisioner);
    }).not.toThrow();
    expect(meshNetwork.localProvisioner?.node).toBeDefined();
    expect(meshNetwork.localProvisioner?.node?.elementsCount ?? 0).toBeGreaterThanOrEqual(1);
    expect(meshNetwork.localProvisioner?.node?.networkKeys.length).toBe(2);
    expect(meshNetwork.localProvisioner?.node?.applicationKeys.length).toBe(3);

    const guestProvisioner = new Provisioner(
      "Guest Provisioner",
      new UUID(),
      // Single Address, just for the single Element.
      [new AddressRange(new ClosedRange(new Address(0x1000), new Address(0x1000)))],
      [],
      [],
    );
    expect(async () => {
      await meshNetwork.addProvisionerWithAddress(guestProvisioner, new Address(0x1000));
    }).not.toThrow();
    expect(guestProvisioner.node).toBeDefined();

    // As the Composition Data have not been obtained from the Guest Provisioner's Node, the
    // Primary Element is unknown.
    expect(guestProvisioner.node?.primaryElement).toBeUndefined();

    const data = hexToUint8Array("004600CDAB0001FFFFFFFF01000300000002000110");
    guestProvisioner.node?.applyCompositionData(ConfigCompositionDataStatus.fromData(data)!);

    // As the Composition Data have been obtained, now the Primary Element should be available.
    expect(guestProvisioner.node?.primaryElement).toBeDefined();

    // Setup Nodes in the kitchen.
    const kitchenLightSwitch = Node.withAssignedNetworkKeyAndAddress(
      "Kitchen Light Switch",
      new UUID(),
      Crypto.generateRandom(128),
      Security.secure,
      primaryNetworkKey!,
      new Address(0x0002),
    );
    kitchenLightSwitch.addElements([
      new Element("Left button", Location.left, [
        Model.fromSigModelId(SigModelId.configurationServerModelId),
        Model.fromSigModelId(SigModelId.healthServerModelId),
        Model.fromSigModelId(SigModelId.genericOnOffClientModelId),
      ]),
      new Element("Right button", Location.right, [
        Model.fromSigModelId(SigModelId.genericOnOffClientModelId),
      ]),
    ]);

    const kitchenLight = Node.withAssignedNetworkKeyAndAddress(
      "Kitchen Light",
      new UUID(),
      Crypto.generateRandom(128),
      Security.secure,
      primaryNetworkKey!,
      new Address(0x0004),
    );
    kitchenLight.addElement(
      new Element("Main Element", Location.left, [
        Model.fromSigModelId(SigModelId.configurationServerModelId),
        Model.fromSigModelId(SigModelId.healthServerModelId),
        Model.fromSigModelId(SigModelId.sceneServerModelId),
        Model.fromSigModelId(SigModelId.sceneSetupServerModelId),
        Model.fromSigModelId(SigModelId.genericOnOffServerModelId),
      ]),
    );
    const led = Node.withAssignedNetworkKeyAndAddress(
      "LED",
      new UUID(),
      Crypto.generateRandom(128),
      Security.secure,
      primaryNetworkKey!,
      new Address(0x0005),
    );
    led.addElement(
      new Element("Main Element", Location.left, [
        Model.fromSigModelId(SigModelId.configurationServerModelId),
        Model.fromSigModelId(SigModelId.healthServerModelId),
        Model.fromSigModelId(SigModelId.genericOnOffServerModelId),
        Model.fromSigModelId(SigModelId.sceneServerModelId),
        Model.fromSigModelId(SigModelId.sceneSetupServerModelId),
      ]),
    );
    expect(() => {
      const err = meshNetwork.addNode(kitchenLightSwitch);
      if (err instanceof Error) throw err;
    }).not.toThrow();
    expect(() => {
      const err = meshNetwork.addNode(kitchenLight);
      if (err instanceof Error) throw err;
    }).not.toThrow();
    expect(() => {
      const err = meshNetwork.addNode(led);
      if (err instanceof Error) throw err;
    }).not.toThrow();

    // Configure Light Switch in the kitchen.
    kitchenLightSwitch.addApplicationKey(lightsKey!);
    expect(kitchenLightSwitch.applicationKeys.some((key) => key.equals(lightsKey!))).toBe(true);
    expect(kitchenLightSwitch.applicationKeys.length).toBe(1);
  });

  it("export basic", () => {
    const copy = meshNetwork.copy(ExportConfiguration.full);
    // This test tests implementation detail which may change.
    // In the current version, when copy(ExportConfiguration.full) is called, the
    // same network instance is returned instead of creating an actual
    // copy. If this test fails, check the implementation and fix the
    // test.
    expect(copy).toEqual(meshNetwork);
  });

  it("export full", () => {
    const copy = MeshNetwork.copy(meshNetwork, ExportConfiguration.full);
    expect(copy.uuid).toEqual(meshNetwork.uuid);
    expect(copy.meshName).toBe(meshNetwork.meshName);
    expect(copy.timestamp).toBe(meshNetwork.timestamp);
    expect(copy.isPartial).toBe(false);
    expect(copy.networkKeys.length).toBe(meshNetwork.networkKeys.length);
    expect(copy.applicationKeys.length).toBe(meshNetwork.applicationKeys.length);
    expect(copy.provisioners.length).toBe(meshNetwork.provisioners.length);
    expect(copy.nodes.length).toBe(meshNetwork.nodes.length);
    expect(copy.groups.length).toBe(meshNetwork.groups.length);
    expect(copy.scenes.length).toBe(copy.scenes.length);
    expect(copy.networkExclusions).toBeDefined();
    expect(copy.networkExclusions?.length ?? 0).toBe(meshNetwork.networkExclusions?.length ?? 0);

    copy.nodes.forEach((node) => {
      const matchingNode = meshNetwork.nodeWithUuid(node.uuid);
      expect(matchingNode).toBeDefined();
      expect(node.networkKeys.length).toBe(matchingNode?.networkKeys.length);
      expect(node.applicationKeys.length).toBe(matchingNode?.applicationKeys.length);
      expect(node.elements.length).toBe(matchingNode?.elements.length);
      node.elements.forEach((element) => {
        const matchingElement = matchingNode?.elementWithAddress(element.unicastAddress);
        expect(matchingElement).toBeDefined();
        expect(element.models.length).toBe(matchingElement?.models.length);
      });
    });

    // Compare the generated JSON outputs.
    let originalData: Data | undefined, copyData: Data | undefined;
    expect(() => {
      originalData = stringToUint8Array(JSON.stringify(serialize(MeshNetwork, meshNetwork)));
    }).not.toThrow();
    expect(() => {
      copyData = stringToUint8Array(JSON.stringify(serialize(MeshNetwork, meshNetwork)));
    }).not.toThrow();
    expect(originalData).toEqual(copyData);
    expect(copy).not.toBe(meshNetwork);
  });
});
