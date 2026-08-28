import { describe, expect, it, vi } from "vitest";
import {
  BindableTinyEmitter,
  CBCentralManager,
  CBCentralManagerHandler,
  CBCentralManagerState,
  CBPeripheralState,
  UUID,
} from "@blemeshjs/utils";
import { GattBearer } from "./gatt-bearer.js";
import { BearerError } from "../bearer-error.js";

class FakeCentralManager extends BindableTinyEmitter<CBCentralManagerHandler> {
  public state: CBCentralManagerState = CBCentralManagerState.poweredOn;

  public getState = () => this.state;
  public scanForPeripherals = vi.fn(() => Promise.resolve());
  public stopScan = vi.fn(() => Promise.resolve());
  public connect = vi.fn(() => Promise.resolve());
  public cancelPeripheralConnection = vi.fn(() => Promise.resolve());
  public retrieveConnectedPeripherals = vi.fn(() => []);
  public retrievePeripherals = vi.fn(() => []);
}

function createBearer() {
  const centralManager = new FakeCentralManager();
  const bearer = GattBearer.fromPeripheral(
    {
      name: "Proxy",
      identifier: UUID.random(),
      state: CBPeripheralState.disconnected,
    } as never,
    centralManager as unknown as CBCentralManager,
  );
  return { bearer, centralManager };
}

describe("BaseGattProxyBearer", () => {
  describe("centralManagerDidUpdateState", () => {
    it("closes an open bearer when the radio stops being powered on", () => {
      const { bearer, centralManager } = createBearer();
      const onClose = vi.fn();
      bearer.on("bearerDidClose", onClose);
      (bearer as unknown as { isOpened: boolean }).isOpened = true;

      bearer.centralManagerDidUpdateState(
        centralManager as unknown as CBCentralManager,
        CBCentralManagerState.poweredOff,
      );

      expect(onClose).toHaveBeenCalledWith(bearer, BearerError.centralManagerNotPoweredOn);
      expect((bearer as unknown as { isOpened: boolean }).isOpened).toBe(false);
    });

    it("does not close a bearer that was never opened", () => {
      const { bearer, centralManager } = createBearer();
      const onClose = vi.fn();
      bearer.on("bearerDidClose", onClose);

      bearer.centralManagerDidUpdateState(
        centralManager as unknown as CBCentralManager,
        CBCentralManagerState.poweredOff,
      );

      expect(onClose).not.toHaveBeenCalled();
    });

    it("leaves an open bearer alone when the radio powers on", () => {
      const { bearer, centralManager } = createBearer();
      const onClose = vi.fn();
      bearer.on("bearerDidClose", onClose);
      (bearer as unknown as { isOpened: boolean }).isOpened = true;

      bearer.centralManagerDidUpdateState(
        centralManager as unknown as CBCentralManager,
        CBCentralManagerState.poweredOn,
      );

      expect(onClose).not.toHaveBeenCalled();
      expect((bearer as unknown as { isOpened: boolean }).isOpened).toBe(true);
    });
  });
});
