import { Address, BackgroundTimer, BindableTinyEmitter } from "@mesh-link-js/utils";
import {
  DiscoveredUnprovisionedPeripheral,
  ProvisionScanOptions,
  ProxyScanOptions,
  ScanError,
} from "../types";
import {
  AuthenticationMethod,
  Bearer,
  BearerHandler,
  GattBearerHandler,
  PBGattBearer,
  ProvisioningCapabilities,
  ProvisioningHandler,
  ProvisioningManager as $ProvisioningManager,
  ProvisioningState,
  ProvisioningStateType,
  PublicKey,
  UnprovisionedDevice,
  unprovisionedDeviceUUID,
} from "@mesh-link-js/core";
import { hasMixin } from "ts-mixer";
import { Crypto } from "@mesh-link-js/crypto";
import {
  CBCentralManager,
  CBCentralManagerState,
  MeshProvisioningService,
} from "@mesh-link-js/utils";
import { CoreMeshNetworkManager } from "./core-mesh-network-manager";

type ProvisionStatus =
  | "connecting"
  | "discovering-services"
  | "connected"
  | "disconnected"
  | "initializing"
  | "provisioning"
  | "identifying"
  | "capabilities-received"
  | "complete";

type RNProvisionEvents = {
  "provision:status": (status: ProvisionStatus, error?: Error) => void;
  "provision:error": (error: Error) => void;
  "ble:error": (error: Error) => void;
  "provision:capabilities-received": (capabilities: ProvisioningCapabilities) => void;
  "scan:new-peripheral": (discoveredPeripheral: DiscoveredUnprovisionedPeripheral) => void;
};

class RNProvisioningHandler implements ProvisioningHandler {
  constructor(private $provisioningManager: ProvisioningManager) {}
  public canProvisionDevice = false;

  authenticationActionRequired(): void {
    throw new Error("Method not implemented.");
  }

  inputComplete(): void {
    throw new Error("Method not implemented.");
  }

  provisioningState(_device: UnprovisionedDevice, state: ProvisioningState): void {
    switch (state.type) {
      case ProvisioningStateType.requestingCapabilities:
        this.$provisioningManager.emit("provision:status", "identifying");
        break;
      case ProvisioningStateType.capabilitiesReceived:
        this.$provisioningManager.emit("provision:status", "capabilities-received");
        this.$provisioningManager.emit("provision:capabilities-received", state.capabilities);
        const addressValid = this.$provisioningManager.isAddressValid;
        if (!addressValid) {
          this.$provisioningManager.unicastAddress = undefined;
        }
        const deviceSupported = !!this.$provisioningManager.isDeviceSupported;
        this.canProvisionDevice = addressValid && deviceSupported;
        break;
      case ProvisioningStateType.complete:
        this.$provisioningManager.emit("provision:status", "complete");
        this.$provisioningManager.disconnect();
        break;
      case ProvisioningStateType.failed:
        this.$provisioningManager.emit("provision:error", state.error);
        this.$provisioningManager.disconnect();
        break;
    }
  }
}

class RNProvisioningBearerHandler implements GattBearerHandler, BearerHandler<PBGattBearer> {
  constructor(private $provisioningManager: ProvisioningManager) {}

  bearerDidConnect(): void {
    this.$provisioningManager.emit("provision:status", "discovering-services");
  }

  bearerDidDiscoverServices(): void {
    this.$provisioningManager.emit("provision:status", "initializing");
  }

  bearerDidReadRSSI(): void {
    throw new Error("Method not implemented.");
  }

  bearerDidOpen(): void {
    this.$provisioningManager.emit("provision:status", "connected");
  }

  bearerDidClose(_bearer: Bearer, error?: Error): void {
    if (this.$provisioningManager?.state !== ProvisioningState.complete) {
      this.$provisioningManager.emit("provision:status", "disconnected", error);
    }
  }
}

export class ProvisioningManager extends BindableTinyEmitter<RNProvisionEvents> {
  private $provisioningHandler = new RNProvisioningHandler(this);
  private $provisioningBearerHandler = new RNProvisioningBearerHandler(this);
  private $discoveredPeripherals = new Map<string, DiscoveredUnprovisionedPeripheral>();
  private $scanSubscription?: () => void;
  private $scanTimer?: BackgroundTimer;

