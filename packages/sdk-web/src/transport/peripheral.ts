import {
  CBUUID,
  Data,
  UUID,
  CBCharacteristic,
  CBCharacteristicWriteType,
  CBPeripheral,
  CBPeripheralState,
  CBService,
} from "@blemeshjs/sdk";
import { base64ToUint8Array, uint8ArrayToHex } from "uint8array-extras";
import Long from "long";
import { WebCBCharacteristic } from "./characteristic.js";
import { WebCBService } from "./service.js";

export class WebCBPeripheral extends CBPeripheral {
  public services?: CBService[] = undefined;
  public state: CBPeripheralState = CBPeripheralState.disconnected;

  private _gattServer: BluetoothRemoteGATTServer | null = null;
  private _notificationHandlers = new Map<string, (event: Event) => void>();

  public static fromBluetoothDevice(
    device: BluetoothDevice,
    rssi?: number,
    advertisementData?: Record<string, unknown>,
  ): WebCBPeripheral {
    // NOTE: example of id is 1gfZPA6QJNn2Og6NJEpXwA==
    const identifier =
      UUID.fromHex(uint8ArrayToHex(base64ToUint8Array(device.id))) ??
      UUID.fromUuidString(device.id) ??
      UUID.random();
    return new WebCBPeripheral(device, identifier, device.name, rssi, advertisementData);
  }

  public get device(): BluetoothDevice {
    return this._device;
  }

  private constructor(
    private _device: BluetoothDevice,
    public identifier: UUID,
    public name?: string,
    public rssi?: number,
    public advertisementData?: Record<string, unknown>,
  ) {
    super();
    this._device.addEventListener("gattserverdisconnected", this._handleDisconnected);
  }

  public async connect(): Promise<void> {
    if (this.state === CBPeripheralState.connected) {
      return;
    }

    this.state = CBPeripheralState.connecting;
    this.emit("didUpdateState", this);

    return this._device.gatt
      ?.connect()
      .then((server) => {
        this._gattServer = server;
        this.state = CBPeripheralState.connected;
        this.emit("didUpdateState", this);

        // Monitor disconnections
        this._device.addEventListener("gattserverdisconnected", this._handleDisconnected);
      })
      .catch((error: Error) => {
        this.state = CBPeripheralState.disconnected;
        this.emit("didUpdateState", this);
        this.emit("didDisconnect", this);
        console.error("Connection failed:", error);
      });
  }

  public disconnect(): void {
    if (!this._gattServer?.connected) return;
    this._gattServer.disconnect();
    this._handleDisconnected();
  }

  private _handleDisconnected = () => {
    this.state = CBPeripheralState.disconnected;
    this._gattServer = null;
    this.emit("didUpdateState", this);
    this.emit("didDisconnect", this);
  };

  // ========== Service Discovery ==========
  public discoverServices(serviceUUIDs: CBUUID[]): void {
    if (!this._gattServer?.connected) {
      throw new Error("Peripheral not connected");
    }

    Promise.all(
      serviceUUIDs.map((serviceUUID) =>
        this._gattServer!.getPrimaryServices(serviceUUID.fullUuidString.toLowerCase()),
      ),
    )
      .then((serviceGroups) => serviceGroups.flat())
      .then((services) => {
        this.services = services.map((service) => this._convertBluetoothService(service));
        this.emit("didDiscoverServices", this);
      })
      .catch((error: Error) => {
        console.error("Service discovery failed:", error);
        this.emit("didDiscoverServices", this, error);
      });
  }

  private _convertBluetoothService(service: BluetoothRemoteGATTService): CBService {
    return new WebCBService(service, this);
  }

