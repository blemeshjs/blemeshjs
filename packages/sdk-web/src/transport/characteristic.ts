import {
  CBUUID,
  Data,
  CBCharacteristic,
  CBCharacteristicProperties,
  MeshProvisioningService,
  MeshProxyService,
} from "@mesh-link-js/sdk";

export class WebCBCharacteristic extends CBCharacteristic {
  public uuid: CBUUID;
  public serviceUUID: CBUUID;
  public isNotifying: boolean = false;
  public properties: CBCharacteristicProperties[];
  public value?: Data;

  private readonly _nativeCharacteristic: BluetoothRemoteGATTCharacteristic;
  private _valueChangedHandler?: (event: Event) => void;

  constructor(nativeCharacteristic: BluetoothRemoteGATTCharacteristic, serviceUUID: CBUUID) {
    super();
    this._nativeCharacteristic = nativeCharacteristic;
    this.uuid = new CBUUID(nativeCharacteristic.uuid);
    this.serviceUUID = serviceUUID;
    this.properties = this._mapProperties(nativeCharacteristic.properties);
  }

  public get nativeCharacteristic(): BluetoothRemoteGATTCharacteristic {
    return this._nativeCharacteristic;
  }

  private _mapProperties(props: BluetoothCharacteristicProperties): CBCharacteristicProperties[] {
    const properties: CBCharacteristicProperties[] = [];

    if (props.read) properties.push(CBCharacteristicProperties.read);
    if (props.write || props.writeWithoutResponse) {
      properties.push(CBCharacteristicProperties.write);
    }
    if (props.notify) properties.push(CBCharacteristicProperties.notify);
    if (props.indicate) properties.push(CBCharacteristicProperties.indicate);
    if (props.broadcast) properties.push(CBCharacteristicProperties.broadcast);
    if (props.authenticatedSignedWrites) {
      properties.push(CBCharacteristicProperties.authenticatedSignedWrites);
    }

    return properties;
  }

  public async readValue(): Promise<Data | undefined> {
    try {
      const value = await this._nativeCharacteristic.readValue();
      this.value = new Uint8Array(value.buffer);
      return this.value;
    } catch (error) {
      console.error(`Failed to read characteristic ${this.uuid}:`, error);
      throw error;
    }
  }

  public async writeValue(data: Data, withResponse: boolean = true): Promise<void> {
    try {
      if (withResponse) {
        await this._nativeCharacteristic.writeValueWithResponse(data.slice().buffer);
      } else {
        await this._nativeCharacteristic.writeValueWithoutResponse(data.slice().buffer);
      }
      this.value = data;
    } catch (error) {
      console.error(`Failed to write characteristic ${this.uuid}:`, error);
      throw error;
    }
  }

  public async setNotifyValue(enabled: boolean): Promise<void> {
    if (this.isNotifying === enabled) return;

    try {
      if (enabled) {
        await this._nativeCharacteristic.startNotifications();
        this._valueChangedHandler = this._handleValueChanged.bind(this);
        this._nativeCharacteristic.addEventListener(
          "characteristicvaluechanged",
          this._valueChangedHandler,
        );
      } else {
        await this._nativeCharacteristic.stopNotifications();
        if (this._valueChangedHandler) {
          this._nativeCharacteristic.removeEventListener(
            "characteristicvaluechanged",
            this._valueChangedHandler,
          );
        }
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

  private _handleValueChanged(event: Event) {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    this.value = characteristic.value ? new Uint8Array(characteristic.value.buffer) : undefined;

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
    return other instanceof WebCBCharacteristic && this.uuid.equals(other.uuid);
  }

  public cleanup() {
    if (this.isNotifying && this._valueChangedHandler) {
      this._nativeCharacteristic.removeEventListener(
        "characteristicvaluechanged",
        this._valueChangedHandler,
      );
    }
  }
}
