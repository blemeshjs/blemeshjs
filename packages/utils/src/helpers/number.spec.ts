import { describe, expect, it } from "vitest";
import {
  packInt16LE,
  unpackInt16LE,
  writeInt16LE,
  packUInt16LE,
  unpackUInt16LE,
  writeUInt16LE,
  packInt32LE,
  unpackInt32LE,
  writeInt32LE,
  packUInt32LE,
  unpackUInt32LE,
  writeUInt32LE,
  packInt16BE,
  packInt32BE,
  packUInt16BE,
  packUInt32BE,
  unpackInt16BE,
  unpackInt32BE,
  unpackUInt16BE,
  unpackUInt32BE,
  writeInt16BE,
  writeInt32BE,
  writeUInt16BE,
  writeUInt32BE,
} from "./number.js";

describe("number.helper", () => {
  describe("packInt16LE / unpackInt16LE", () => {
    it("should pack and unpack signed 16-bit integers", () => {
      expect(unpackInt16LE(packInt16LE(-32768))).toBe(-32768);
      expect(unpackInt16LE(packInt16LE(32767))).toBe(32767);
      expect(unpackInt16LE(packInt16LE(0))).toBe(0);
    });
    it("should write to buffer", () => {
      const buf = new Uint8Array(2);
      writeInt16LE(12345, buf);
      expect(unpackInt16LE(buf)).toBe(12345);
    });
  });

  describe("packUInt16LE / unpackUInt16LE", () => {
    it("should pack and unpack unsigned 16-bit integers", () => {
      expect(unpackUInt16LE(packUInt16LE(0))).toBe(0);
      expect(unpackUInt16LE(packUInt16LE(65535))).toBe(65535);
    });
    it("should write to buffer", () => {
      const buf = new Uint8Array(2);
      writeUInt16LE(54321, buf);
      expect(unpackUInt16LE(buf)).toBe(54321);
    });
  });

  describe("packInt32LE / unpackInt32LE", () => {
    it("should pack and unpack signed 32-bit integers", () => {
      expect(unpackInt32LE(packInt32LE(-2147483648))).toBe(-2147483648);
      expect(unpackInt32LE(packInt32LE(2147483647))).toBe(2147483647);
      expect(unpackInt32LE(packInt32LE(0))).toBe(0);
    });
    it("should write to buffer", () => {
      const buf = new Uint8Array(4);
      writeInt32LE(-123456789, buf);
      expect(unpackInt32LE(buf)).toBe(-123456789);
    });
  });

  describe("packUInt32LE / unpackUInt32LE", () => {
    it("should pack and unpack unsigned 32-bit integers", () => {
      expect(unpackUInt32LE(packUInt32LE(0))).toBe(0);
      expect(unpackUInt32LE(packUInt32LE(4294967295))).toBe(4294967295);
    });
    it("should write to buffer", () => {
      const buf = new Uint8Array(4);
      writeUInt32LE(1234567890, buf);
      expect(unpackUInt32LE(buf)).toBe(1234567890);
    });
  });

  describe("number.helper BE", () => {
    describe("packInt16BE / unpackInt16BE", () => {
      it("should pack and unpack signed 16-bit integers", () => {
        expect(unpackInt16BE(packInt16BE(-32768))).toBe(-32768);
        expect(unpackInt16BE(packInt16BE(32767))).toBe(32767);
        expect(unpackInt16BE(packInt16BE(0))).toBe(0);
      });
      it("should write to buffer", () => {
        const buf = new Uint8Array(2);
        writeInt16BE(12345, buf);
        expect(unpackInt16BE(buf)).toBe(12345);
      });
    });

    describe("packUInt16BE / unpackUInt16BE", () => {
      it("should pack and unpack unsigned 16-bit integers", () => {
        expect(unpackUInt16BE(packUInt16BE(0))).toBe(0);
        expect(unpackUInt16BE(packUInt16BE(65535))).toBe(65535);
      });
      it("should write to buffer", () => {
        const buf = new Uint8Array(2);
        writeUInt16BE(54321, buf);
        expect(unpackUInt16BE(buf)).toBe(54321);
      });
    });

    describe("packInt32BE / unpackInt32BE", () => {
      it("should pack and unpack signed 32-bit integers", () => {
        expect(unpackInt32BE(packInt32BE(-2147483648))).toBe(-2147483648);
        expect(unpackInt32BE(packInt32BE(2147483647))).toBe(2147483647);
        expect(unpackInt32BE(packInt32BE(0))).toBe(0);
      });
      it("should write to buffer", () => {
        const buf = new Uint8Array(4);
        writeInt32BE(-123456789, buf);
        expect(unpackInt32BE(buf)).toBe(-123456789);
      });
    });

    describe("packUInt32BE / unpackUInt32BE", () => {
      it("should pack and unpack unsigned 32-bit integers", () => {
        expect(unpackUInt32BE(packUInt32BE(0))).toBe(0);
        expect(unpackUInt32BE(packUInt32BE(4294967295))).toBe(4294967295);
      });
      it("should write to buffer", () => {
        const buf = new Uint8Array(4);
        writeUInt32BE(1234567890, buf);
        expect(unpackUInt32BE(buf)).toBe(1234567890);
      });
    });
  });
});
