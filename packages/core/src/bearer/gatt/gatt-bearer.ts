import { Mixin } from "ts-mixer";
import { MeshBearer, PduTypes } from "../bearer.js";
import { BaseGattProxyBearer } from "./base-gatt-proxy-bearer.js";
import { CBCentralManager, CBPeripheral, MeshProxyService, UUID } from "@mesh-link-js/utils";

/**
 * The GATT bearer is responsible for sending and receiving mesh messages
 * to and from the GATT Proxy Node.
 */
export class GattBearer extends Mixin(BaseGattProxyBearer<typeof MeshProxyService>, MeshBearer) {
  protected supportedPduTypes: Array<PduTypes> = [
    PduTypes.networkPdu,
    PduTypes.meshBeacon,
    PduTypes.proxyConfiguration,
  ];

  public static fromPeripheral(peripheral: CBPeripheral, centralManager: CBCentralManager) {
    return new GattBearer(peripheral.name, peripheral.identifier, centralManager);
  }

  public constructor(name: string | undefined, uuid: UUID, centralManager: CBCentralManager) {
    super(name, uuid, centralManager, MeshProxyService);
  }
}
