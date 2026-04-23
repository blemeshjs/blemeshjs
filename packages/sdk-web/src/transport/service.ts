import {
  CBUUID,
  CBCharacteristic,
  CBPeripheral,
  CBService,
  MeshProvisioningService,
  MeshProxyService,
} from "@mesh-link-js/sdk";
import { WebCBCharacteristic } from "./characteristic.js";

export class WebCBService extends CBService {
  public uuid: CBUUID;
  public peripheral: CBPeripheral;
  public characteristics: CBCharacteristic[] = [];

  private readonly _nativeService: BluetoothRemoteGATTService;

  constructor(nativeService: BluetoothRemoteGATTService, peripheral: CBPeripheral) {
    super();
    this._nativeService = nativeService;
    this.uuid = new CBUUID(nativeService.uuid);
    this.peripheral = peripheral;
  }

  public get nativeService(): BluetoothRemoteGATTService {
    return this._nativeService;
  }

  public get isMeshProvisioningService(): boolean {
    return this.uuid.equals(MeshProvisioningService.uuid);
  }

  public get isMeshProxyService(): boolean {
    return this.uuid.equals(MeshProxyService.uuid);
  }

  public async discoverCharacteristics(
    characteristicUUIDs?: string[],
  ): Promise<CBCharacteristic[]> {
    try {
      const nativeCharacteristics = await characteristicUUIDs?.reduce<
        Promise<BluetoothRemoteGATTCharacteristic[]>
      >(
        (promise, characteristicUUID) =>
          promise.then(() => this._nativeService.getCharacteristics(characteristicUUID)),
        Promise.resolve([]),
      );

      this.characteristics =
        nativeCharacteristics?.map((nativeChar) => {
          return new WebCBCharacteristic(nativeChar, this.uuid);
        }) ?? [];

      return this.characteristics;
    } catch (error) {
      console.error(`Failed to discover characteristics for service ${this.uuid}:`, error);
      throw error;
    }
  }

  public getCharacteristic(uuid: CBUUID): CBCharacteristic | undefined {
    return this.characteristics.find((c) => c.uuid.equals(uuid));
  }

  public async getMeshProvisioningDataIn(): Promise<CBCharacteristic | null> {
    if (!this.isMeshProvisioningService) return null;
    await this.discoverCharacteristics();
    return this.getCharacteristic(MeshProvisioningService.dataInUuid) || null;
  }

  public async getMeshProvisioningDataOut(): Promise<CBCharacteristic | null> {
    if (!this.isMeshProvisioningService) return null;
    await this.discoverCharacteristics();
    return this.getCharacteristic(MeshProvisioningService.dataOutUuid) || null;
  }

  public async getMeshProxyDataIn(): Promise<CBCharacteristic | null> {
    if (!this.isMeshProxyService) return null;
    await this.discoverCharacteristics();
    return this.getCharacteristic(MeshProxyService.dataInUuid) || null;
  }

  public async getMeshProxyDataOut(): Promise<CBCharacteristic | null> {
    if (!this.isMeshProxyService) return null;
    await this.discoverCharacteristics();
    return this.getCharacteristic(MeshProxyService.dataOutUuid) || null;
  }
}
