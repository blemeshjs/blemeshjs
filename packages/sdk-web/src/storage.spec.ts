import { stringToUint8Array, uint8ArrayToString } from "uint8array-extras";
import { describe, expect, it, beforeEach } from "vitest";

import { BrowserStorage } from "./storage.js";

describe("BrowserStorage", () => {
  const namespace = "test-storage";

  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads raw data for its namespace", () => {
    const storage = new BrowserStorage(namespace);
    const payload = stringToUint8Array("mesh-data");

    expect(storage.save(payload)).toBe(true);

    const loaded = storage.load();

    expect(loaded).toBeDefined();
    expect(uint8ArrayToString(loaded!)).toBe("mesh-data");
    expect(localStorage.getItem(namespace)).toBe("mesh-data");
  });

  it("returns undefined when loading a missing namespace", () => {
    const storage = new BrowserStorage(namespace);

    expect(storage.load()).toBeUndefined();
  });

  it("stores and retrieves JSON-backed key-value entries", () => {
    const storage = new BrowserStorage(namespace);

    storage.set("networkKey", "abc123");
    storage.set("appKey", "def456");

    expect(storage.get("networkKey")).toBe("abc123");
    expect(storage.get("appKey")).toBe("def456");
    expect(localStorage.getItem(namespace)).toBe(
      JSON.stringify({ networkKey: "abc123", appKey: "def456" }),
    );
  });

  it("removes stored keys and clears the namespace", () => {
    const storage = new BrowserStorage(namespace);

    storage.set("networkKey", "abc123");
    storage.set("appKey", "def456");
    storage.remove("networkKey");

    expect(storage.get("networkKey")).toBeUndefined();
    expect(storage.get("appKey")).toBe("def456");
    expect(localStorage.getItem(namespace)).toBe(
      JSON.stringify({ appKey: "def456" }),
    );

    storage.clear();

    expect(localStorage.getItem(namespace)).toBeNull();
  });

  it("returns undefined for get when stored data is not valid JSON", () => {
    const storage = new BrowserStorage(namespace);

    localStorage.setItem(namespace, "not-json");

    expect(storage.get("networkKey")).toBeUndefined();
  });

  it("replaces malformed JSON with a new object when setting a value", () => {
    const storage = new BrowserStorage(namespace);

    localStorage.setItem(namespace, "not-json");
    storage.set("networkKey", "abc123");

    expect(localStorage.getItem(namespace)).toBe(
      JSON.stringify({ networkKey: "abc123" }),
    );
    expect(storage.get("networkKey")).toBe("abc123");
  });
});