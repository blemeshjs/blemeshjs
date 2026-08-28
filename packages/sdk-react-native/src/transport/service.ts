import {
  CBUUID,
  CBCharacteristic,
  CBPeripheral,
  CBService,
  MeshProvisioningService,
  MeshProxyService,
} from "@blemeshjs/utils";
import { RNCBCharacteristic } from "./characteristic.js";
import { Service } from "react-native-ble-plx";

export class RNCBService extends CBService {
  public uuid: CBUUID;
  public peripheral: CBPeripheral;
  public characteristics: CBCharacteristic[] = [];

  private _nativeService: Service;

  constructor(nativeService: Service, peripheral: CBPeripheral) {
    super();
    this._nativeService = nativeService;
    this.uuid = new CBUUID(nativeService.uuid);
    this.peripheral = peripheral;
  }

  public get isMeshProvisioningService(): boolean {
    return this.uuid.equals(MeshProvisioningService.uuid);
  }

  public get isMeshProxyService(): boolean {
    return this.uuid.equals(MeshProxyService.uuid);
  }

  public async discoverCharacteristics(
    characteristicUUIDs?: CBUUID[],
  ): Promise<CBCharacteristic[]> {
    return this._nativeService.characteristics().then((chars) => {
      this.characteristics = chars
        .map((char) => new RNCBCharacteristic(char, this.uuid))
        .filter(
          (char) =>
            typeof characteristicUUIDs === "undefined" ||
            characteristicUUIDs.length === 0 ||
            characteristicUUIDs.some((uuid) => uuid.equals(char.uuid)),
        );
      return this.characteristics;
    });
  }

  public getCharacteristic(uuid: CBUUID): CBCharacteristic | undefined {
    return this.characteristics.find((c) => c.uuid.equals(uuid));
  }

  public getMeshProvisioningDataIn(): CBCharacteristic | null {
    if (!this.isMeshProvisioningService) return null;
    return this.getCharacteristic(MeshProvisioningService.dataInUuid) || null;
  }

  public getMeshProvisioningDataOut(): CBCharacteristic | null {
    if (!this.isMeshProvisioningService) return null;
    return this.getCharacteristic(MeshProvisioningService.dataOutUuid) || null;
  }

  public getMeshProxyDataIn(): CBCharacteristic | null {
    if (!this.isMeshProxyService) return null;
    return this.getCharacteristic(MeshProxyService.dataInUuid) || null;
  }

  public getMeshProxyDataOut(): CBCharacteristic | null {
    if (!this.isMeshProxyService) return null;
    return this.getCharacteristic(MeshProxyService.dataOutUuid) || null;
  }
}
