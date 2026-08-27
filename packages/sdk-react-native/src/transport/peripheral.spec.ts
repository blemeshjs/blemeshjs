import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * react-native-ble-plx ships untranspiled sources that Vite cannot parse, so the
 * whole module is replaced with the small surface the transport actually uses.
 */
class FakeBleError extends Error {
  constructor(
    message: string,
    public errorCode: number,
  ) {
    super(message);
  }
}

const FakeBleErrorCode = {
  OperationCancelled: 2,
  DeviceDisconnected: 201,
};

vi.mock("react-native-ble-plx", () => ({
  BleError: FakeBleError,
  BleErrorCode: FakeBleErrorCode,
}));

const { RNCBPeripheral } = await import("./peripheral.js");
const { CBCharacteristicWriteType, CBPeripheralState, CBUUID } = await import("@blemeshjs/utils");
type CBCharacteristic = import("@blemeshjs/utils").CBCharacteristic;

const SERVICE_UUID = "00001828-0000-1000-8000-00805f9b34fb";
const DATA_IN_UUID = "00002adb-0000-1000-8000-00805f9b34fb";
const DATA_OUT_UUID = "00002adc-0000-1000-8000-00805f9b34fb";

type MonitorListener = (error: FakeBleError | null, char: { value: string | null } | null) => void;

function createFakeDevice(overrides: Record<string, unknown> = {}) {
  const monitors: MonitorListener[] = [];
  const removed: number[] = [];

  const device = {
    id: "68EDF61A-D073-9547-A768-3D9DDA15C36E",
    name: "Mesh Node",
    localName: null,
    rssi: -55,
    mtu: 247,
    manufacturerData: null,
    onDisconnected: vi.fn(() => ({ remove: vi.fn() })),
    readRSSI: vi.fn(() => Promise.resolve({ rssi: -42 })),
    discoverAllServicesAndCharacteristics: vi.fn(() => Promise.resolve(device)),
    services: vi.fn(() =>
      Promise.resolve([
        { uuid: SERVICE_UUID, characteristics: () => Promise.resolve([]) },
      ]),
    ),
    monitorCharacteristicForService: vi.fn(
      (_service: string, _char: string, listener: MonitorListener) => {
        const index = monitors.push(listener) - 1;
        return { remove: vi.fn(() => removed.push(index)) };
      },
    ),
    writeCharacteristicWithoutResponseForService: vi.fn(() => Promise.resolve({})),
    writeCharacteristicWithResponseForService: vi.fn(() => Promise.resolve({})),
    ...overrides,
  };

  return { device, monitors, removed };
}

function createFakeCharacteristic(uuid: string): CBCharacteristic {
  return {
    uuid: new CBUUID(uuid),
    serviceUUID: new CBUUID(SERVICE_UUID),
    isNotifying: false,
    properties: [],
    value: undefined,
  } as unknown as CBCharacteristic;
}

function createPeripheral(device: unknown) {
  return RNCBPeripheral.fromDevice(
    device as never,
    /* isConnected */ true,
  );
}

