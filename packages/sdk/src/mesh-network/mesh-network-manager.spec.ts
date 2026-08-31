import { beforeEach, describe, expect, it, vi } from "vitest";
import { MeshNetworkManager } from "./mesh-network-manager.js";
import { CoreMeshNetworkManager } from "./core-mesh-network-manager.js";
import { MeshNetworkError, type CBCentralManager, type Storage } from "@blemeshjs/utils";
import type { MeshNetwork } from "@blemeshjs/core";

describe("MeshNetworkManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset singleton between tests.
    // @ts-expect-error accessing protected static for test isolation
    MeshNetworkManager.$instance = undefined;
  });

  it("returns the same singleton instance on repeated access", () => {
    const first = MeshNetworkManager.instance;
    const second = MeshNetworkManager.instance;

    expect(first).toBe(second);
  });

  it("initializes core manager and stores runtime dependencies", () => {
    const manager = MeshNetworkManager.instance;

    const centralManager = {} as CBCentralManager;
    const storage = {} as Storage;
    const coreManager = {} as CoreMeshNetworkManager;

    const initializeSpy = vi.spyOn(CoreMeshNetworkManager, "initialize").mockReturnValue(coreManager);
    vi.spyOn(CoreMeshNetworkManager, "instance", "get").mockReturnValue(coreManager);

    manager.init(centralManager, storage);

    const internals = manager as unknown as {
      $centralManager: CBCentralManager;
      $coreMeshNetworkManager: CoreMeshNetworkManager;
    };

    expect(initializeSpy).toHaveBeenCalledWith(storage);
    expect(internals.$centralManager).toBe(centralManager);
    expect(internals.$coreMeshNetworkManager).toBe(coreManager);
  });

  it("createNewMeshNetwork saves and refreshes connection on success", async () => {
    const manager = MeshNetworkManager.instance;
    const network = {} as MeshNetwork;

    const coreManager = {
      createNewMeshNetworkWithNameAndProvisioner: vi.fn(() => network),
      save: vi.fn(() => Promise.resolve(undefined)),
    };

    (manager as unknown as { $coreMeshNetworkManager: unknown }).$coreMeshNetworkManager = coreManager;

    const refreshSpy = vi.spyOn(manager, "meshNetworkDidChange").mockImplementation(() => undefined);

    const result = await manager.createNewMeshNetwork();

    expect(result).toBe(network);
    expect(coreManager.createNewMeshNetworkWithNameAndProvisioner).toHaveBeenCalledTimes(1);
    expect(coreManager.save).toHaveBeenCalledTimes(1);
    expect(refreshSpy).toHaveBeenCalledTimes(1);
  });

  it("createNewMeshNetwork throws and does not save when core returns MeshNetworkError", async () => {
    const manager = MeshNetworkManager.instance;

    const coreManager = {
      createNewMeshNetworkWithNameAndProvisioner: vi.fn(() => MeshNetworkError.noNetworkKey),
      save: vi.fn(() => Promise.resolve(undefined)),
    };

    (manager as unknown as { $coreMeshNetworkManager: unknown }).$coreMeshNetworkManager = coreManager;

    const refreshSpy = vi.spyOn(manager, "meshNetworkDidChange").mockImplementation(() => undefined);

    await expect(manager.createNewMeshNetwork()).rejects.toBe(MeshNetworkError.noNetworkKey);
    expect(coreManager.save).not.toHaveBeenCalled();
    expect(refreshSpy).not.toHaveBeenCalled();
  });
});
