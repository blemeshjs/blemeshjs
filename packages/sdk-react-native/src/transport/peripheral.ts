import {
  CBUUID,
  Data,
  Int32,
  Int64,
  UUID,
  CBCharacteristic,
  CBCharacteristicWriteType,
  CBPeripheral,
  CBPeripheralState,
  CBService,
} from "@blemeshjs/utils";
import Long from "long";
import { BleError, BleErrorCode, Device, Subscription } from "react-native-ble-plx";
import { RNCBService } from "./service.js";
import { base64ToUint8Array, uint8ArrayToBase64 } from "uint8array-extras";

export class RNCBPeripheral extends CBPeripheral {
  public services?: RNCBService[] = undefined;
  private mtu: Int64 = Long.fromNumber(23);
  private characteristicNotificationSubs = new Map<string, Subscription>();

  private constructor(
    private device: Device,
    public identifier: UUID,
    public state: CBPeripheralState = CBPeripheralState.disconnected,
    public name?: string,
    public rssi?: number,
    public advertisementData?: Record<string, unknown>,
  ) {
    super();
    const remove = device.onDisconnected(() => {
      this.state = CBPeripheralState.disconnected;
      this.teardownNotifications();
      remove.remove();
      this.emit("didUpdateState", this);
      this.emit("didDisconnect", this);
    });
  }

  public static fromDevice(device: Device, isConnected: boolean): RNCBPeripheral {
    const identifier = new UUID(device.id);
    if (typeof identifier === "undefined") throw new Error("Invalid device identifier");
    const peripheral = new RNCBPeripheral(
      device,
      identifier,
      isConnected ? CBPeripheralState.connected : CBPeripheralState.disconnected,
      device.name ?? device.localName ?? undefined,
      device.rssi ?? undefined,
      {
        data: device.manufacturerData ?? undefined,
      },
    );
    peripheral.mtu = Long.fromNumber(device.mtu ?? 23);
    return peripheral;
  }

  public equal(other: unknown): boolean {
    return other instanceof RNCBPeripheral && this.identifier.equal(other.identifier);
  }

  public async readRSSI(): Promise<Int32> {
    return this.device.readRSSI().then((device) => {
      this.rssi = device.rssi ?? undefined;
      return this.rssi ?? 0;
    });
  }

  /**
   * react-native-ble-plx has no per-service discovery, so all services and
   * characteristics are discovered up front and the result is narrowed to the
   * requested UUIDs.
   */
  public async discoverServices(serviceUUIDs: CBUUID[]): Promise<CBService[]> {
    return this.device
      .discoverAllServicesAndCharacteristics()
      .then((device) => device.services())
      .then((services) => {
        this.services = services.map((service) => new RNCBService(service, this));
        if (serviceUUIDs.length === 0) return this.services;
        return this.services.filter((service) =>
          serviceUUIDs.some((uuid) => uuid.equals(service.uuid)),
        );
      });
  }

  public async discoverCharacteristics(
    characteristicUUIDs: CBUUID[],
    service: CBService,
  ): Promise<CBCharacteristic[]> {
    const $service = (this.services ?? []).find((s) => s.uuid.equals(service.uuid));
    if (typeof $service === "undefined") {
      throw new Error(`Service ${service.uuid.uuidString} not found on peripheral`);
    }
    return $service.discoverCharacteristics(characteristicUUIDs);
  }

  public async setNotifyValue(enabled: boolean, characteristic: CBCharacteristic): Promise<void> {
    const key = characteristic.uuid.fullUuidString.toLowerCase();

    if (!enabled) {
      this.characteristicNotificationSubs.get(key)?.remove();
      this.characteristicNotificationSubs.delete(key);
      characteristic.isNotifying = false;
      return;
    }

    if (this.characteristicNotificationSubs.has(key)) return;

    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const subscription = this.device.monitorCharacteristicForService(
        characteristic.serviceUUID.fullUuidString,
        characteristic.uuid.fullUuidString,
        (error, char) => {
          if (error) {
            // NOTE: react-native-ble-plx stays attached and reports these on an
            // intentional disconnect, so they are not notification failures.
            if (
              error instanceof BleError &&
              (error.errorCode === BleErrorCode.OperationCancelled ||
                error.errorCode === BleErrorCode.DeviceDisconnected)
            ) {
              return;
            }
            if (!settled) {
              settled = true;
              this.characteristicNotificationSubs.delete(key);
              subscription.remove();
              reject(new Error(error.message));
            }
            return;
          }

          // The first callback with no error confirms the subscription is live.
          if (!settled) {
            settled = true;
            characteristic.isNotifying = true;
            resolve();
          }

          if (char) {
            characteristic.value = char.value ? base64ToUint8Array(char.value) : undefined;
            this.emit("didUpdateValueForCharacteristic", this, characteristic);
          }
        },
      );

      this.characteristicNotificationSubs.set(key, subscription);
    });
  }

  public async writeValue(
    data: Data,
    characteristic: CBCharacteristic,
    type: CBCharacteristicWriteType,
  ): Promise<void> {
    const base64Data = uint8ArrayToBase64(data);

    switch (type) {
      case CBCharacteristicWriteType.withoutResponse:
        return this.device
          .writeCharacteristicWithoutResponseForService(
            characteristic.serviceUUID.fullUuidString,
            characteristic.uuid.fullUuidString,
            base64Data,
          )
          .then(() => {});

      case CBCharacteristicWriteType.withResponse:
        return this.device
          .writeCharacteristicWithResponseForService(
            characteristic.serviceUUID.fullUuidString,
            characteristic.uuid.fullUuidString,
            base64Data,
          )
          .then(() => {});
    }
  }

  public maximumWriteValueLength(_type: CBCharacteristicWriteType): Int64 {
    return this.mtu;
  }

  private teardownNotifications(): void {
    for (const subscription of this.characteristicNotificationSubs.values()) {
      subscription.remove();
    }
    this.characteristicNotificationSubs.clear();
  }
}