  // ========== Characteristic Operations ==========
  public discoverCharacteristics(characteristicUUIDs: CBUUID[], service: CBService): void {
    if (!this._gattServer?.connected) {
      throw new Error("Peripheral not connected");
    }

    if (!(service instanceof WebCBService)) {
      throw new Error("Invalid service reference");
    }

    const nativeService = service.nativeService;

    Promise.all(
      characteristicUUIDs.map((characteristicUUID) =>
        nativeService.getCharacteristics(characteristicUUID.fullUuidString.toLowerCase()),
      ),
    )
      .then((groups) => groups.flat())
      .then((characteristics) => {
        const cbCharacteristics = characteristics.map((char) =>
          this._convertBluetoothCharacteristic(char),
        );

        service.characteristics = cbCharacteristics;
        this.emit("didDiscoverCharacteristicsForService", this, service);
      })
      .catch((error: Error) => {
        console.error("Characteristic discovery failed:", error);
        this.emit("didDiscoverCharacteristicsForService", this, service, error);
      });
  }

  private _convertBluetoothCharacteristic(
    characteristic: BluetoothRemoteGATTCharacteristic,
  ): CBCharacteristic {
    return new WebCBCharacteristic(characteristic, new CBUUID(characteristic.service.uuid));
  }

  // ========== Characteristic Operations ==========
  public readRSSI(): void {
    // Web Bluetooth doesn't provide direct RSSI reading, use cached value
    this.emit("didReadRSSI", this, Long.fromNumber(this.rssi ?? 0));
  }

  public setNotifyValue(enabled: boolean, characteristic: CBCharacteristic): void {
    if (!(characteristic instanceof WebCBCharacteristic)) {
      throw new Error("Invalid characteristic reference");
    }

    const nativeChar = characteristic.nativeCharacteristic;
    const key = characteristic.uuid.fullUuidString.toLowerCase();

    if (enabled) {
      const handler = this._createNotificationHandler(characteristic);
      this._notificationHandlers.set(key, handler);

      nativeChar
        .startNotifications()
        .then(() => {
          nativeChar.addEventListener("characteristicvaluechanged", handler);
          characteristic.isNotifying = true;
          this.emit("didUpdateNotificationStateForCharacteristic", this, characteristic);
        })
        .catch((error: Error) => {
          console.error("Notification setup failed:", error);
          this.emit("didUpdateNotificationStateForCharacteristic", this, characteristic, error);
        });
      return;
    }

    const existing = this._notificationHandlers.get(key);
    nativeChar
      .stopNotifications()
      .then(() => {
        if (existing) {
          nativeChar.removeEventListener("characteristicvaluechanged", existing);
          this._notificationHandlers.delete(key);
        }
        characteristic.isNotifying = false;
        this.emit("didUpdateNotificationStateForCharacteristic", this, characteristic);
      })
      .catch((error: Error) => {
        console.error("Notification setup failed:", error);
        this.emit("didUpdateNotificationStateForCharacteristic", this, characteristic, error);
      });
  }

  private _createNotificationHandler = (characteristic: CBCharacteristic) => {
    return (event: Event) => {
      const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
      characteristic.value =
        typeof value !== "undefined" ? new Uint8Array(value.buffer) : undefined;
      this.emit("didUpdateValueForCharacteristic", this, characteristic);
    };
  };

  public async writeValue(
    data: Data,
    characteristic: CBCharacteristic,
    type: CBCharacteristicWriteType,
  ) {
    if (!(characteristic instanceof WebCBCharacteristic)) {
      throw new Error("Invalid characteristic reference");
    }

    const nativeChar = characteristic.nativeCharacteristic;

    const write =
      type === CBCharacteristicWriteType.withResponse
        ? nativeChar.writeValueWithResponse(data.slice().buffer)
        : nativeChar.writeValueWithoutResponse(data.slice().buffer);

    return write.then(() => {
      if (type === CBCharacteristicWriteType.withResponse) {
        this.emit("didWriteValueForCharacteristic", this, characteristic);
      }
    });
  }

  public maximumWriteValueLength(type: CBCharacteristicWriteType): Long {
    // Web Bluetooth doesn't expose MTU size, return conservative estimate
    return Long.fromNumber(type === CBCharacteristicWriteType.withResponse ? 512 : 20);
  }

  // ========== Cleanup ==========
  public cleanup() {
    this._device.removeEventListener("gattserverdisconnected", this._handleDisconnected);
    if (this._gattServer?.connected) {
      this._gattServer.disconnect();
    }
  }
}
