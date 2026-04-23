import {
  CBUUID,
  Data,
  CBCharacteristic,
  CBCharacteristicProperties,
  MeshProvisioningService,
  MeshProxyService,
} from "@mesh-link-js/utils";
import { BleError, Characteristic, Subscription } from "react-native-ble-plx";
import { base64ToUint8Array, uint8ArrayToString } from "uint8array-extras";

export class RNCBCharacteristic extends CBCharacteristic {
  public uuid: CBUUID;
  public serviceUUID: CBUUID;
  public properties: CBCharacteristicProperties[];
  public value?: Data;

  private _nativeCharacteristic: Characteristic;
  private _valueChangedHandler?: (error: BleError | null, xtic: Characteristic | null) => void;
  private _monitorSubscription: Subscription | null = null;
  public isNotifying: boolean = this._monitorSubscription !== null;

  constructor(nativeCharacteristic: Characteristic, serviceUUID: CBUUID) {
    super();
    this._nativeCharacteristic = nativeCharacteristic;
    this.uuid = new CBUUID(nativeCharacteristic.uuid);
    this.serviceUUID = serviceUUID;
    this.properties = this._mapProperties(nativeCharacteristic);
  }

  private _mapProperties(xtic: Characteristic): CBCharacteristicProperties[] {
    const properties: CBCharacteristicProperties[] = [];

    if (xtic.isReadable) properties.push(CBCharacteristicProperties.read);
    if (xtic.isWritableWithResponse || xtic.isWritableWithoutResponse) {
      properties.push(CBCharacteristicProperties.write);
    }
    if (xtic.isNotifiable) properties.push(CBCharacteristicProperties.notify);
    if (xtic.isIndicatable) properties.push(CBCharacteristicProperties.indicate);

    return properties;
  }

  public async readValue(): Promise<Data | undefined> {
    try {
      const value = await this._nativeCharacteristic.read();
      this.value = new Uint8Array(base64ToUint8Array(value.value ?? ""));
      return this.value;
    } catch (error) {
      console.error(`Failed to read characteristic ${this.uuid}:`, error);
      throw error;
    }
  }

  public async writeValue(data: Data, withResponse: boolean = true): Promise<void> {
    try {
      if (withResponse) {
        await this._nativeCharacteristic.writeWithResponse(
          uint8ArrayToString(data.slice().buffer),
          "base64",
        );
      } else {
        await this._nativeCharacteristic.writeWithoutResponse(
          uint8ArrayToString(data.slice().buffer, "base64"),
        );
      }
      this.value = data;
    } catch (error) {
      console.error(`Failed to write characteristic ${this.uuid}:`, error);
      throw error;
    }
  }

  public setNotifyValue(enabled: boolean) {
    if (this.isNotifying === enabled) return;

    try {
      if (enabled) {
        this._valueChangedHandler = this._handleValueChanged.bind(this);
        this._monitorSubscription = this._nativeCharacteristic.monitor(this._valueChangedHandler);
      } else {
        if (this._monitorSubscription) {
          this._monitorSubscription.remove();
        }
        this._valueChangedHandler = undefined;
      }
      this.isNotifying = enabled;
    } catch (error) {
      console.error(
        `Failed to ${enabled ? "start" : "stop"} notifications for ${this.uuid}:`,
        error,
      );
      throw error;
    }
  }

  private _handleValueChanged(error: BleError | null, xtic: Characteristic | null) {
    console.error(error);
    this.value = xtic != null && xtic.value ? base64ToUint8Array(xtic.value) : undefined;

    // Notify any listeners about the value change
    // You might want to implement an event emitter or callback system here
  }

  public get isMeshProvisioningDataInCharacteristic(): boolean {
    return this.uuid.equals(MeshProvisioningService.dataInUuid);
  }

  public get isMeshProvisioningDataOutCharacteristic(): boolean {
    return this.uuid.equals(MeshProvisioningService.dataOutUuid);
  }

  public get isMeshProxyDataInCharacteristic(): boolean {
    return this.uuid.equals(MeshProxyService.dataInUuid);
  }

  public get isMeshProxyDataOutCharacteristic(): boolean {
    return this.uuid.equals(MeshProxyService.dataOutUuid);
  }

  public equal(other: unknown): boolean {
    return other instanceof RNCBCharacteristic && this.uuid === other.uuid;
  }

  public cleanup() {
    if (this._monitorSubscription) {
      return this._monitorSubscription.remove();
    }
    if (this._valueChangedHandler) {
      this._valueChangedHandler = undefined;
    }
  }
}
