import { describe, expect, it } from "vitest";
import { CancellationError } from "./errors.js";

describe("CancellationError", () => {
  it("should create a CancellationError with default message", () => {
    const error = new CancellationError();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CancellationError);
    expect(error.message).toBe("Operation was cancelled");
    expect(error.name).toBe("CancellationError");
  });

  it("should create a CancellationError with custom message", () => {
    const error = new CancellationError("Custom cancellation reason");
    expect(error.message).toBe("Custom cancellation reason");
    expect(error.name).toBe("CancellationError");
  });

  it("should inherit from Error", () => {
    const error = new CancellationError();
    expect(error instanceof Error).toBe(true);
  });

  it("should have stack trace", () => {
    const error = new CancellationError();
    expect(error.stack).toBeDefined();
  });
});
