import { describe, it, expect, beforeEach, vi } from "vitest";
import { CoreMeshNetworkManager } from "./core-mesh-network-manager.js";
import type { Storage } from "@blemeshjs/utils";

function makeStorage(): Storage {
  let data: Uint8Array | undefined;
  const store = new Map<string, unknown>();
  return {
    load: vi.fn(() => {
      if (!data) throw new Error("No data found");
      return data;
    }),
    save: vi.fn((d: Uint8Array) => {
      data = d;
      return true;
    }),
    get: vi.fn((key: string) => store.get(key)),
    set: vi.fn((key: string, value: unknown) => {
      store.set(key, value);
    }),
    remove: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
      data = undefined;
    }),
  };
}

describe("CoreMeshNetworkManager", () => {
  beforeEach(() => {
    // Reset the singleton between tests
    // @ts-expect-error accessing private static
    CoreMeshNetworkManager.$instance = undefined;
  });

  it("throws before initialize() is called", () => {
    expect(() => CoreMeshNetworkManager.instance).toThrow();
  });

  it("returns an instance after initialize()", () => {
    const storage = makeStorage();
    const instance = CoreMeshNetworkManager.initialize(storage);
    expect(instance).toBeInstanceOf(CoreMeshNetworkManager);
    expect(CoreMeshNetworkManager.instance).toBe(instance);
  });

  it("returns the same instance on repeated access", () => {
    const storage = makeStorage();
    CoreMeshNetworkManager.initialize(storage);
    expect(CoreMeshNetworkManager.instance).toBe(CoreMeshNetworkManager.instance);
  });

  it("initialize() replaces the previous instance", () => {
    const s1 = makeStorage();
    const s2 = makeStorage();
    const first = CoreMeshNetworkManager.initialize(s1);
    const second = CoreMeshNetworkManager.initialize(s2);
    expect(second).not.toBe(first);
    expect(CoreMeshNetworkManager.instance).toBe(second);
  });

  it("nodes returns undefined when no mesh network is loaded", () => {
    CoreMeshNetworkManager.initialize(makeStorage());
    expect(CoreMeshNetworkManager.instance.nodes).toBeUndefined();
  });

  it("localProvisionerNode returns undefined when no mesh network is loaded", () => {
    CoreMeshNetworkManager.initialize(makeStorage());
    expect(CoreMeshNetworkManager.instance.localProvisionerNode).toBeUndefined();
  });
});
