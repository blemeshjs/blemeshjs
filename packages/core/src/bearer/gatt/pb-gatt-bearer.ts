import { Mixin } from "ts-mixer";
import { BaseGattProxyBearer } from "./base-gatt-proxy-bearer.js";
import { PduTypes, ProvisioningBearer } from "../bearer.js";
import { CBCentralManager, CBPeripheral, MeshProvisioningService, UUID } from "@mesh-link-js/utils";

/**
 * The PB GATT bearer is responsible for sending and receiving mesh
 * provisioning messages to and from the GATT Proxy Node.
 */
export class PBGattBearer extends Mixin(
  BaseGattProxyBearer<typeof MeshProvisioningService>,
  ProvisioningBearer,
) {
  protected supportedPduTypes: PduTypes[] = [PduTypes.provisioningPdu];
  public static fromPeripheral(peripheral: CBPeripheral, centralManager: CBCentralManager) {
    return new PBGattBearer(peripheral.name, peripheral.identifier, centralManager);
  }

  public constructor(name: string | undefined, uuid: UUID, centralManager: CBCentralManager) {
    super(name, uuid, centralManager, MeshProvisioningService);
  }
}
