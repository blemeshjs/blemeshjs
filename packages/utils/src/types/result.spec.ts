import { describe, expect, it } from "vitest";
import { Result, Success, Failure } from "./result.js";

describe("Result", () => {
  describe("Success", () => {
    it("should create a Success instance", () => {
      const result = Result.success(42);
      expect(result).toBeInstanceOf(Success);
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.getOrThrow()).toBe(42);
    });

    it("should map value", () => {
      const result = Result.success(2).map((x) => x * 3);
      expect(result).toBeInstanceOf(Success);
      expect(result.getOrThrow()).toBe(6);
    });

    it("should mapError to same value", () => {
      const result = Result.success(2).mapError((_e) => new Error("error"));
      expect(result).toBeInstanceOf(Success);
      expect(result.getOrThrow()).toBe(2);
    });

    it("should flatMap to another Success", () => {
      const result = Result.success(2).flatMap((x) => Result.success(x + 1));
      expect(result).toBeInstanceOf(Success);
      expect(result.getOrThrow()).toBe(3);
    });

    it("should catch error in map and return Failure", () => {
      const result = Result.success(2).map(() => {
        throw new Error("fail");
      });
      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure).toBe(true);
    });

    it("should catch error in flatMap and return Failure", () => {
      const result = Result.success(2).flatMap(() => {
        throw new Error("fail");
      });
      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure).toBe(true);
    });
  });

  describe("Failure", () => {
    it("should create a Failure instance", () => {
      const result = Result.failure(new Error("err"));
      expect(result).toBeInstanceOf(Failure);
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(() => result.getOrThrow()).toThrow("err");
    });

    it("should map to Failure", () => {
      const result = Result.failure(new Error("err")).map((x) => x);
      expect(result).toBeInstanceOf(Failure);
    });

    it("should mapError to new Failure", () => {
      const result = Result.failure(new Error("err")).mapError((_e) => new Error("new"));
      expect(result).toBeInstanceOf(Failure);
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("new");
    });

    it("should flatMap to Failure", () => {
      const result = Result.failure(new Error("err")).flatMap((x) => Result.success(x));
      expect(result).toBeInstanceOf(Failure);
    });
  });

  describe("Result.try", () => {
    it("should return Success if no error", () => {
      const result = Result.try(() => 5);
      expect(result).toBeInstanceOf(Success);
      expect(result.getOrThrow()).toBe(5);
    });

    it("should return Failure if error thrown", () => {
      const result = Result.try(() => {
        throw new Error("fail");
      });
      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure).toBe(true);
    });
  });

  describe("Result.tryAsync", () => {
    it("should resolve to Success if no error", async () => {
      const result = await Result.tryAsync(async () => Promise.resolve(10));
      expect(result).toBeInstanceOf(Success);
      expect(result.getOrThrow()).toBe(10);
    });

    it("should resolve to Failure if error thrown", async () => {
      const result = await Result.tryAsync(() => {
        throw new Error("fail");
      });
      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure).toBe(true);
    });
  });
});
