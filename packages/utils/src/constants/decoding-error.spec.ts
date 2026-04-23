import { describe, expect, it } from "vitest";
import { DecodingError } from "./decoding-error.js";

describe("DecodingError", () => {
  it("should create a DecodingError with custom message", () => {
    const error = new DecodingError("Failed to decode data");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DecodingError);
    expect(error.message).toBe("Failed to decode data");
    expect(error.name).toBe("DecodingError");
  });

  it("should inherit from Error", () => {
    const error = new DecodingError("Test error");
    expect(error instanceof Error).toBe(true);
  });

  it("should have stack trace", () => {
    const error = new DecodingError("Test error");
    expect(error.stack).toBeDefined();
  });
});
