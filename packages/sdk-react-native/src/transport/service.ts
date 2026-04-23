import {
  CBUUID,
  CBCharacteristic,
  CBPeripheral,
  CBService,
  MeshProvisioningService,
  MeshProxyService,
} from "@mesh-link-js/utils";
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

  public async discoverCharacteristics(characteristicUUIDs?: string[]): Promise<void> {
    return this._nativeService.characteristics().then((chars) => {
      chars.forEach((char) => {
        if (characteristicUUIDs && !characteristicUUIDs.includes(char.uuid)) return;
        this.characteristics.push(new RNCBCharacteristic(char, this.uuid));
      });
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
