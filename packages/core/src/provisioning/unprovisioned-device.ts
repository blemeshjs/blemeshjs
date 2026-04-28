import { MeshProvisioningService, OobInformation, UUID } from "@blemeshjs/utils";
import z from "zod";
import { base64ToUint8Array, uint8ArrayToHex } from "uint8array-extras";

export function unprovisionedDeviceUUID(data: Record<string, unknown>) {
  if (!z.record(z.string(), z.null().or(z.record(z.any(), z.any()))).safeParse(data).success)
    return;
  const parsedServiceData = z.record(z.uuid(), z.base64()).safeParse(data["serviceData"]);
  if (!parsedServiceData.success) return;
  const serviceData = parsedServiceData.data;
  const uuid = serviceData[MeshProvisioningService.uuid.fullUuidString.toLowerCase()];
  if (!uuid) return;
  const bytes = base64ToUint8Array(uuid);
  if (bytes.length !== 18 && bytes.length !== 22) return;
  return UUID.fromHex(uint8ArrayToHex(bytes.slice(0, 16)));
}

/**
 * A class representing an unprovisioned device.
 */
export class UnprovisionedDevice {
  /**
   * Returns the human-readable name of the device.
   */
  public name?: string;
  /**
   * Returns the Mesh Beacon UUID of an Unprovisioned Device.
   */
  public uuid: UUID;
  /**
   * Information that points to out-of-band (OOB) information
   * needed for provisioning.
   */
  public oobInformation: OobInformation;

  /**
   * a basic Unprovisioned Device object.
   *
   * @param name The optional name of the device.
   * @param uuid The UUID of the Unprovisioned Device.
   * @param oobInformation The information about OOB data.
   */
  public constructor(
    name: string | undefined,
    uuid: UUID,
    oobInformation: OobInformation = new OobInformation(0),
  ) {
    this.name = name;
    this.uuid = uuid;
    this.oobInformation = oobInformation;
  }

  /**
   * Creates the Unprovisioned Device object based on the advertisement
   * data. The Mesh UUID and OOB Information must be present in the
   * advertisement data, otherwise `undefined` is returned.
   *
   * @param name
   * @param advertisementData The advertisement data deceived from the device during scanning.
   */
  public static fromAdvertisementData(
    name: string | undefined,
    advertisementData: Record<string, unknown>,
  ): UnprovisionedDevice | undefined {
    // An Unprovisioned Device must advertise with UUID and OOB Information.
    const uuid = unprovisionedDeviceUUID(advertisementData);
    if (!uuid) return;
    const oobInfo = OobInformation.fromAdvertisementData(advertisementData);
    if (!oobInfo) return;
    return new UnprovisionedDevice(name, uuid, oobInfo);
  }
}