  private $provisioningManager?: $ProvisioningManager;
  private $discoveredPeripheral?: DiscoveredUnprovisionedPeripheral;

  /**
   * The Bluetooth Central Manager used for provisioning scans.
   * Must be set before calling scan() or connect().
   */
  public centralManager!: CBCentralManager;

  public get networkKey() {
    return this.$provisioningManager?.networkKey;
  }

  public get device() {
    return this.$discoveredPeripheral?.device;
  }

  public get isDeviceSupported() {
    return !!this.$provisioningManager?.isDeviceSupported;
  }

  public get canProvisionDevice() {
    return this.$provisioningHandler.canProvisionDevice;
  }

  public get state() {
    return this.$provisioningManager?.state;
  }

  public get capabilitiesReceived() {
    return this.$provisioningManager?.provisioningCapabilities !== undefined;
  }

  public get provisionerAvailable() {
    return CoreMeshNetworkManager.instance.meshNetwork?.localProvisioner !== undefined;
  }

  public get isAddressValid() {
    return !!this.$provisioningManager?.isUnicastAddressValid;
  }

  public get unicastAddress() {
    return this.$provisioningManager?.unicastAddress;
  }

  public set unicastAddress(address: Address | undefined) {
    this.$provisioningManager!.unicastAddress = address;
  }

  constructor() {
    super();
  }

