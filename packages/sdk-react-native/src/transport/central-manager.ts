import { BleManager, State, ScanMode, LogLevel } from "react-native-ble-plx";
import {
  UUID,
  CBCentralManager,
  CBCentralManagerState,
  CBPeripheral,
  CBPeripheralState,
} from "@blemeshjs/utils";
import { RNCBPeripheral } from "./peripheral.js";

export class RNCBCentralManager extends CBCentralManager {
  private bleManager: BleManager;
  private discoveredPeripherals: Map<string, CBPeripheral> = new Map();
  public state: CBCentralManagerState = CBCentralManagerState.unknown;
  private static $instance = new RNCBCentralManager();

  private constructor() {
    super();
    this.bleManager = new BleManager();
    this.bleManager
      .setLogLevel(LogLevel.Verbose)
      .then(() => {
        this.setupStateListener();
      })
      .catch(console.error);
  }

  public static get instance(): RNCBCentralManager {
    return this.$instance;
  }

  private setupStateListener(): void {
    this.bleManager.onStateChange((state) => {
      const newState = this.mapBleStateToCBCentralManagerState(state);
      this.state = newState;
      this.emit("centralManagerDidUpdateState", this, newState);
    }, true);
  }

  private mapBleStateToCBCentralManagerState(state: State): CBCentralManagerState {
    switch (state) {
      case State.PoweredOn:
        return CBCentralManagerState.poweredOn;
      case State.PoweredOff:
        return CBCentralManagerState.poweredOff;
      case State.Unauthorized:
        return CBCentralManagerState.unauthorized;
      case State.Unsupported:
        return CBCentralManagerState.unsupported;
      case State.Resetting:
        return CBCentralManagerState.resetting;
      default:
        return CBCentralManagerState.unknown;
    }
  }

  public getState(): CBCentralManagerState {
    return this.state;
  }

  public scanForPeripherals(serviceUUIDs?: string[]) {
    this.discoveredPeripherals.clear();

    const scanOptions = {
      scanMode: ScanMode.LowPower,
      allowDuplicates: true,
    };

    return this.bleManager
      .startDeviceScan(serviceUUIDs ?? null, scanOptions, (error, device) => {
        if (error) {
          // FIXME: Handle error appropriately
        }

        if (device) {
          const peripheral = RNCBPeripheral.fromDevice(device, false);
          this.discoveredPeripherals.set(peripheral.identifier.uuidString, peripheral);

          this.emit(
            "centralManagerDidDiscoverPeripheral",
            this,
            peripheral,
            device.rssi ?? undefined,
            {
              serviceData: device.serviceData,
              manufacturerData: device.manufacturerData,
            },
          );
        }
      })
  }

  public stopScan() {
    return this.bleManager.stopDeviceScan();
  }

  public async connect(peripheral: CBPeripheral) {
    return this.bleManager
      .connectToDevice(peripheral.identifier.uuidString)
      .then(() => {
        peripheral.state = CBPeripheralState.connected;
        this.emit("centralManagerDidConnect", this, peripheral);
      })
      .catch((error: Error) => {
        this.emit("centralManagerDidFailConnect", this, peripheral, error);
        throw error;
      });
  }

  public async cancelPeripheralConnection(peripheral: CBPeripheral) {
    return this.bleManager
      .cancelDeviceConnection(peripheral.identifier.uuidString)
      .then(() => {
        peripheral.state = CBPeripheralState.disconnected;
        this.emit("centralManagerDidDisconnectPeripheral", this, peripheral);
      })
      .catch((error: Error) => {
        this.emit("centralManagerDidDisconnectPeripheral", this, peripheral, error);
        throw error;
      });
  }

  public retrieveConnectedPeripherals(serviceUUIDs?: string[]): CBPeripheral[] {
    const peripherals = Array.from(this.discoveredPeripherals.values());
    const servicePeripherals = serviceUUIDs
      ? peripherals.filter((peripheral) =>
        peripheral.services?.some((service) =>
          serviceUUIDs.includes(service.uuid.fullUuidString),
        ),
      )
      : peripherals;
    return servicePeripherals.filter(
      (peripheral) => peripheral.state === CBPeripheralState.connected,
    );
  }

  public retrievePeripherals(identifiers: UUID[]): CBPeripheral[] {
    const peripherals = Array.from(this.discoveredPeripherals.values());
    return peripherals.filter((peripheral) =>
      identifiers.some((uuid) => peripheral.identifier.equal(uuid)),
    );
  }

  public destroy(): void {
    this.bleManager.destroy().catch(console.error);
  }
}
