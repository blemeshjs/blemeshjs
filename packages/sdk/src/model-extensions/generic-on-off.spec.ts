import { describe, it, expect, beforeAll } from "vitest";
import { GenericOnOff } from "./generic-on-off.js";
import { AccessError, Data, Storage } from "@blemeshjs/utils";
import type { Model } from "@blemeshjs/core";
import { CoreMeshNetworkManager } from "../mesh-network/core-mesh-network-manager.js";

function makeModel(boundAppKeyCount = 0): Model {
  return {
    boundApplicationKeys: Array.from({ length: boundAppKeyCount }, (_, i) => ({
      name: `key${i}`,
    })),
  } as unknown as Model;
}

class TestStorage extends Storage {
  load(): (Data | undefined) | Promise<Data | undefined> {
    throw new Error("Method not implemented.");
  }
  save(_data: Data): boolean | Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  get(_key: string): unknown {
    throw new Error("Method not implemented.");
  }
  set(_key: string, _value: unknown): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
  remove(_key: string): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
  clear(): void | Promise<void> {
    throw new Error("Method not implemented.");
  }
}

describe("GenericOnOff", () => {
  beforeAll(() => {
    CoreMeshNetworkManager.initialize(new TestStorage());
  });

  it("has a stable key property", () => {
    expect(GenericOnOff.key).toBe("genericOnOff");
  });

  describe("get()", () => {
    it("throws AccessError.modelNotBoundToAppKey when no keys are bound", async () => {
      const model = makeModel(0);
      const ext = GenericOnOff(model, CoreMeshNetworkManager.instance);
      await expect(ext.get()).rejects.toThrow(AccessError.modelNotBoundToAppKey.message);
    });
  });

  describe("set()", () => {
    it("throws AccessError.modelNotBoundToAppKey when no keys are bound", async () => {
      const model = makeModel(0);
      const ext = GenericOnOff(model, CoreMeshNetworkManager.instance);
      await expect(ext.set(true)).rejects.toThrow(AccessError.modelNotBoundToAppKey.message);
    });
  });
});
