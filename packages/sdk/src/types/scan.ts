import { GattBearer, ProvisioningBearer, UnprovisionedDevice } from "@blemeshjs/core";
import { Int32 } from "@blemeshjs/utils";

export type ScanOptions = {
  timeout?: number;
};

export type ProxyScanOptions = ScanOptions;
export type ProvisionScanOptions = ScanOptions;

export type DiscoveredUnprovisionedPeripheral = {
  device: UnprovisionedDevice;
  bearer: ProvisioningBearer[];
  rssi: number[];
};

export type DiscoveredProxyPeripheral = {
  device: GattBearer;
  rssi: Int32;
};

export class ScanError extends Error {
  public static readonly ScanTimeout = new ScanError("Scan timed out");
  public static readonly UserCancelled = new ScanError("Scan cancelled by user");
  public static readonly BleUnready = new ScanError("Bluetooth is not ready");
  public static readonly BleUnavailable = new ScanError("Bluetooth is unavailable");

  constructor(message: string) {
    super(message);
    this.name = "ScanError";
  }
}
