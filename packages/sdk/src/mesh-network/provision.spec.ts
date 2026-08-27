import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProvisioningManager } from "./provision.js";
import {
  BindableTinyEmitter,
  CBCentralManagerHandler,
  CBCentralManagerState,
} from "@blemeshjs/utils";
import type { DiscoveredUnprovisionedPeripheral } from "../types";

class FakeCentralManager extends BindableTinyEmitter<CBCentralManagerHandler> {
  public state: CBCentralManagerState;

  public constructor(state: CBCentralManagerState) {
    super();
    this.state = state;
  }

  public getState() {
    return this.state;
  }

  public scanForPeripherals = vi.fn((_serviceUUIDs?: string[]) => Promise.resolve());
  public stopScan = vi.fn(() => Promise.resolve());
  public connect = vi.fn(() => Promise.resolve());
  public cancelPeripheralConnection = vi.fn(() => Promise.resolve());
  public retrieveConnectedPeripherals = vi.fn(() => []);
  public retrievePeripherals = vi.fn(() => []);
}

class FakeProvisioningBearer {
  private handler?: {
    bearerDidOpen?: () => void;
  };

  public bindAllEvents = vi.fn((handler: { bearerDidOpen?: () => void }) => {
    this.handler = handler;
    return () => {
      this.handler = undefined;
    };
  });

  public unbindAllEvents = vi.fn(() => undefined);
  public open = vi.fn<() => Error | undefined>(() => {
    this.handler?.bearerDidOpen?.();
    return undefined;
  });
  public close = vi.fn(() => undefined);
}

describe("ProvisioningManager.scan", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("rejects when Bluetooth is not ready", async () => {
    const manager = new ProvisioningManager();
    const centralManager = new FakeCentralManager(CBCentralManagerState.poweredOff);
    manager.centralManager = centralManager;

    await expect(manager.scan({ timeout: 100 })).rejects.toThrow("Bluetooth is not ready");
    expect(centralManager.stopScan).toHaveBeenCalled();
  });
});

describe("ProvisioningManager.connect", () => {
  it("resolves when bearer opens and still emits status events", async () => {
    const manager = new ProvisioningManager();
    const centralManager = new FakeCentralManager(CBCentralManagerState.poweredOn);
    manager.centralManager = centralManager;

    const statusSpy = vi.fn();
    manager.on("provision:status", statusSpy);

    const bearer = new FakeProvisioningBearer();
    const peripheral = {
      device: {} as never,
      bearer: [bearer as never],
      rssi: [-35],
    } as unknown as DiscoveredUnprovisionedPeripheral;

    await manager.connect(peripheral);

    expect(statusSpy).toHaveBeenCalledWith("connected");
    expect(statusSpy).toHaveBeenCalledWith("connecting");
  });

  it("rejects when bearer fails to open", async () => {
    const manager = new ProvisioningManager();
    const centralManager = new FakeCentralManager(CBCentralManagerState.poweredOn);
    manager.centralManager = centralManager;

    const bearer = new FakeProvisioningBearer();
    const openError = new Error("Failed to open bearer");
    bearer.open.mockRejectedValue(openError);

    const peripheral = {
      device: {} as never,
      bearer: [bearer as never],
      rssi: [-35],
    } as unknown as DiscoveredUnprovisionedPeripheral;

    await expect(manager.connect(peripheral)).rejects.toThrow("Failed to open bearer");
  });
});
