import { WebCBPeripheral } from "./peripheral.js";
import { CBCentralManager, CBCentralManagerState, CBPeripheral, UUID } from "@mesh-link-js/sdk";
import { uint8ArrayToBase64 } from "uint8array-extras";

export class WebCBCentralManager extends CBCentralManager {
  public state: CBCentralManagerState = CBCentralManagerState.unknown;
  public scanObject: BluetoothLEScan | null = null;
  private peripheralCache = new Map<string, WebCBPeripheral>();
  private activeConnections = new Set<string>();
  private advertisementListener?: (event: Event) => void;
  private static $instance = new WebCBCentralManager();

  public static get instance(): WebCBCentralManager {
    return this.$instance;
  }

  constructor() {
    super();
    void this.initializeState();
  }

  private async initializeState() {
    if (!navigator.bluetooth) {
      this.updateState(CBCentralManagerState.unsupported);
      return;
    }

    try {
      const available = await navigator.bluetooth.getAvailability();
      this.updateState(
        available ? CBCentralManagerState.poweredOn : CBCentralManagerState.poweredOff,
      );
    } catch (error) {
      console.error("Bluetooth availability check failed:", error);
      this.updateState(CBCentralManagerState.unknown);
    }
  }

  private updateState(newState: CBCentralManagerState) {
    if (this.state !== newState) {
      this.state = newState;
      this.emit("centralManagerDidUpdateState", this, newState);

      // Stop scan if Bluetooth becomes unavailable
      if (newState !== CBCentralManagerState.poweredOn && this.scanObject?.active) {
        this.stopScan().catch((error) => {
          console.error("Failed to stop scan after Bluetooth state change:", error);
        });
      }
    }
  }

  getState(): CBCentralManagerState {
    return this.state;
  }

  scanForPeripherals(serviceUUIDs?: string[]) {
    return this.scanForPeripheralsInternal(serviceUUIDs);
  }

  private async scanForPeripheralsInternal(_serviceUUIDs?: string[]): Promise<void> {
    if (this.state !== CBCentralManagerState.poweredOn) {
      throw new Error("Bluetooth is unavailable for scanning");
    }

    try {
      await this.stopScan();

      const options: BluetoothLEScanOptions = {
        acceptAllAdvertisements: true,
        keepRepeatedDevices: true,
      };

      this.advertisementListener = (event: Event) => {
        console.log(event)
        const adEvent = event as BluetoothAdvertisingEvent;
        const advertisementData = this.buildAdvertisementData(adEvent);
        const peripheral = this.getOrCreatePeripheral(
          adEvent.device,
          adEvent.rssi ?? undefined,
          advertisementData,
        );

        this.emit(
          "centralManagerDidDiscoverPeripheral",
          this,
          peripheral,
          adEvent.rssi ?? undefined,
          advertisementData,
        );
      };

      navigator.bluetooth.addEventListener("advertisementreceived", this.advertisementListener);

      this.scanObject = await navigator.bluetooth.requestLEScan(options);
    } catch (error) {
      console.error("Scanning failed:", error);
      throw error;
    }
  }

  stopScan() {
    if (this.scanObject?.active) {
      this.scanObject.stop();
      this.scanObject = null;
    }

    if (this.advertisementListener) {
      navigator.bluetooth.removeEventListener("advertisementreceived", this.advertisementListener);
      this.advertisementListener = undefined;
    }
    return Promise.resolve();
  }

  async connect(peripheral: CBPeripheral) {
    if (!(peripheral instanceof WebCBPeripheral)) {
      const error = new Error("Unsupported peripheral implementation for WebCBCentralManager");
      this.emit(
        "centralManagerDidFailConnect",
        this,
        peripheral,
        error,
      );
      throw error;
    }

    return peripheral
      .connect()
      .then(() => {
        this.activeConnections.add(peripheral.identifier.uuidString);

        const device = peripheral.device;
        const onDisconnected = () => {
          this.activeConnections.delete(peripheral.identifier.uuidString);
          device.removeEventListener("gattserverdisconnected", onDisconnected);
          this.emit("centralManagerDidDisconnectPeripheral", this, peripheral);
        };

        device.addEventListener("gattserverdisconnected", onDisconnected);
        this.emit("centralManagerDidConnect", this, peripheral);
      })
      .catch((error: Error) => {
        this.emit("centralManagerDidFailConnect", this, peripheral, error);
        throw error;
      });
  }

