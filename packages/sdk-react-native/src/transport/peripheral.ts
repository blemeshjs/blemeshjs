import {
  CBUUID,
  Data,
  Int64,
  UUID,
  CBCharacteristic,
  CBCharacteristicWriteType,
  CBPeripheral,
  CBPeripheralState,
  CBService,
} from "@mesh-link-js/utils";
import Long from "long";
import { BleError, BleErrorCode, Device, Subscription } from "react-native-ble-plx";
import { RNCBService } from "./service.js";
import { base64ToUint8Array, uint8ArrayToBase64 } from "uint8array-extras";

export class RNCBPeripheral extends CBPeripheral {
  public services?: RNCBService[] = undefined;
  private mtu: Int64 = Long.fromNumber(23);
  private characteristicNotificationSub: Subscription | undefined;

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
      remove.remove();
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

  public readRSSI(): void {
    this.device
      .readRSSI()
      .then((device) => {
        this.rssi = device.rssi ?? undefined;
        this.emit("didReadRSSI", this, Long.fromNumber(this.rssi ?? 0));
      })
      .catch((error: Error) => {
        this.emit("didReadRSSI", this, Long.fromNumber(0), error);
      });
  }

  public discoverServices(): void {
    this.device
      .discoverAllServicesAndCharacteristics()
      .then((device) => device.services())
      .then((services) => {
        this.services = services.map((service) => new RNCBService(service, this));
        this.emit("didDiscoverServices", this);
      })
      .catch((error: Error) => {
        this.emit("didDiscoverServices", this, error);
      });
  }

  public discoverCharacteristics(_: CBUUID[], service: CBService): void {
    const services = this.services ?? [];
    const $service = services.find((s) => s.uuid.equals(service.uuid));
    if (typeof $service === "undefined") {
      this.emit(
        "didDiscoverCharacteristicsForService",
        this,
        service,
        new Error("Service not found"),
      );
      return;
    }
    $service
      .discoverCharacteristics()
      .then(() => {
        this.emit("didDiscoverCharacteristicsForService", this, service);
      })
      .catch((error: Error) => {
        this.emit("didDiscoverCharacteristicsForService", this, service, error);
      });
  }

  public setNotifyValue(enabled: boolean, characteristic: CBCharacteristic): void {
    if (enabled) {
      this.characteristicNotificationSub = this.device.monitorCharacteristicForService(
        characteristic.serviceUUID.fullUuidString,
        characteristic.uuid.fullUuidString,
        (error, char) => {
          if (error) {
            // NOTE: react-native-ble-plx always stays attached and throws these errors on intentional disconnect
            if (
              error instanceof BleError &&
              (error.errorCode === BleErrorCode.OperationCancelled ||
                error.errorCode === BleErrorCode.DeviceDisconnected)
            )
              return;
            this.emit(
              "didUpdateValueForCharacteristic",
              this,
              characteristic,
              new Error(error.message),
            );
            return;
          }
          if (char) {
            characteristic.value = char.value ? base64ToUint8Array(char.value) : undefined;
            this.emit("didUpdateValueForCharacteristic", this, characteristic);
          }
        },
      );
      characteristic.isNotifying = true;
    } else {
      this.characteristicNotificationSub?.remove();
      this.characteristicNotificationSub = undefined;
    }
    this.emit(
      "didUpdateNotificationStateForCharacteristic",
      this,
      characteristic,
      !enabled ? new Error("Stopping notifications not implemented") : undefined,
    );
  }

  public writeValue(
    data: Data,
    characteristic: CBCharacteristic,
    type: CBCharacteristicWriteType,
  ): void {
    const base64Data = uint8ArrayToBase64(data);

    switch (type) {
      case CBCharacteristicWriteType.withoutResponse:
        this.device
          .writeCharacteristicWithoutResponseForService(
            characteristic.serviceUUID.fullUuidString,
            characteristic.uuid.fullUuidString,
            base64Data,
          )
          .catch(console.error);
        break;

      case CBCharacteristicWriteType.withResponse:
        this.device
          .writeCharacteristicWithResponseForService(
            characteristic.serviceUUID.fullUuidString,
            characteristic.uuid.fullUuidString,
            base64Data,
          )
          .catch(console.error);
        break;
    }
  }

  public maximumWriteValueLength(_type: CBCharacteristicWriteType): Int64 {
    return this.mtu;
  }
}
