import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { NetworkConnection } from "./network-connection.js";
import { CoreMeshNetworkManager } from "./core-mesh-network-manager.js";
import {
  BindableTinyEmitter,
  CBCentralManagerHandler,
  CBCentralManagerState,
  Data,
  MeshProxyService,
} from "@blemeshjs/utils";
import { GattBearer, MeshNetwork, PduType } from "@blemeshjs/core";

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

type BearerEvents = {
  bearerDidOpen: (bearer: unknown) => void;
  bearerDidClose: (bearer: unknown, error?: Error) => void;
  bearerDidDeliverData: (bearer: unknown, data: Data, type: PduType) => void;
  bearerDidConnect: (bearer: unknown) => void;
  bearerDidDiscoverServices: (bearer: unknown) => void;
};

class FakeBearer extends BindableTinyEmitter<BearerEvents> {
  public identifier: { uuidString: string };
  public isOpen = false;
  public logger: unknown;

  public constructor(uuidString: string) {
    super();
    this.identifier = { uuidString };
  }

  public open = vi.fn(() => {
    this.isOpen = true;
    this.emit("bearerDidOpen", this);
  });

  public close = vi.fn(() => {
    this.isOpen = false;
    this.emit("bearerDidClose", this);
  });

  public send = vi.fn((_data: Data, _type: PduType) => Promise.resolve());
  public centralManagerDidUpdateState = vi.fn(() => undefined);
}

function createConnection(state: CBCentralManagerState = CBCentralManagerState.poweredOn) {
  const centralManager = new FakeCentralManager(state);
  const meshNetwork = {
    matchesNetworkIdentity: vi.fn(() => true),
    matchesNodeIdentity: vi.fn(() => true),
  } as unknown as MeshNetwork;

  const coreManager = {
    meshNetwork,
    proxyFilter: {
      proxyDidDisconnect: vi.fn(),
    },
  } as unknown as CoreMeshNetworkManager;

  const connection = NetworkConnection.to(meshNetwork, centralManager, coreManager);
  return {
    connection,
    centralManager,
    meshNetwork,
  };
}

describe("NetworkConnection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("starts automatic scan when opened with poweredOn BLE", async () => {
    const { connection, centralManager } = createConnection();

    connection.isConnectionAutomatic = true;
    await connection.open();

    expect(centralManager.scanForPeripherals).toHaveBeenCalledWith([
      MeshProxyService.uuid.uuidString,
    ]);
  });

  it("rejects scan when Bluetooth is not ready", async () => {
    const { connection, centralManager } = createConnection(CBCentralManagerState.poweredOff);

    await expect(connection.scan({ timeout: 100 })).rejects.toThrow("Bluetooth is not ready");
    expect(centralManager.stopScan).toHaveBeenCalled();
  });

  it("resolves with first discovered proxy during scan and resolves on timeout", async () => {
    const { connection, centralManager } = createConnection();

    const scanPromise = connection.scan({ timeout: 100 });
    await Promise.resolve();
    await Promise.resolve();

    const peripheral = {
      identifier: { uuidString: "peripheral-1" },
      name: "Proxy 1",
    };

    centralManager.emit(
      "centralManagerDidDiscoverPeripheral",
      centralManager,
      peripheral as never,
      -55,
      {},
    );

    vi.advanceTimersByTime(100);

    const discovered = await scanPromise;

    expect(discovered.rssi).toBe(-55);
    expect(discovered.device).toBeInstanceOf(GattBearer);
    expect(discovered.device.identifier.uuidString).toBe("peripheral-1");
    expect(connection.status).toBe("disconnected");
  });

  it("resolves with first discovered proxy during scan, continues scanning and resolves on timeout", async () => {
    const { connection, centralManager } = createConnection();

    const scanSpy = vi.fn(connection.scan);
    const scanPromise = scanSpy({ timeout: 200 });
    await Promise.resolve();
    await Promise.resolve();

    const first = {
      identifier: { uuidString: "peripheral-1" },
      name: "Proxy 1",
    };
    const scanHandlerSpy = vi.fn();
    connection.on("scan:new-proxy", scanHandlerSpy);

    centralManager.emit(
      "centralManagerDidDiscoverPeripheral",
      centralManager,
      first as never,
      -55,
      {},
    );

    vi.advanceTimersByTime(100);
    const discovered = await scanPromise;

    expect(scanSpy).toHaveResolved();
    expect(discovered.rssi).toBe(-55);
    expect(discovered.device).toBeInstanceOf(GattBearer);
    expect(discovered.device.identifier.uuidString).toBe("peripheral-1");
    expect(scanHandlerSpy).toHaveBeenCalledTimes(1);
    expect(connection.status).toBe("scanning");

    const second = {
      identifier: { uuidString: "peripheral-1" },
      name: "Proxy 1",
    };
    centralManager.emit(
      "centralManagerDidDiscoverPeripheral",
      centralManager,
      second as never,
      -45,
      {},
    );
    expect(connection.status).toBe("scanning");
    expect(scanHandlerSpy).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(100);
    await Promise.resolve();
    await Promise.resolve();
    expect(connection.status).toBe("disconnected");
  });

  it("connects to selected proxy and updates connection status", async () => {
    const { connection, centralManager } = createConnection();
    const bearer = new FakeBearer("proxy-1");

    const statusSpy = vi.fn();
    connection.on("connection:status", statusSpy);

    await connection.connect({
      device: bearer as unknown as GattBearer,
      rssi: -40,
    });

    expect(centralManager.stopScan).toHaveBeenCalled();
    expect(connection.status).toBe("connected");
    expect(connection.proxies.get("proxy-1")).toBe(bearer);
    expect(statusSpy).toHaveBeenCalledWith("connecting");
    expect(statusSpy).toHaveBeenCalledWith("connected");
  });

  it("stopScan clears scanning state and sets disconnected status", async () => {
    const { connection, centralManager } = createConnection();

    connection.status = "connected";
    await connection.stopScan();

    expect(centralManager.stopScan).toHaveBeenCalled();
    expect(connection.status).toBe("disconnected");
  });
});
