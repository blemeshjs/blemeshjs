import { describe, it, expect } from "vitest";
import { IvIndex } from "./ivindex.js";

describe("IvIndex", () => {
  it("should create an IvIndex instance with default values", () => {
    const iv = new IvIndex();
    expect(iv.index).toBe(0);
    expect(iv.updateActive).toBe(false);
  });

  it("should calculate transmitIndex correctly", () => {
    expect(new IvIndex(5, true).transmitIndex).toBe(4);
    expect(new IvIndex(0, true).transmitIndex).toBe(0);
    expect(new IvIndex(5, false).transmitIndex).toBe(5);
  });

  it("should return previous IvIndex correctly", () => {
    expect(new IvIndex(5, false).previous?.index).toBe(5);
    expect(new IvIndex(5, true).previous?.index).toBe(4);
    expect(new IvIndex(0, true).previous).toBeUndefined();
  });

  it("should calculate indexFor correctly", () => {
    const iv = new IvIndex(2, false);
    expect(iv.indexFor(0)).toBe(2);
    expect(iv.indexFor(1)).toBe(1);
  });

  it("should compare equality", () => {
    const iv1 = new IvIndex(1, false);
    const iv2 = new IvIndex(1, false);
    const iv3 = new IvIndex(2, true);
    expect(iv1.equals(iv2)).toBe(true);
    expect(iv1.equals(iv3)).toBe(false);
  });

  it("should compare less than", () => {
    const iv1 = new IvIndex(1, false);
    const iv2 = new IvIndex(2, false);
    const iv3 = new IvIndex(1, true);
    expect(iv1.lt(iv2)).toBe(true);
    expect(iv1.lt(iv3)).toBe(false);
    expect(iv3.lt(iv1)).toBe(true);
  });

  it("should convert to and from map", () => {
    const iv = new IvIndex(10, true);
    const map = iv.asMap;
    expect(map).toEqual({ index: 10, updateActive: true });
    const restored = IvIndex.fromMap({ index: 10, updateActive: true });
    expect(restored?.index).toBe(10);
    expect(restored?.updateActive).toBe(true);
  });

  it("should handle invalid map in fromMap", () => {
    expect(IvIndex.fromMap(undefined)).toBeUndefined();
    expect(IvIndex.fromMap({})).toBeInstanceOf(IvIndex);
  });

  it("should return string representation", () => {
    const iv = new IvIndex(5, true);
    expect(iv.toString()).toContain("IV Index: 5");
    expect(iv.toString()).toContain("update active");
  });
});
