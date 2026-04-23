import {
  Bearer,
  BearerDataHandler,
  BearerHandler,
  GattBearer,
  MeshNetwork,
  PduType,
  PduTypes,
} from "@mesh-link-js/core";
import {
  BackgroundTimer,
  BindableTinyEmitter,
  Data,
  LogCategory,
  LoggerHandler,
  MeshProxyService,
  CBCentralManager,
  CBCentralManagerHandler,
  CBCentralManagerState,
  CBPeripheral,
} from "@mesh-link-js/utils";
import { logger } from "../types";
import { hasMixin, Mixin } from "ts-mixer";
import { networkIdentity, nodeIdentity } from "./helpers.js";
import { action, computed, makeObservable, observable } from "mobx";
import { CoreMeshNetworkManager } from "./core-mesh-network-manager.js";
import { DiscoveredProxyPeripheral, ProxyScanOptions, ScanError } from "../types";

export type ConnectionStatus =
  | "connecting"
  | "discovering-services"
  | "initializing"
  | "connected"
  | "disconnected";

export type NetworkConnectionEvents = {
  "ble:state-change": (state: CBCentralManagerState) => void;
  "ble:error": (error: Error) => void;
  "scan:new-proxy": (discoveredPeripheral: DiscoveredProxyPeripheral) => void;
  "connection:status": (status: ConnectionStatus) => void;
};

class CBCentralManagerHandlerAdapter implements Partial<CBCentralManagerHandler> {
  public constructor(private $networkConnection: NetworkConnection) {}
  public centralManagerDidUpdateState(central: CBCentralManager) {
    switch (central.state) {
      case CBCentralManagerState.poweredOn:
        if (
          this.$networkConnection.isStarted &&
          this.$networkConnection.isConnectionAutomatic &&
          this.$networkConnection.proxies.size < NetworkConnection.maxConnections
        ) {
          central
            .scanForPeripherals([MeshProxyService.uuid.fullUuidString])
            .catch((error: Error) =>
              this.$networkConnection.logger?.d(
                LogCategory.bearer,
                `Error starting scan: ${error.message}`,
              ),
            );
        }
      case CBCentralManagerState.poweredOff:
      case CBCentralManagerState.resetting:
        this.$networkConnection.proxies.forEach((proxy) => {
          proxy.close();
        });
        this.$networkConnection.proxies.clear();
      default:
        break;
    }
  }

  public centralManagerDidDiscoverPeripheral(
    _central: CBCentralManager,
    peripheral: CBPeripheral,
    _rssi?: number,
    advertisementData?: Record<string, unknown>,
  ): void {
    if (typeof advertisementData === "undefined") return;

    // Is it a Network ID or Private Network Identity beacon?
    const identity = networkIdentity(advertisementData);

    if (identity !== null) {
      if (!this.$networkConnection.meshNetwork.matchesNetworkIdentity(identity)) {
        // A Node from another mesh network.
        return;
      }
    } else {
      // Is it a Node Identity or Private Node Identity beacon?
      const identity = nodeIdentity(advertisementData);
      if (identity !== null) {
        if (!this.$networkConnection.meshNetwork.matchesNodeIdentity(identity)) {
          // A Node from another mesh network.
          return;
        }
      }
    }
    // Add a new bearer.
    const centralManager = this.$networkConnection.centralManager;
    const bearer = GattBearer.fromPeripheral(peripheral, centralManager);
    centralManager.bindAllEvents(bearer);
    bearer.centralManagerDidUpdateState(centralManager, centralManager.state);
    this.$networkConnection.use(bearer);
  }
}

class BearerHandlerAdapter implements BearerHandler, BearerDataHandler {
  constructor(
    private $networkConnection: NetworkConnection,
    private $coreMeshNetworkManager: CoreMeshNetworkManager,
  ) {
    makeObservable(this, {
      bearerDidOpen: action,
      bearerDidClose: action,
    });
  }

  public bearerDidOpen = (bearer: Bearer): void => {
    if (this.$networkConnection.isOpen) return;
    this.$networkConnection.isOpen = true;
    this.$networkConnection.emit("bearerDidOpen", bearer);
    this.$networkConnection.status = "connected";
  };