  cancelPeripheralConnection(peripheral: CBPeripheral) {
    if (!(peripheral instanceof WebCBPeripheral)) {
      throw new Error("Unsupported peripheral implementation for WebCBCentralManager");
    }

    peripheral.disconnect();
    this.activeConnections.delete(peripheral.identifier.uuidString);
    this.emit("centralManagerDidDisconnectPeripheral", this, peripheral);
    return Promise.resolve();
  }

  retrieveConnectedPeripherals(serviceUUIDs?: string[]): CBPeripheral[] {
    const peripherals = Array.from(this.peripheralCache.values()).filter((peripheral) =>
      this.activeConnections.has(peripheral.identifier.uuidString),
    );
    console.debug(`Retrieved ${peripherals.length} connected peripherals from cache`);

    if (!serviceUUIDs || serviceUUIDs.length === 0) {
      return peripherals;
    }

    return peripherals.filter((peripheral) => {
      const ad = peripheral.advertisementData as unknown;
      if (!ad || typeof ad !== "object") return false;

      const serviceDataValue = (ad as Record<string, unknown>)["serviceData"];
      if (!serviceDataValue || typeof serviceDataValue !== "object") return false;

      const serviceData = serviceDataValue as Record<string, unknown>;
      const advertised = Object.keys(serviceData).map((uuid) => uuid.toLowerCase());
      return serviceUUIDs.some((uuid) => advertised.includes(uuid.toLowerCase()));
    });
  }

  retrievePeripherals(identifiers: UUID[]): CBPeripheral[] {
    return identifiers
      .map((id) => this.peripheralCache.get(id.uuidString))
      .filter((p): p is WebCBPeripheral => p !== undefined);
  }

  private getOrCreatePeripheral(
    device: BluetoothDevice,
    rssi?: number,
    advertisementData?: Record<string, unknown>,
  ): CBPeripheral {
    let peripheral = this.peripheralCache.get(device.id);

    if (!peripheral) {
      peripheral = this.createPeripheral(device, rssi, advertisementData);
      this.peripheralCache.set(peripheral.identifier.uuidString, peripheral);
    } else {
      // Update existing peripheral data
      peripheral.rssi = rssi;
      peripheral.advertisementData = advertisementData;
    }

    return peripheral;
  }

  private createPeripheral(
    device: BluetoothDevice,
    rssi?: number,
    advertisementData?: Record<string, unknown>,
  ): WebCBPeripheral {
    return WebCBPeripheral.fromBluetoothDevice(device, rssi, advertisementData);
  }

  private buildAdvertisementData(
    event: BluetoothAdvertisingEvent,
  ): Record<string, unknown> | undefined {
    const serviceData: Record<string, string> = {};
    for (const [uuid, value] of event.serviceData.entries()) {
      const normalizedUuid =
        typeof uuid === "number" ? uuid.toString(16).padStart(4, "0") : uuid.toLowerCase();
      serviceData[normalizedUuid] = uint8ArrayToBase64(new Uint8Array(value.buffer));
    }

    const manufacturerData: Record<string, string> = {};
    for (const [id, value] of event.manufacturerData.entries()) {
      manufacturerData[String(id)] = uint8ArrayToBase64(new Uint8Array(value.buffer));
    }

    if (Object.keys(serviceData).length === 0 && Object.keys(manufacturerData).length === 0) {
      return undefined;
    }

    return {
      serviceData,
      manufacturerData,
    };
  }
}
