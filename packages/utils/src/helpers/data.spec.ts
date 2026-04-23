import { describe, it, expect } from "vitest";
import {
  bitArrayToUint8Array,
  readUInt16BE,
  readUInt16LE,
  readUInt32BE,
  readUInt32LE,
  dataViewToUint8Array,
  xorUint8Arrays,
} from "./data.js";
import sjcl from "sjcl";

describe("data.helper", () => {
  describe("bitArrayToUint8Array", () => {
    it("should convert sjcl.BitArray to Uint8Array", () => {
      // sjcl.BitArray is just number[] for this usage
      const bits: sjcl.BitArray = [0x12345678, 0x90abcdef];
      const result = bitArrayToUint8Array(bits);
      expect(Array.from(result)).toEqual([0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef]);
    });
  });

  describe("dataViewToUint8Array", () => {
    it("should convert DataView to Uint8Array", () => {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint8(0, 0x12);
      view.setUint8(1, 0x34);
      view.setUint8(2, 0x56);
      view.setUint8(3, 0x78);

      const result = dataViewToUint8Array(view);
      expect(Array.from(result)).toEqual([0x12, 0x34, 0x56, 0x78]);
    });
  });

  describe("xorUint8Arrays", () => {
    it("should XOR two Uint8Arrays", () => {
      const a = new Uint8Array([0xff, 0x00, 0xaa, 0x55]);
      const b = new Uint8Array([0x0f, 0xf0, 0xa5, 0x5a]);
      const result = xorUint8Arrays(a, b);

      expect(Array.from(result)).toEqual([0xf0, 0xf0, 0x0f, 0x0f]);
    });

    it("should handle arrays of same length", () => {
      const a = new Uint8Array([0x12, 0x34]);
      const b = new Uint8Array([0x12, 0x34]);
      const result = xorUint8Arrays(a, b);

      expect(Array.from(result)).toEqual([0x00, 0x00]);
    });
  });
});

describe("readUInt32BE", () => {
  it("should read a 32-bit unsigned integer in big-endian order", () => {
    const bytes = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
    const result = readUInt32BE(bytes, 0);
    expect(result).toEqual(0x12345678);
  });

  it("should read from a non-zero offset", () => {
    const bytes = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04]);
    const result = readUInt32BE(bytes, 1);
    expect(result).toEqual(0x01020304);
  });

  it("should throw if offset is out of bounds", () => {
    const bytes = new Uint8Array([0x01, 0x02, 0x03]);
    expect(() => readUInt32BE(bytes, 1)).toThrow();
  });

  describe("readUInt32LE", () => {
    it("should read a 32-bit unsigned integer (little-endian)", () => {
      const arr = new Uint8Array([0x78, 0x56, 0x34, 0x12]);
      expect(readUInt32LE(arr)).toEqual(0x12345678);
    });

    it("should read from a given offset", () => {
      const arr = new Uint8Array([0, 0x78, 0x56, 0x34, 0x12]);
      expect(readUInt32LE(arr, 1)).toEqual(0x12345678);
    });
  });

  describe("readUInt16LE", () => {
    it("should read a 16-bit unsigned integer (little-endian)", () => {
      const arr = new Uint8Array([0xef, 0xcd]);
      expect(readUInt16LE(arr)).toEqual(0xcdef);
    });

    it("should read from a given offset", () => {
      const arr = new Uint8Array([0, 0xef, 0xcd]);
      expect(readUInt16LE(arr, 1)).toEqual(0xcdef);
    });
  });

  describe("readUInt16BE", () => {
    it("should read a 16-bit unsigned integer (little-endian)", () => {
      const arr = new Uint8Array([0xef, 0xcd]);
      expect(readUInt16BE(arr)).toEqual(0xefcd);
    });

    it("should read from a given offset", () => {
      const arr = new Uint8Array([0, 0xef, 0xcd]);
      expect(readUInt16BE(arr, 1)).toEqual(0xefcd);
    });
  });
});