  private performScan = ({ timeout = 10000 }: ProvisionScanOptions) => {
    this.$scanSubscription = this.centralManager.on(
      "centralManagerDidDiscoverPeripheral",
      (central, peripheral, RSSI, advertisementData) => {
        if (typeof advertisementData === "undefined") return;
        // TODO: parse advertisement data to check if it contains Mesh Provisioning Service UUID or Mesh Proxy Service UUID for Remote Provisioning.
        // Ignore all packets without Unprovisioned Device UUID.
        const uuid = unprovisionedDeviceUUID(advertisementData);
        if (!uuid) return;
        // Check if a device with the same UUID was already scanned before.
        if (this.$discoveredPeripherals.has(uuid.uuidString)) {
          // Update the device name.
          // The name is only available when the device is advertising using
          // Service Data and Local Name ADs.
          const discoveredPeripheral = this.$discoveredPeripherals.get(uuid.uuidString)!;
          if (discoveredPeripheral.device) {
            discoveredPeripheral.device.name = peripheral.name;
          }

          // Check if the PB GATT Bearer already exists.
          const bearerIndex = discoveredPeripheral.bearer.findIndex((bearer) =>
            hasMixin(bearer, PBGattBearer),
          );
          if (bearerIndex !== -1) {
            this.$discoveredPeripherals.set(uuid.uuidString, {
              ...discoveredPeripheral,
              rssi: discoveredPeripheral.rssi.map((rssi, index) =>
                index === bearerIndex ? (RSSI ?? rssi) : rssi,
              ),
            });
            // If so, just update the RSSI value.
          } else {
            // If the PB GATT Bearer doesn't exist, add it and corresponding RSSI value.
            const bearer = PBGattBearer.fromPeripheral(peripheral, central);
            bearer.logger = CoreMeshNetworkManager.instance.logger;
            this.$discoveredPeripherals.set(uuid.uuidString, {
              ...discoveredPeripheral,
              bearer: [...discoveredPeripheral.bearer, bearer],
              rssi: [...discoveredPeripheral.rssi, RSSI ?? 0],
            });
          }
          this.emit("scan:new-peripheral", discoveredPeripheral);
        } else {
          const unprovisionedDevice = UnprovisionedDevice.fromAdvertisementData(
            peripheral.name,
            advertisementData,
          );
          if (typeof unprovisionedDevice !== "undefined") {
            const bearer = PBGattBearer.fromPeripheral(peripheral, central);
            bearer.logger = CoreMeshNetworkManager.instance.logger;

            const discoveredPeripheral: DiscoveredUnprovisionedPeripheral = {
              device: unprovisionedDevice,
              bearer: [bearer],
              rssi: [RSSI ?? 0],
            };
            this.$discoveredPeripherals.set(uuid.uuidString, discoveredPeripheral);
            this.emit("scan:new-peripheral", discoveredPeripheral);
          }
        }
      },
    );

    this.centralManager
      .scanForPeripherals([MeshProvisioningService.uuid.fullUuidString.toLowerCase()])
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
    this.$discoveredPeripherals.clear();
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

  public connect = (peripheral: DiscoveredUnprovisionedPeripheral) => {
    this.stopScan();
    this.$discoveredPeripheral = peripheral;
    // TODO: we should support multiple bearers, but for now we can just use the first one.
    const bearer = this.$discoveredPeripheral.bearer[0];

    if (hasMixin(bearer, PBGattBearer)) {
      this.centralManager.bindAllEvents(bearer);
      bearer.centralManagerDidUpdateState(this.centralManager, this.centralManager.state);
    }

    bearer.bindAllEvents(this.$provisioningBearerHandler);
    const error = bearer.open();
    if (error) {
      this.emit("provision:error", error);
      return;
    }
    this.emit("provision:status", "connecting");
  };

  public disconnect = () => {
    // TODO: we should support multiple bearers, but for now we can just use the first one.
    const bearer = this.$discoveredPeripheral?.bearer[0];

    const error = bearer?.close();
    if (error) {
      this.emit("provision:error", error);
    }
    bearer?.unbindAllEvents(this.$provisioningBearerHandler);
    if (bearer && hasMixin(bearer, PBGattBearer)) {
      this.centralManager.unbindAllEvents(bearer);
    }
    this.$discoveredPeripherals.clear();
    this.$provisioningManager = undefined;
    this.$discoveredPeripheral = undefined;
    this.emit("provision:status", "disconnected");
  };

  public identify = (attentionTimer: number) => {
    if (!this.$discoveredPeripheral) {
      this.emit(
        "provision:error",
        new Error(
          "You are not connected to any unprovisioned device. Please call connect() first.",
        ),
      );
      return;
    }
    const pManager = CoreMeshNetworkManager.instance.provisionUnprovisionedDevice(
      this.$discoveredPeripheral.device,
      this.$discoveredPeripheral.bearer[0],
    );
    if (pManager instanceof Error) {
      this.emit("provision:error", pManager);
      return;
    }

    this.$provisioningManager = pManager;

    pManager.bindAllEvents(this.$provisioningHandler);
    pManager.logger = CoreMeshNetworkManager.instance.logger;
    const error = pManager.identify(attentionTimer);
    if (error !== undefined) this.emit("provision:error", error);
  };

  public quick = (peripheral: DiscoveredUnprovisionedPeripheral): Promise<void> => {
    return new Promise((resolve, reject) => {
      const off = this.bindAllEvents({
        "provision:status": (status) => {
          switch (status) {
            case "connected":
              this.identify(6);
              break;
            case "capabilities-received":
              this.start();
              break;
            case "complete":
              resolve();
              off();
              break;
            case "disconnected":
              off();
              break;
          }
        },
        "provision:error": (error) => {
          reject(error);
          off();
        },
        "ble:error": (error) => {
          reject(error);
          off();
        },
      });
      this.connect(peripheral);
    });
  };

  public start = () => {
    const provisioningManager = this.$provisioningManager;
    if (!provisioningManager) {
      this.emit(
        "provision:error",
        new Error("Provisioning manager is not initialized, please call identify() first."),
      );
      return;
    }
    const capabilities = provisioningManager.provisioningCapabilities;

    if (!capabilities) return;

    // TODO: support other public key types, but for now we can just use No OOB.
    const publicKey = PublicKey.noOobPublicKey;

    // TODO: support other authentication methods, but for now we can just use No OOB.
    const authenticationMethod = AuthenticationMethod.noOob;

    if (provisioningManager.networkKey === undefined) {
      const network = CoreMeshNetworkManager.instance.meshNetwork!;
      const networkKey = network.addNetworkKeyWithName(
        Crypto.generateRandom(128),
        "Primary Network Key",
      );
      if (networkKey instanceof Error) {
        this.emit("provision:error", networkKey);
        return;
      }
      provisioningManager.networkKey = networkKey;
    }

    this.emit("provision:status", "provisioning");
    const error = provisioningManager.provision(
      capabilities.algorithms.strongest,
      publicKey,
      authenticationMethod,
    );
    if (error !== undefined) {
      this.emit("provision:error", error);
      this.disconnect();
    }
  };
}
