import { describe, expect, it } from "vitest";
import {
  meshTimestamp,
  tryOptionalAsync,
  typeOf,
  assertString,
  isNumber,
  assertNumber,
  isFunction,
  isArray,
  assertArray,
  isNull,
  isObject,
  assertObject,
  isDirectInstanceOf,
  assertDirectInstanceOf,
  assertEnumCase,
  assertBoolean,
} from "./common.js";

class MyClass {}
class AnotherClass {}

describe("Common Helpers", () => {
  describe("typeOf", () => {
    it("returns 'null' for null", () => {
      expect(typeOf(null)).toBe("null");
    });

    it("returns 'undefined' for undefined", () => {
      expect(typeOf(undefined)).toBe("undefined");
    });

    it("returns constructor name for objects", () => {
      expect(typeOf({})).toBe("Object");
      expect(typeOf([])).toBe("Array");
      expect(typeOf(new Date())).toBe("Date");
    });

    it("returns typeof for primitives", () => {
      expect(typeOf(42)).toBe("Number");
      expect(typeOf("hello")).toBe("String");
      expect(typeOf(true)).toBe("Boolean");
      expect(typeOf(Symbol("sym"))).toBe("Symbol");
    });

    it("returns typeof for functions", () => {
      expect(typeOf(function () {})).toBe("Function");
      expect(typeOf(() => {})).toBe("Function");
    });
    it("returns the class name for custom class instances", () => {
      const myInstance = new MyClass();
      const anotherMyInstance = new MyClass();
      const anotherInstance = new AnotherClass();
      expect(typeOf(myInstance)).toBe("MyClass");
      expect(typeOf(anotherMyInstance)).toBe("MyClass");
      expect(typeOf(anotherMyInstance) === typeOf(myInstance)).toBe(true);
      expect(typeOf(anotherInstance)).toBe("AnotherClass");
    });

    it("returns 'Object' for plain objects", () => {
      expect(typeOf({ foo: "bar" })).toBe("Object");
    });
  });
  describe("tryOptionalAsync", () => {
    it("returns the resolved value when the async function succeeds", async () => {
      const fn = async () => await Promise.resolve("success");
      const result = await tryOptionalAsync(fn);
      expect(result).toBe("success");
    });

    it("returns null when the async function throws", async () => {
      const fn = async () => {
        await Promise.reject(new Error("fail"));
      };
      const result = await tryOptionalAsync(fn);
      expect(result).toBeNull();
    });

    it("works with resolved promises of different types", async () => {
      const fnNumber = async () => await Promise.resolve(42);
      const fnObject = async () => await Promise.resolve({ foo: "bar" });
      expect(await tryOptionalAsync(fnNumber)).toBe(42);
      expect(await tryOptionalAsync(fnObject)).toEqual({ foo: "bar" });
    });
  });

  describe("meshExportTimestamp", () => {
    it("formats a UTC timestamp with correct offset", () => {
      // Force timezone to UTC-8 for predictable output
      const realTZ = process.env.TZ;
      process.env.TZ = "America/Los_Angeles";

      const ts = Date.UTC(2018, 11, 23, 19, 45, 22); // 2018-12-23T19:45:22Z
      expect(meshTimestamp(ts)).toBe("2018-12-23T11:45:22-08:00");

      process.env.TZ = realTZ; // Restore original TZ
    });

    it("pads single-digit month/day/hour/minute/second", () => {
      // Force timezone to UTC+2
      const realTZ = process.env.TZ;
      process.env.TZ = "Europe/Berlin";

      const ts = Date.UTC(2025, 0, 5, 6, 7, 8); // 2025-01-05T06:07:08Z
      expect(meshTimestamp(ts)).toBe("2025-01-05T07:07:08+01:00");

      process.env.TZ = realTZ;
    });

    it("handles positive offset correctly", () => {
      // Force timezone to UTC+5:30
      const realTZ = process.env.TZ;
      process.env.TZ = "Asia/Kolkata";

      const ts = Date.UTC(2025, 7, 11, 10, 0, 0); // 2025-08-11T10:00:00Z
      expect(meshTimestamp(ts)).toBe("2025-08-11T15:30:00+05:30");

      process.env.TZ = realTZ;
    });
  });

  describe("assertString", () => {
    it("should not throw for string values", () => {
      expect(() => assertString("hello")).not.toThrow();
      expect(() => assertString("")).not.toThrow();
    });

    it("should throw for non-string values", () => {
      expect(() => assertString(123)).toThrow(TypeError);
      expect(() => assertString(null)).toThrow(TypeError);
      expect(() => assertString(undefined)).toThrow(TypeError);
      expect(() => assertString({})).toThrow(TypeError);
    });

    it("should throw with custom message", () => {
      expect(() => assertString(123, "Custom error")).toThrow("Custom error");
    });
  });

  describe("isNumber", () => {
    it("should return true for valid numbers", () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-42)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
    });

    it("should return false for NaN", () => {
      expect(isNumber(NaN)).toBe(false);
    });

    it("should return false for non-numbers", () => {
      expect(isNumber("42")).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });
  });

  describe("assertNumber", () => {
    it("should not throw for valid numbers", () => {
      expect(() => assertNumber(42)).not.toThrow();
      expect(() => assertNumber(0)).not.toThrow();
      expect(() => assertNumber(-42)).not.toThrow();
    });

    it("should throw for NaN", () => {
      expect(() => assertNumber(NaN)).toThrow(TypeError);
    });

    it("should throw for non-numbers", () => {
      expect(() => assertNumber("42")).toThrow(TypeError);
      expect(() => assertNumber(null)).toThrow(TypeError);
    });

    it("should throw with custom message", () => {
      expect(() => assertNumber("42", "Must be number")).toThrow("Must be number");
    });
  });

  describe("isFunction", () => {
    it("should return true for functions", () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function () {})).toBe(true);
      expect(isFunction(class {})).toBe(true);
    });

    it("should return false for non-functions", () => {
      expect(isFunction(null)).toBe(false);
      expect(isFunction(undefined)).toBe(false);
      expect(isFunction(42)).toBe(false);
      expect(isFunction({})).toBe(false);
    });
  });

  describe("isArray", () => {
    it("should return true for arrays", () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });

    it("should return false for non-arrays", () => {
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
      expect(isArray({})).toBe(false);
      expect(isArray("array")).toBe(false);
    });

    it("should validate array elements with assertion", () => {
      const isNumberAssertion = (val: unknown): val is number => typeof val === "number";
      expect(isArray([1, 2, 3], isNumberAssertion)).toBe(true);
      expect(isArray([1, "2", 3], isNumberAssertion)).toBe(false);
    });
  });

  describe("assertArray", () => {
    it("should not throw for arrays", () => {
      expect(() => assertArray([])).not.toThrow();
      expect(() => assertArray([1, 2, 3])).not.toThrow();
    });

    it("should throw for non-arrays", () => {
      expect(() => assertArray(null)).toThrow(TypeError);
      expect(() => assertArray({})).toThrow(TypeError);
    });

    it("should validate array elements with assertion", () => {
      const assertNumberElement = (val: unknown): asserts val is number => {
        if (typeof val !== "number") throw new TypeError("Not a number");
      };
      expect(() => assertArray([1, 2, 3], assertNumberElement)).not.toThrow();
      expect(() => assertArray([1, "2", 3], assertNumberElement)).toThrow(TypeError);
    });
  });

  describe("isNull", () => {
    it("should return true for null", () => {
      expect(isNull(null)).toBe(true);
    });

    it("should return false for non-null values", () => {
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull("")).toBe(false);
      expect(isNull(false)).toBe(false);
    });
  });

  describe("isObject", () => {
    it("should return true for objects", () => {
      expect(isObject({})).toBe(true);
      expect(isObject([])).toBe(true);
      expect(isObject(() => {})).toBe(true);
      expect(isObject(new Date())).toBe(true);
    });

    it("should return false for null", () => {
      expect(isObject(null)).toBe(false);
    });

    it("should return false for primitives", () => {
      expect(isObject(42)).toBe(false);
      expect(isObject("string")).toBe(false);
      expect(isObject(true)).toBe(false);
    });
  });

  describe("assertObject", () => {
    it("should not throw for objects", () => {
      expect(() => assertObject({})).not.toThrow();
      expect(() => assertObject([])).not.toThrow();
      expect(() => assertObject(() => {})).not.toThrow();
    });

    it("should throw for null and primitives", () => {
      expect(() => assertObject(null)).toThrow(TypeError);
      expect(() => assertObject(42)).toThrow(TypeError);
      expect(() => assertObject("string")).toThrow(TypeError);
    });
  });

  describe("isDirectInstanceOf", () => {
    it("should return true for direct instances", () => {
      expect(isDirectInstanceOf(new MyClass(), MyClass)).toBe(true);
      expect(isDirectInstanceOf(new AnotherClass(), AnotherClass)).toBe(true);
    });

    it("should return false for non-instances", () => {
      expect(isDirectInstanceOf(null, MyClass)).toBe(false);
      expect(isDirectInstanceOf(undefined, MyClass)).toBe(false);
      expect(isDirectInstanceOf({}, MyClass)).toBe(false);
    });

    it("should return false for instances of different classes", () => {
      expect(isDirectInstanceOf(new MyClass(), AnotherClass)).toBe(false);
    });
  });

  describe("assertDirectInstanceOf", () => {
    it("should not throw for direct instances", () => {
      expect(() => assertDirectInstanceOf(new MyClass(), MyClass)).not.toThrow();
    });

    it("should throw for non-instances", () => {
      expect(() => assertDirectInstanceOf({}, MyClass)).toThrow(TypeError);
      expect(() => assertDirectInstanceOf(null, MyClass)).toThrow(TypeError);
    });
  });

  describe("assertEnumCase", () => {
    enum TestEnum {
      A = 1,
      B = 2,
      C = 3,
    }

    it("should not throw for valid enum values", () => {
      expect(() => assertEnumCase(1, TestEnum)).not.toThrow();
      expect(() => assertEnumCase(2, TestEnum)).not.toThrow();
      expect(() => assertEnumCase(3, TestEnum)).not.toThrow();
    });

    it("should throw for invalid enum values", () => {
      expect(() => assertEnumCase(4, TestEnum)).toThrow(TypeError);
      expect(() => assertEnumCase(0, TestEnum)).toThrow(TypeError);
    });
  });

  describe("assertBoolean", () => {
    it("should not throw for boolean values", () => {
      expect(() => assertBoolean(true)).not.toThrow();
      expect(() => assertBoolean(false)).not.toThrow();
    });

    it("should throw for non-boolean values", () => {
      expect(() => assertBoolean(1)).toThrow(TypeError);
      expect(() => assertBoolean("true")).toThrow(TypeError);
      expect(() => assertBoolean(null)).toThrow(TypeError);
    });
  });
});