  public bearerDidClose = (bearer: Bearer, _error?: Error) => {
    bearer.unbindAllEvents(this);
    if (hasMixin(bearer, GattBearer)) {
      this.$networkConnection.centralManager.unbindAllEvents(bearer);
      this.$networkConnection.status = "disconnected";
    }

    this.$coreMeshNetworkManager.proxyFilter.proxyDidDisconnect();

    if (hasMixin(bearer, GattBearer)) {
      if (this.$networkConnection.proxies.has(bearer.identifier.uuidString)) {
        this.$networkConnection.proxies.delete(bearer.identifier.uuidString);
      }
    }
    if (
      this.$networkConnection.isStarted &&
      this.$networkConnection.isConnectionAutomatic &&
      this.$networkConnection.proxies.size < NetworkConnection.maxConnections
    ) {
      this.$networkConnection.centralManager
        .scanForPeripherals([MeshProxyService.uuid.fullUuidString])
        .catch((error: Error) =>
          this.$networkConnection.logger?.d(
            LogCategory.bearer,
            `Error starting scan: ${error.message}`,
          ),
        );
    }
    if (this.$networkConnection.proxies.size === 0) {
      this.$networkConnection.isOpen = false;
      this.$networkConnection.emit("bearerDidClose", bearer);
    }
  };

  public bearerDidConnect = (): void => {
    if (!this.$networkConnection.isOpen) {
      this.$networkConnection.status = "discovering-services";
    }
  };

  public bearerDidDiscoverServices = (): void => {
    if (!this.$networkConnection.isOpen) {
      this.$networkConnection.status = "initializing";
    }
  };

  public bearerDidDeliverData = (bearer: Bearer, data: Data, type: PduType): void => {
    this.$networkConnection.emit("bearerDidDeliverData", bearer, data, type);
  };
}

export class NetworkConnection extends Mixin(BindableTinyEmitter<NetworkConnectionEvents>, Bearer) {
  private $centralManagerHandlerAdapter = new CBCentralManagerHandlerAdapter(this);
  private $bearerHandlerAdapter: BearerHandlerAdapter;
  private $scanSubscription?: () => void;
  private $discoveredProxies = new Map<string, DiscoveredProxyPeripheral>();
  private $scanTimer?: BackgroundTimer;
  private readonly $status: ConnectionStatus = "disconnected";
  private readonly $bleState: CBCentralManagerState = CBCentralManagerState.unknown;

  public set bleState(newState: CBCentralManagerState) {
    // @ts-expect-error setting in setter
    this.$bleState = newState;
    this.emit("ble:state-change", newState);
  }

  public get bleState(): CBCentralManagerState {
    return this.$bleState;
  }

  public get bleReady() {
    return this.$bleState === CBCentralManagerState.poweredOn;
  }

  public set status(newStatus: ConnectionStatus) {
    // @ts-expect-error setting in setter
    this.$status = newStatus;
    this.emit("connection:status", newStatus);
  }
  public get status() {
    return this.$status;
  }

  protected get supportedPduTypes(): PduTypes[] {
    return [PduTypes.networkPdu, PduTypes.meshBeacon, PduTypes.proxyConfiguration];
  }
  /**
   * Returns the name of the first connected Proxy.
   */
  public get name(): string | undefined {
    return Array.from(this.proxies.values()).find((proxy) => proxy.isOpen)?.name;
  }

  /**
   * Maximum number of connections that ``NetworkConnection`` can handle.
   *
   * NOTE: In Mesh Link JS app this value is set to 1 due to UI limitations.
   * When applying in 3rd party app, higher values should work.
   */
  public static maxConnections = 1;
  /**
   * The Bluetooth Central Manager instance that will scan and
   * connect to proxies.
   */
  private $centralManager!: CBCentralManager;

  public get centralManager() {
    return this.$centralManager;
  }
  public set centralManager(newCentralManager: CBCentralManager) {
    this.$centralManager = newCentralManager;
    this.bleState = newCentralManager.state;
    this.$centralManager.on("centralManagerDidUpdateState", (_central, state) => {
      this.bleState = state;
    });
  }
  /**
   * The Mesh Network for this connection.
   */
  public meshNetwork!: MeshNetwork;

  private $isStarted: boolean = false;
  /**
   * A flag indicating whether the network connection is open.
   * When open, it will scan for mesh nodes in range and connect to
   * them if found.
   */
  public get isStarted() {
    return this.$isStarted;
  }

  /**
   * A flag set to `true` when any of the underlying bearers is open.
   */
  public isOpen: boolean = false;

  /**
   * The list of connected GATT Proxies.
   */
  public proxies: Map<string, GattBearer> = new Map();

  private $isConnectionAutomatic = false;
  /**
   * Whether the connection to mesh network should be managed automatically,
   * or manually.
   */
  public get isConnectionAutomatic() {
    return this.$isConnectionAutomatic;
  }