describe("RNCBPeripheral", () => {
  let fake: ReturnType<typeof createFakeDevice>;

  beforeEach(() => {
    fake = createFakeDevice();
  });

  describe("fromDevice", () => {
    it("carries advertisement metadata and MTU across from the native device", () => {
      const peripheral = createPeripheral(fake.device);

      expect(peripheral.name).toBe("Mesh Node");
      expect(peripheral.rssi).toBe(-55);
      expect(peripheral.state).toBe(CBPeripheralState.connected);
      expect(
        peripheral.maximumWriteValueLength(CBCharacteristicWriteType.withoutResponse).toNumber(),
      ).toBe(247);
    });

    it("defaults the MTU to 23 when the device does not report one", () => {
      const { device } = createFakeDevice({ mtu: null });
      const peripheral = createPeripheral(device);

      expect(
        peripheral.maximumWriteValueLength(CBCharacteristicWriteType.withoutResponse).toNumber(),
      ).toBe(23);
    });
  });

  describe("readRSSI", () => {
    it("resolves with the refreshed RSSI instead of emitting a delegate callback", async () => {
      const peripheral = createPeripheral(fake.device);

      await expect(peripheral.readRSSI()).resolves.toBe(-42);
      expect(peripheral.rssi).toBe(-42);
    });

    it("resolves with 0 when the device reports no RSSI", async () => {
      const { device } = createFakeDevice({
        readRSSI: vi.fn(() => Promise.resolve({ rssi: null })),
      });

      await expect(createPeripheral(device).readRSSI()).resolves.toBe(0);
    });

    it("rejects when the native read fails", async () => {
      const { device } = createFakeDevice({
        readRSSI: vi.fn(() => Promise.reject(new Error("radio off"))),
      });

      await expect(createPeripheral(device).readRSSI()).rejects.toThrow("radio off");
    });
  });

  describe("discoverServices", () => {
    it("resolves only the requested services", async () => {
      const { device } = createFakeDevice({
        services: vi.fn(() =>
          Promise.resolve([
            { uuid: SERVICE_UUID, characteristics: () => Promise.resolve([]) },
            { uuid: "0000180f-0000-1000-8000-00805f9b34fb", characteristics: () => Promise.resolve([]) },
          ]),
        ),
      });
      const peripheral = createPeripheral(device);

      const services = await peripheral.discoverServices([new CBUUID(SERVICE_UUID)]);

      expect(services).toHaveLength(1);
      expect(services[0].uuid.equals(new CBUUID(SERVICE_UUID))).toBe(true);
      // Every discovered service is still cached on the peripheral.
      expect(peripheral.services).toHaveLength(2);
    });

    it("resolves every service when no filter is supplied", async () => {
      const peripheral = createPeripheral(fake.device);

      await expect(peripheral.discoverServices([])).resolves.toHaveLength(1);
    });

    it("rejects when native discovery fails", async () => {
      const { device } = createFakeDevice({
        discoverAllServicesAndCharacteristics: vi.fn(() => Promise.reject(new Error("gatt error"))),
      });

      await expect(createPeripheral(device).discoverServices([])).rejects.toThrow("gatt error");
    });
  });

  describe("discoverCharacteristics", () => {
    it("rejects when the service was never discovered on this peripheral", async () => {
      const peripheral = createPeripheral(fake.device);
      await peripheral.discoverServices([]);

      const unknownService = {
        uuid: new CBUUID("0000180f-0000-1000-8000-00805f9b34fb"),
      } as never;

      await expect(peripheral.discoverCharacteristics([], unknownService)).rejects.toThrow(
        /not found on peripheral/,
      );
    });

    it("narrows the discovered characteristics to the requested UUIDs", async () => {
      const { device } = createFakeDevice({
        services: vi.fn(() =>
          Promise.resolve([
            {
              uuid: SERVICE_UUID,
              characteristics: () =>
                Promise.resolve([
                  { uuid: DATA_IN_UUID, isWritableWithoutResponse: true },
                  { uuid: DATA_OUT_UUID, isNotifiable: true },
                ]),
            },
          ]),
        ),
      });
      const peripheral = createPeripheral(device);
      const [service] = await peripheral.discoverServices([]);

      const characteristics = await peripheral.discoverCharacteristics(
        [new CBUUID(DATA_OUT_UUID)],
        service,
      );

      expect(characteristics).toHaveLength(1);
      expect(characteristics[0].uuid.equals(new CBUUID(DATA_OUT_UUID))).toBe(true);
    });

    it("does not accumulate duplicates when discovery runs twice", async () => {
      const { device } = createFakeDevice({
        services: vi.fn(() =>
          Promise.resolve([
            {
              uuid: SERVICE_UUID,
              characteristics: () => Promise.resolve([{ uuid: DATA_IN_UUID }]),
            },
          ]),
        ),
      });
      const peripheral = createPeripheral(device);
      const [service] = await peripheral.discoverServices([]);

      await peripheral.discoverCharacteristics([], service);
      const second = await peripheral.discoverCharacteristics([], service);

      expect(second).toHaveLength(1);
    });
  });

  describe("setNotifyValue", () => {
    it("resolves once the subscription delivers its first callback", async () => {
      const peripheral = createPeripheral(fake.device);
      const characteristic = createFakeCharacteristic(DATA_OUT_UUID);

      const pending = peripheral.setNotifyValue(true, characteristic);
      fake.monitors[0](null, null);

      await expect(pending).resolves.toBeUndefined();
      expect(characteristic.isNotifying).toBe(true);
    });

    it("emits didUpdateValueForCharacteristic with the decoded value", async () => {
      const peripheral = createPeripheral(fake.device);
      const characteristic = createFakeCharacteristic(DATA_OUT_UUID);
      const onValue = vi.fn();
      peripheral.on("didUpdateValueForCharacteristic", onValue);

      const pending = peripheral.setNotifyValue(true, characteristic);
      // "AAEC" is base64 for [0x00, 0x01, 0x02]
      fake.monitors[0](null, { value: "AAEC" });
      await pending;

      expect(onValue).toHaveBeenCalledWith(peripheral, characteristic);
      expect(Array.from(characteristic.value!)).toEqual([0, 1, 2]);
    });

    it("rejects when the subscription reports a real failure", async () => {
      const peripheral = createPeripheral(fake.device);
      const characteristic = createFakeCharacteristic(DATA_OUT_UUID);

      const pending = peripheral.setNotifyValue(true, characteristic);
      fake.monitors[0](new FakeBleError("characteristic not notifiable", 503), null);

      await expect(pending).rejects.toThrow("characteristic not notifiable");
      expect(characteristic.isNotifying).toBe(false);
    });

    it("ignores the cancellation errors ble-plx raises on an intentional disconnect", async () => {
      const peripheral = createPeripheral(fake.device);
      const characteristic = createFakeCharacteristic(DATA_OUT_UUID);

      const pending = peripheral.setNotifyValue(true, characteristic);
      fake.monitors[0](
        new FakeBleError("cancelled", FakeBleErrorCode.OperationCancelled),
        null,
      );
      fake.monitors[0](
        new FakeBleError("disconnected", FakeBleErrorCode.DeviceDisconnected),
        null,
      );
      // The promise is still live and settles on the next real callback.
      fake.monitors[0](null, null);

      await expect(pending).resolves.toBeUndefined();
    });

    it("removes the subscription when notifications are disabled", async () => {
      const peripheral = createPeripheral(fake.device);
      const characteristic = createFakeCharacteristic(DATA_OUT_UUID);

      const pending = peripheral.setNotifyValue(true, characteristic);
      fake.monitors[0](null, null);
      await pending;

      await peripheral.setNotifyValue(false, characteristic);

      expect(fake.removed).toEqual([0]);
      expect(characteristic.isNotifying).toBe(false);
    });

    it("does not open a second subscription for an already-notifying characteristic", async () => {
      const peripheral = createPeripheral(fake.device);
      const characteristic = createFakeCharacteristic(DATA_OUT_UUID);

      const pending = peripheral.setNotifyValue(true, characteristic);
      fake.monitors[0](null, null);
      await pending;

      await peripheral.setNotifyValue(true, characteristic);

      expect(fake.device.monitorCharacteristicForService).toHaveBeenCalledTimes(1);
    });
  });

  describe("writeValue", () => {
    it("routes writes without response to the matching native call", async () => {
      const peripheral = createPeripheral(fake.device);
      const characteristic = createFakeCharacteristic(DATA_IN_UUID);

      await peripheral.writeValue(
        new Uint8Array([0, 1, 2]),
        characteristic,
        CBCharacteristicWriteType.withoutResponse,
      );

      expect(fake.device.writeCharacteristicWithoutResponseForService).toHaveBeenCalledWith(
        new CBUUID(SERVICE_UUID).fullUuidString,
        new CBUUID(DATA_IN_UUID).fullUuidString,
        "AAEC",
      );
      expect(fake.device.writeCharacteristicWithResponseForService).not.toHaveBeenCalled();
    });

    it("routes writes with response to the matching native call", async () => {
      const peripheral = createPeripheral(fake.device);
      const characteristic = createFakeCharacteristic(DATA_IN_UUID);

      await peripheral.writeValue(
        new Uint8Array([0xff]),
        characteristic,
        CBCharacteristicWriteType.withResponse,
      );

      expect(fake.device.writeCharacteristicWithResponseForService).toHaveBeenCalledOnce();
      expect(fake.device.writeCharacteristicWithoutResponseForService).not.toHaveBeenCalled();
    });

    it("rejects when the native write fails", async () => {
      const { device } = createFakeDevice({
        writeCharacteristicWithoutResponseForService: vi.fn(() =>
          Promise.reject(new Error("write failed")),
        ),
      });
      const peripheral = createPeripheral(device);

      await expect(
        peripheral.writeValue(
          new Uint8Array([0]),
          createFakeCharacteristic(DATA_IN_UUID),
          CBCharacteristicWriteType.withoutResponse,
        ),
      ).rejects.toThrow("write failed");
    });
  });
});
