import { describe, expect, it } from "vitest";
import { AccessError } from "./access-error.js";

describe("AccessError", () => {
  it("should have invalidSource static error", () => {
    const error = AccessError.invalidSource;
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe("Local Provisioner does not have Unicast Address specified.");
  });

  it("should have invalidElement static error", () => {
    const error = AccessError.invalidElement;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe("Element does not belong to the local Node.");
  });

  it("should have invalidTtl static error", () => {
    const error = AccessError.invalidTtl;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe("Invalid TTL.");
  });

  it("should have invalidDestination static error", () => {
    const error = AccessError.invalidDestination;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe("The destination address is invalid or unknown.");
  });

  it("should have invalidKey static error", () => {
    const error = AccessError.invalidKey;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe(
      "The target Node cannot decrypt messages sent with the specified key.",
    );
  });

  it("should have modelNotBoundToAppKey static error", () => {
    const error = AccessError.modelNotBoundToAppKey;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe("No Application Key bound to the given Model.");
  });

  it("should have noDeviceKey static error", () => {
    const error = AccessError.noDeviceKey;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe("Unknown Device Key.");
  });

  it("should have cannotRelay static error", () => {
    const error = AccessError.cannotRelay;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe(
      "No GATT Proxy Node is connected or the connected Proxy does not know the Network Key used to secure this message.",
    );
  });

  it("should have cannotDelete static error", () => {
    const error = AccessError.cannotDelete;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe(
      "Cannot delete the last Network Key or a key used to secure the message.",
    );
  });

  it("should have busy static error", () => {
    const error = AccessError.busy;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe(
      "Unable to send a message to specified address. Another transfer in progress.",
    );
  });

  it("should have timeout static error", () => {
    const error = AccessError.timeout;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe("Request timed out.");
  });

  it("should have cancelled static error", () => {
    const error = AccessError.cancelled;
    expect(error).toBeInstanceOf(AccessError);
    expect(error.message).toBe("Message cancelled.");
  });

  it("all static errors should inherit from Error", () => {
    expect(AccessError.invalidSource instanceof Error).toBe(true);
    expect(AccessError.timeout instanceof Error).toBe(true);
    expect(AccessError.cancelled instanceof Error).toBe(true);
  });

  it("all static errors should have stack traces", () => {
    expect(AccessError.invalidSource.stack).toBeDefined();
    expect(AccessError.timeout.stack).toBeDefined();
    expect(AccessError.cancelled.stack).toBeDefined();
  });
});
