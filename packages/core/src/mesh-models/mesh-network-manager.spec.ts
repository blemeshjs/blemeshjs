import { describe, expect, it } from "vitest";
import { MeshNetworkManager } from "./mesh-network-manager.js";
import { MeshData } from "./mesh-data.js";
import { Data, KeyIndex, MeshNetworkError, SigModelId, Storage, Location } from "@blemeshjs/utils";
import { Element } from "./element.js";
import { Model } from "./model.js";
import { stringToUint8Array, uint8ArrayToString } from "uint8array-extras";
import { MeshNetwork } from "./index.js";

class TestStorage extends Storage {
  private savedData: Data | undefined;
  save(data: Data): Promise<boolean> {
    this.savedData = data;
    return Promise.resolve(true);
  }
  load(): Promise<Data | undefined> {
    return Promise.resolve(this.savedData);
  }
  get(key: string): Promise<unknown> {
    if (!this.savedData) throw new Error("No data saved");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const json: any = JSON.parse(uint8ArrayToString(this.savedData));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    return Promise.resolve(json[key as any]);
  }
  set(key: string, value: unknown): Promise<void> {
    if (!this.savedData) {
      this.savedData = stringToUint8Array("{}");
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    const json: any = JSON.parse(uint8ArrayToString(this.savedData));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    json[key as any] = value;
    this.savedData = new Uint8Array(Buffer.from(JSON.stringify(json)));
    return Promise.resolve();
  }
  remove(_key: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  clear(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

describe("Mesh Network Manager", () => {
  it("create mesh network", () => {
    const manager = new MeshNetworkManager(new TestStorage(), MeshData, MeshNetwork);
    const network = manager.createNewMeshNetworkWithNameAndProvisionerName(
      "Test Network",
      "Test Provisioner",
    );
    expect(network).toBeDefined();
    const isMeshNetworkError = network instanceof MeshNetworkError;
    expect(isMeshNetworkError).toBe(false);
    if (!isMeshNetworkError) {
      expect(network.meshName).toBe("Test Network");
      expect(network.provisioners.length).toBe(1);
      expect(network.provisioners[0].name).toBe("Test Provisioner");
      expect(network.networkKeys.length).toBe(1);
      expect(network.nodes.length).toBe(1);
      expect(network.nodes[0].name).toBe("Test Provisioner");
      expect(network.nodes[0].networkKeys[0].index).toEqual(new KeyIndex(0));
      expect(network.nodes[0].netKeys.length).toBe(1);
      // By default only the Primary Element is added
      expect(network.nodes[0]?.elements.length).toBe(1);
      expect(network.nodes[0]?.elementsCount).toEqual(1);
    }
  });

  it("create mesh network with local elements", () => {
    const manager = new MeshNetworkManager(new TestStorage(), MeshData, MeshNetwork);
    const network = manager.createNewMeshNetworkWithNameAndProvisionerName(
      "Test Network",
      "Test Provisioner",
    );

    const element0 = Element.fromLocation(Location.first);
    element0.addModel(Model.fromSigModelId(SigModelId.genericOnOffClientModelId));
    element0.addModel(Model.fromSigModelId(SigModelId.genericLevelClientModelId));

    const element1 = Element.fromLocation(Location.second);
    element1.addModel(Model.fromSigModelId(SigModelId.genericDefaultTransitionTimeClientModelId));
    element1.addModel(Model.fromSigModelId(SigModelId.genericPowerOnOffSetupServerModelId));
    element1.addModel(Model.fromSigModelId(SigModelId.genericPowerLevelServerModelId));
    const isMeshNetworkError = network instanceof MeshNetworkError;
    expect(isMeshNetworkError).toBe(false);
    if (!isMeshNetworkError) {
      // Define local Elements. A Primary Element will be added automatically at index 0.
      manager.localElements = [element0, element1];
      expect(network.nodes.length).toBe(1);
      expect(network.nodes[0]?.elements.length).toBe(2);
      expect(network.nodes[0]?.elementsCount).toBe(2);
      // Verify the Primary Element.
      // TODO: add more models to the Primary Element.
      // expect(network.nodes[0]?.elements[0].models.length).toBe(10);
      expect(network.nodes[0]?.elements[0].containsModelWithSigModelId(0x1001) ?? false).toBe(true);
      expect(network.nodes[0]?.elements[0].containsModelWithSigModelId(0x1003) ?? false).toBe(true);
      // Verify the Secondary Element.
      expect(network.nodes[0]?.elements[1].models.length).toBe(3);
      expect(network.nodes[0]?.elements[1].containsModelWithSigModelId(0x1001) ?? true).toBe(false);
      expect(network.nodes[0]?.elements[1].containsModelWithSigModelId(0x1003) ?? true).toBe(false);
      expect(network.nodes[0]?.elements[1].containsModelWithSigModelId(0x1005) ?? false).toBe(true);
      expect(network.nodes[0]?.elements[1].containsModelWithSigModelId(0x1007) ?? false).toBe(true);
      expect(network.nodes[0]?.elements[1].containsModelWithSigModelId(0x1009) ?? false).toBe(true);
    }
  });

  it("should export mesh network", () => {
    const storage = new TestStorage();
    const manager = new MeshNetworkManager(storage, MeshData, MeshNetwork);
    const network = manager.createNewMeshNetworkWithNameAndProvisionerName(
      "Test Network",
      "Test Provisioner",
    );
    expect(network).toBeDefined();
    const isMeshNetworkError = network instanceof MeshNetworkError;
    expect(isMeshNetworkError).toBe(false);
    expect(async () => await manager.save()).not.toThrow();
    const manager1 = new MeshNetworkManager(storage, MeshData, MeshNetwork);
    expect(async () => await manager1.load()).not.toThrow();
  });
});
