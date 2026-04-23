import { describe, expect, it } from "vitest";
import { MeshNetworkError } from "./mesh-network-error.js";

describe("MeshNetworkError", () => {
  it("should have overlappingProvisionerRanges static error", () => {
    const error = MeshNetworkError.overlappingProvisionerRanges;
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Overlapping Provisioner ranges.");
  });

  it("should have provisionerUsedInAnotherNetwork static error", () => {
    const error = MeshNetworkError.provisionerUsedInAnotherNetwork;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Provisioner used in another network.");
  });

  it("should have nodeAlreadyExist static error", () => {
    const error = MeshNetworkError.nodeAlreadyExist;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Node with the same UUID already exists in the network.");
  });

  it("should have noAddressAvailable static error", () => {
    const error = MeshNetworkError.noAddressAvailable;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("No address available in Provisioner's range.");
  });

  it("should have addressNotAvailable static error", () => {
    const error = MeshNetworkError.addressNotAvailable;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Address used by another Node in the network.");
  });

  it("should have invalidAddress static error", () => {
    const error = MeshNetworkError.invalidAddress;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Invalid range.");
  });

  it("should have addressNotInAllocatedRange static error", () => {
    const error = MeshNetworkError.addressNotInAllocatedRange;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Address outside Provisioner's range.");
  });

  it("should have provisionerNotInNetwork static error", () => {
    const error = MeshNetworkError.provisionerNotInNetwork;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Provisioner does not belong to the network.");
  });

  it("should have cannotRemove static error", () => {
    const error = MeshNetworkError.cannotRemove;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Object could not be removed.");
  });

  it("should have invalidRange static error", () => {
    const error = MeshNetworkError.invalidRange;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Invalid range.");
  });

  it("should have invalidKey static error", () => {
    const error = MeshNetworkError.invalidKey;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Invalid key: The key must be 128-bit long.");
  });

  it("should have keyInUse static error", () => {
    const error = MeshNetworkError.keyInUse;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Cannot remove: Key in use.");
  });

  it("should have groupAlreadyExists static error", () => {
    const error = MeshNetworkError.groupAlreadyExists;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Group with the same address already exists in the network.");
  });

  it("should have sceneAlreadyExists static error", () => {
    const error = MeshNetworkError.sceneAlreadyExists;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Scene with the same number already exists in the network.");
  });

  it("should have groupInUse static error", () => {
    const error = MeshNetworkError.groupInUse;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Cannot remove: Group in use.");
  });

  it("should have sceneInUse static error", () => {
    const error = MeshNetworkError.sceneInUse;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Cannot remove: Scene in use.");
  });

  it("should have keyIndexOutOfRange static error", () => {
    const error = MeshNetworkError.keyIndexOutOfRange;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Key Index out of range.");
  });

  it("should have noNetworkKey static error", () => {
    const error = MeshNetworkError.noNetworkKey;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("No Network Key.");
  });

  it("should have noApplicationKey static error", () => {
    const error = MeshNetworkError.noApplicationKey;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("No Application Key.");
  });

  it("should have noNetwork static error", () => {
    const error = MeshNetworkError.noNetwork;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Mesh Network not created.");
  });

  it("should have ivIndexTooSmall static error", () => {
    const error = MeshNetworkError.ivIndexTooSmall;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("IV Index too small.");
  });

  it("should have keyIndexAlreadyExists static error", () => {
    const error = MeshNetworkError.keyIndexAlreadyExists;
    expect(error).toBeInstanceOf(MeshNetworkError);
    expect(error.message).toBe("Key with the same index already exists in the network.");
  });

  it("all static errors should inherit from Error", () => {
    expect(MeshNetworkError.overlappingProvisionerRanges instanceof Error).toBe(true);
    expect(MeshNetworkError.noNetwork instanceof Error).toBe(true);
    expect(MeshNetworkError.keyIndexAlreadyExists instanceof Error).toBe(true);
  });

  it("all static errors should have stack traces", () => {
    expect(MeshNetworkError.overlappingProvisionerRanges.stack).toBeDefined();
    expect(MeshNetworkError.noNetwork.stack).toBeDefined();
    expect(MeshNetworkError.keyIndexAlreadyExists.stack).toBeDefined();
  });
});