  public set isConnectionAutomatic(newValue: boolean) {
    this.$isConnectionAutomatic = newValue;
    if (
      newValue &&
      this.$isStarted &&
      this.centralManager.state === CBCentralManagerState.poweredOn &&
      this.proxies.size < NetworkConnection.maxConnections
    ) {
      this.centralManager.bindAllEvents(this.$centralManagerHandlerAdapter);
      this.centralManager
        .scanForPeripherals([MeshProxyService.uuid.fullUuidString])
        .catch((error: Error) =>
          this.logger?.d(LogCategory.bearer, `Error starting scan: ${error.message}`),
        );
    } else {
      this.centralManager.unbindAllEvents(this.$centralManagerHandlerAdapter);
      this.centralManager
        .stopScan()
        .catch((error: Error) =>
          this.logger?.d(LogCategory.bearer, `Error stopping scan: ${error.message}`),
        );
    }
  }

  private readonly $logger?: LoggerHandler;
  public get logger() {
    return this.$logger;
  }
  public set logger(value) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.$logger = value;
    this.proxies.forEach((proxy) => {
      proxy.logger = value;
    });
  }

  constructor(private $coreMeshNetworkManager: CoreMeshNetworkManager) {
    super();
    this.$bearerHandlerAdapter = new BearerHandlerAdapter(this, this.$coreMeshNetworkManager);
    makeObservable<NetworkConnection, "$isConnectionAutomatic" | "$status" | "$bleState">(this, {
      // observable
      isOpen: observable,
      proxies: observable,
      $isConnectionAutomatic: observable,
      $status: observable,
      $bleState: observable,

      // computed
      isConnectionAutomatic: computed,
      bleReady: computed,
      bleState: computed,
      status: computed,

      // action
      use: action,
    });
  }

  public static to = (
    meshNetwork: MeshNetwork,
    centralManager: CBCentralManager,
    coreMeshNetworkManager: CoreMeshNetworkManager,
  ) => {
    const connection = new NetworkConnection(coreMeshNetworkManager);
    connection.centralManager = centralManager;
    connection.meshNetwork = meshNetwork;
    if (connection.isConnectionAutomatic) {
      centralManager.bindAllEvents(connection.$centralManagerHandlerAdapter);
    }

    // By default, the connection mode is automatic.
    return connection;
  };

  /**
   * Switches connection to the given GATT Bearer.
   *
   * If the limit of `NetworkConnection.maxConnections` connections is reached,
   * the older one will be closed.
   *
   * @param bearer The GATT Bearer proxy to use.
   */
  public use = (bearer: GattBearer) => {
    // Make sure we're not adding a duplicate.
    if (this.proxies.has(bearer.identifier.uuidString)) {
      return;
    }
    // If we reached the limit, disconnect the one added as a first.
    if (this.proxies.size >= NetworkConnection.maxConnections) {
      const proxies = Array.from(this.proxies.values());
      const last = proxies[proxies.length - 1];
      last?.close();
    }
    // Add new proxy.
    bearer.bindAllEvents(this.$bearerHandlerAdapter);
    bearer.logger = logger;
    this.proxies.set(bearer.identifier.uuidString, bearer);

    // Open the bearer or notify a delegate that the connection is open.
    if (bearer.isOpen) {
      this.$bearerHandlerAdapter.bearerDidOpen(bearer);
    } else {
      bearer.open();
    }
    // Is the limit reached?
    if (this.proxies.size >= NetworkConnection.maxConnections) {
      this.centralManager
        .stopScan()
        .catch((error: Error) =>
          this.logger?.d(LogCategory.bearer, `Error stopping scan: ${error.message}`),
        );
    }
  };

  public open = () => {
    if (
      !this.$isStarted &&
      this.isConnectionAutomatic &&
      this.centralManager.state === CBCentralManagerState.poweredOn
    ) {
      this.centralManager.bindAllEvents(this.$centralManagerHandlerAdapter);
      this.centralManager
        .scanForPeripherals([MeshProxyService.uuid.uuidString])
        .catch((error: Error) =>
          this.logger?.d(LogCategory.bearer, `Error opening connection: ${error.message}`),
        );
    }
    this.$isStarted = true;
  };

  public close = (): Error | void => {
    this.centralManager.unbindAllEvents(this.$centralManagerHandlerAdapter);
    this.centralManager
      .stopScan()
      .catch((error: Error) =>
        this.logger?.d(LogCategory.bearer, `Error stopping scan: ${error.message}`),
      );
    this.proxies.forEach((proxy) => {
      proxy.close();
    });
    this.proxies.clear();
    this.$isStarted = false;
  };

  public send = (data: Data, type: PduType): void => {
    // Send the message to all open GATT Proxy nodes.
    for (const proxy of this.proxies.values()) {
      if (!proxy.isOpen) continue;
      proxy.send(data, type);
    }
  };

  private performScan = ({ timeout = 10000 }: ProxyScanOptions) => {
    this.$scanSubscription = this.centralManager.on(
      "centralManagerDidDiscoverPeripheral",
      (_central, peripheral, RSSI, advertisementData) => {
        if (typeof advertisementData === "undefined") return;

        // Is it a Network ID or Private Network Identity beacon?
        const identity = networkIdentity(advertisementData);

        if (identity !== null) {
          if (!this.$coreMeshNetworkManager.meshNetwork?.matchesNetworkIdentity(identity)) {
            // A Node from another mesh network.
            return;
          }
        } else {
          // Is it a Node Identity or Private Node Identity beacon?
          const identity = nodeIdentity(advertisementData);
          if (identity !== null) {
            if (!this.$coreMeshNetworkManager.meshNetwork?.matchesNodeIdentity(identity)) {
              // A Node from another mesh network.
              return;
            }
          }
        }

        const discoveredProxy = this.$discoveredProxies.get(peripheral.identifier.uuidString);
        if (discoveredProxy) {
          const newDiscoveredProxy: DiscoveredProxyPeripheral = {
            ...discoveredProxy,
            rssi: RSSI ?? 0,
          };
          this.$discoveredProxies.set(peripheral.identifier.uuidString, newDiscoveredProxy);
          this.emit("scan:new-proxy", newDiscoveredProxy);
        } else {
          const bearer = GattBearer.fromPeripheral(peripheral, this.centralManager);
          const discoveredPeripheral: DiscoveredProxyPeripheral = {
            device: bearer,
            rssi: RSSI ?? 0,
          };
          this.$discoveredProxies.set(peripheral.identifier.uuidString, discoveredPeripheral);
          this.emit("scan:new-proxy", discoveredPeripheral);
        }
      },
    );

    this.centralManager
      .scanForPeripherals([MeshProxyService.uuid.fullUuidString])
      .catch((error) => {
        this.$clearScan();
        this.emit("ble:error", error instanceof Error ? error : new Error(String(error)));
      });

    this.$scanTimer = new BackgroundTimer(timeout / 1000, false, () => {
      this.stopScan();
      this.emit("ble:error", ScanError.ScanTimeout);
    });
  };

  public scan = (options: ProxyScanOptions) => {
    this.stopScan();

    if (this.centralManager.state === CBCentralManagerState.poweredOn) {
      this.performScan(options);
    } else {
      this.emit("ble:error", ScanError.BleUnready);
    }
  };

  private $clearScan = () => {
    this.$discoveredProxies.clear();
    this.$scanSubscription?.();
    this.$scanSubscription = undefined;
    this.$scanTimer?.invalidate();
    this.$scanTimer = undefined;
  };

  public stopScan = () => {
    this.$clearScan();
    this.centralManager
      .stopScan()
      .catch((error) =>
        this.emit("ble:error", error instanceof Error ? error : new Error(String(error))),
      );
  };

  public connect = (proxy: DiscoveredProxyPeripheral) => {
    return new Promise<void>((resolve, reject) => {
      this.stopScan();
      const bearer = proxy.device;
      bearer.logger = this.logger;
      if (hasMixin(bearer, GattBearer)) {
        this.centralManager.bindAllEvents(bearer);
        proxy.device.centralManagerDidUpdateState(this.centralManager, this.centralManager.state);
      }
      this.status = "connecting";
      const offAll = () => {
        cbSub();
        bearerSub();
      };

      const bearerSub = this.bindAllEvents({
        bearerDidOpen: () => {
          resolve();
          offAll();
        },
        bearerDidClose: (_bearer, error) => {
          reject(error ?? new Error("Connection closed by remote device."));
          offAll();
        },
      });

      const cbSub = this.centralManager.bindAllEvents({
        centralManagerDidFailConnect: (_central, peripheral, error) => {
          if (peripheral.equal(proxy.device)) {
            reject(error ?? new Error("Connection failed."));
            offAll();
          }
        },
        centralManagerDidDisconnectPeripheral(_central, peripheral, error) {
          if (peripheral.equal(proxy.device)) {
            reject(error ?? new Error("Disconnected by remote device."));
            offAll();
          }
        },
      });
      this.use(bearer);
    });
  };
}
