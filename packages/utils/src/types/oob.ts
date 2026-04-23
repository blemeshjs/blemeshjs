import z from "zod";
import { MeshProvisioningService } from "../constants/index.js";
import { base64ToUint8Array } from "uint8array-extras";
import { UInt16 } from "./number.js";
import { readUInt16LE } from "../helpers/index.js";

/**
 * Information that points to Out-Of-Band (OOB) information
 * needed for provisioning.
 */
export class OobInformation {
  public constructor(public rawValue: UInt16) {}

  public static other = new OobInformation(1 << 0);
  public static electronicURI = new OobInformation(1 << 1);
  public static qrCode = new OobInformation(1 << 2);
  public static barCode = new OobInformation(1 << 3);
  public static nfc = new OobInformation(1 << 4);
  public static number = new OobInformation(1 << 5);
  public static string = new OobInformation(1 << 6);
  // New flags from Mesh Protocol 1.1
  public static supportForCertificateBasedProvisioning = new OobInformation(1 << 7);
  public static supportForProvisioningRecords = new OobInformation(1 << 8);
  // Bits 9-10 are reserved for future use.
  public static onBox = new OobInformation(1 << 11);
  public static insideBox = new OobInformation(1 << 12);
  public static onPieceOfPaper = new OobInformation(1 << 13);
  public static insideManual = new OobInformation(1 << 14);
  public static onDevice = new OobInformation(1 << 15);

  /**
   * Creates the object from the advertisement data.
   *
   * @param advertisementData Received advertisement data.
   */
  public static fromAdvertisementData(
    advertisementData: Record<string, unknown>,
  ): OobInformation | undefined {
    if (
      !z.record(z.string(), z.null().or(z.record(z.any(), z.any()))).safeParse(advertisementData)
        .success
    )
      return;
    const parsedServiceData = z
      .record(z.uuid(), z.base64())
      .safeParse(advertisementData["serviceData"]);
    if (!parsedServiceData.success) return;
    const serviceData = parsedServiceData.data;
    const uuid = serviceData[MeshProvisioningService.uuid.fullUuidString.toLowerCase()];
    if (!uuid) return;
    const bytes = base64ToUint8Array(uuid);
    if (bytes.length !== 18 && bytes.length !== 22) return;
    // OOB Information is using Little Endian in the Advertising Data.
    return new OobInformation(readUInt16LE(bytes, 16));
  }
}
