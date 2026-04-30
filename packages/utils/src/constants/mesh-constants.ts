import { CBUUID } from "../types/cbuuid.js";
import { BindableTinyEmitter } from "../types/emitter.js";
import { UUID } from "../types/uuid.js";
import { Data } from "../types/buffer.js";
import { Int64 } from "../types/number.js";

/**
 * A base class for mesh service objects.
 */
export abstract class MeshService {
  /**
   * Service UUID.
   */
  static readonly uuid: CBUUID;
  /**
   * Data In characteristic UUID.
   */
  static readonly dataInUuid: CBUUID;
  /**
   * Data Out characteristic UUID.
   */
  static readonly dataOutUuid: CBUUID;
}

/**
 * A structure defining Mesh Provisioning service, which shall be present on
 * unprovisioned devices.
 *
 * It allows sending provisioning messages. When provisioning is complete,
 * the service shall be replaced with Mesh Proxy service.
 */
export class MeshProvisioningService extends MeshService {
  public static uuid = new CBUUID("1827");
  public static dataInUuid = new CBUUID("2ADB");
  public static dataOutUuid = new CBUUID("2ADC");

  public static matches(service: CBService): boolean {
    return service.isMeshProvisioningService;
  }

  private constructor() {
    super();
  }
}

/**
 * A structure defining Mesh Proxy service, which shall be present on
 * provisioned Nodes.
 *
 * The Mesh Proxy service is used to send mesh messages over GATT.
 */
export class MeshProxyService extends MeshService {
  public static uuid = new CBUUID("1828");
  public static dataInUuid = new CBUUID("2ADD");
  public static dataOutUuid = new CBUUID("2ADE");

  public static matches(service: CBService): boolean {
    return service.isMeshProxyService;
  }

  private constructor() {
    super();
  }
}
export enum CBPeripheralState {
  disconnected = "disconnected",
  connecting = "connecting",
  connected = "connected",
  disconnecting = "disconnecting",
}

export abstract class CBPeripheral extends BindableTinyEmitter<CBPeripheralHandler> {
  /** A unique identifier of the peripheral */
  public abstract identifier: UUID;

  /** A list of services provided by the peripheral */
  public abstract services?: CBService[];

  /** Display name (optional, may be null or undefined if not advertising) */
  public abstract name?: string;

  /** Current connection state */
  public abstract state: CBPeripheralState;

  /** Optional manufacturer data or device metadata */
  public abstract advertisementData?: Record<string, unknown>;

  /** Signal strength in dBm */
  public abstract rssi?: number;

  /** Is peripheral equal to other peripheral? */
  public equal(other: unknown): boolean {
    return other instanceof CBPeripheral && this.identifier.equal(other.identifier);
  }

  public abstract readRSSI(): void;

  public abstract discoverServices(serviceUUIDs: CBUUID[]): void;

  public abstract discoverCharacteristics(characteristicUUIDs: CBUUID[], service: CBService): void;

  public abstract setNotifyValue(enabled: boolean, characteristic: CBCharacteristic): void;

  public abstract writeValue(
    data: Data,
    characteristic: CBCharacteristic,
    type: CBCharacteristicWriteType,
  ): Promise<void>;

  public abstract maximumWriteValueLength(type: CBCharacteristicWriteType): Int64;
}

export abstract class CBService {
  /**
   * The UUID of the service.
   */
  abstract uuid: CBUUID;

  abstract peripheral: CBPeripheral;
  abstract characteristics: CBCharacteristic[];
  /**
   * Whether the service UUID matches Mesh Provisioning Service UUID.
   */
  public get isMeshProvisioningService(): boolean {
    return this.uuid.equals(MeshProvisioningService.uuid);
  }

  /**
   * Whether the service UUID matches Mesh Proxy Service UUID.
   */
  public get isMeshProxyService(): boolean {
    return this.uuid.equals(MeshProxyService.uuid);
  }
}

export enum CBCharacteristicProperties {
  broadcast = 1 << 0,
  read = 1 << 1,
  writeWithoutResponse = 1 << 2,
  write = 1 << 3,
  notify = 1 << 4,
  indicate = 1 << 5,
  authenticatedSignedWrites = 1 << 6,
  extendedProperties = 1 << 7,
  notifyEncryptionRequired = 1 << 8,
  indicateEncryptionRequired = 1 << 9,
}

export enum CBCharacteristicWriteType {
  withResponse = 0,
  withoutResponse = 1,
}

export abstract class CBCharacteristic {
  /**
   * THe UUID of the characteristic.
   */
  abstract uuid: CBUUID;

  /** UUID of the service this characteristic belongs to */
  abstract serviceUUID: CBUUID;

  /** If true, the characteristic is currently notifying (i.e. streaming updates) */
  abstract isNotifying: boolean;

  /** Characteristic properties (e.g., read, write, notify) */
  abstract properties: CBCharacteristicProperties[];

  /** Last known value, if read or notified */
  public abstract value?: Data;

  /**
   * Whether the characteristic UUID matches the Data In characteristic UUID.
   */
  public get isMeshProvisioningDataInCharacteristic(): boolean {
    return this.uuid.equals(MeshProvisioningService.dataInUuid);
  }

  /**
   * Whether the characteristic UUID matches the Data Out characteristic UUID.
   */
  public get isMeshProvisioningDataOutCharacteristic(): boolean {
    return this.uuid.equals(MeshProvisioningService.dataOutUuid);
  }

  /**
   * Whether the characteristic UUID matches the Data In characteristic UUID.
   */
  public get isMeshProxyDataInCharacteristic(): boolean {
    return this.uuid.equals(MeshProxyService.dataInUuid);
  }

  /**
   * Whether the characteristic UUID matches the Data Out characteristic UUID.
   */
  public get isMeshProxyDataOutCharacteristic(): boolean {
    return this.uuid.equals(MeshProxyService.dataOutUuid);
  }

  /** Is the characteristic equal to another? */
  public equal(other: unknown): boolean {
    return other instanceof CBCharacteristic && this.uuid.equals(other.uuid);
  }
}

/**
 * Abstract base class representing the handler of a Bluetooth peripheral.
 * Use this class to respond to events such as service discovery and characteristic updates.
 */
export abstract class CBPeripheralHandler {
  /**
   * Called when services are discovered on the peripheral.
   *
   * @param peripheral - The peripheral where services were discovered.
   * @param error - Optional error if service discovery failed.
   */
  abstract didDiscoverServices(peripheral: CBPeripheral, error?: Error): void;

  /**
   * Called when characteristics are discovered for a specific service.
   *
   * @param peripheral - The peripheral where characteristics were discovered.
   * @param service - The service that owns the characteristics.
   * @param error - Optional error if characteristic discovery failed.
   */
  abstract didDiscoverCharacteristicsForService(
    peripheral: CBPeripheral,
    service: CBService,
    error?: Error,
  ): void;

  /**
   * Called when a characteristic's value is updated.
   *
   * @param peripheral - The peripheral containing the characteristic.
   * @param characteristic - The characteristic whose value was updated.
   * @param error - Optional error if the read failed.
   */
  abstract didUpdateValueForCharacteristic(
    peripheral: CBPeripheral,
    characteristic: CBCharacteristic,
    error?: Error,
  ): void;

  /**
   * Called when a write to a characteristic completes.
   *
   * @param peripheral - The peripheral where the write occurred.
   * @param characteristic - The characteristic that was written to.
   * @param error - Optional error if the write failed.
   */
  abstract didWriteValueForCharacteristic(
    peripheral: CBPeripheral,
    characteristic: CBCharacteristic,
    error?: Error,
  ): void;

  /**
   * Called when notification state changes for a characteristic.
   *
   * @param peripheral - The peripheral owning the characteristic.
   * @param characteristic - The characteristic whose notification state changed.
   * @param error - Optional error.
   */
  abstract didUpdateNotificationStateForCharacteristic(
    peripheral: CBPeripheral,
    characteristic: CBCharacteristic,
    error?: Error,
  ): void;

  /**
   * Called when the peripheral connection state changes.
   *
   * @param peripheral - The peripheral.
   */
  abstract didUpdateState(peripheral: CBPeripheral): void;

  /**
   * Called when the peripheral disconnects.
   *
   * @param peripheral - The peripheral.
   */
  abstract didDisconnect(peripheral: CBPeripheral): void;

  abstract didReadRSSI(peripheral: CBPeripheral, rssi: Int64, error?: Error): void;
}

/**
 * Abstract base class representing the handler of a central Bluetooth manager.
 * Use this class to respond to central manager events such as state updates and peripheral discovery.
 */
export abstract class CBCentralManagerHandler {
  /**
   * Called when the central manager's state is updated.
   *
   * @param central - The central manager instance.
   * @param state - A string representing the new state (e.g., 'poweredOn', 'poweredOff', etc.).
   */
  abstract centralManagerDidUpdateState(
    central: CBCentralManager,
    state: CBCentralManagerState,
  ): void;

  /**
   * Called when a connection to a peripheral is successfully established.
   *
   * @param central - The central manager instance.
   * @param peripheral - The connected peripheral.
   */
  abstract centralManagerDidConnect(central: CBCentralManager, peripheral: CBPeripheral): void;

  /**
   * Called when a connection to a peripheral fails.
   *
   * @param central - The central manager instance.
   * @param peripheral - The peripheral that failed to connect.
   * @param error - The error that occurred during the connection attempt.
   */
  abstract centralManagerDidFailConnect(
    central: CBCentralManager,
    peripheral: CBPeripheral,
    error: Error,
  ): void;

  /**
   * Called when a peripheral is disconnected.
   *
   * @param central - The central manager instance.
   * @param peripheral - The disconnected peripheral.
   * @param error - Optional error if the disconnection was unexpected.
   */
  abstract centralManagerDidDisconnectPeripheral(
    central: CBCentralManager,
    peripheral: CBPeripheral,
    error?: Error,
  ): void;

  /**
   * Called when a peripheral is discovered.
   *
   * @param central - The central manager instance.
   * @param peripheral - The discovered peripheral.
   * @param rssi - Optional received signal strength indicator (RSSI) of the peripheral.
   * @param advertisementData - Optional advertisement data from the peripheral.
   */
  abstract centralManagerDidDiscoverPeripheral(
    central: CBCentralManager,
    peripheral: CBPeripheral,
    rssi?: number,
    advertisementData?: Record<string, unknown>,
  ): void;
}

export enum CBCentralManagerState {
  unknown = "unknown",
  resetting = "resetting",
  unsupported = "unsupported",
  unauthorized = "unauthorized",
  poweredOff = "poweredOff",
  poweredOn = "poweredOn",
}

/**
 * Abstract class representing a Bluetooth Central Manager.
 * Subclasses must implement scanning, connection, and state management logic.
 */
export abstract class CBCentralManager extends BindableTinyEmitter<CBCentralManagerHandler> {
  public abstract state: CBCentralManagerState;

  /**
   * Returns the current Bluetooth state of the central manager.
   */
  abstract getState(): CBCentralManagerState;

  /**
   * Starts scanning for peripherals.
   * @param serviceUUIDs - Optional list of service UUIDs to filter results.
   */
  abstract scanForPeripherals(serviceUUIDs?: string[]): Promise<void>;

  /**
   * Stops any ongoing scan for peripherals.
   */
  abstract stopScan(): Promise<void>;

  /**
   * Attempts to connect to the specified peripheral.
   * @param peripheral - The peripheral to connect to.
   */
  abstract connect(peripheral: CBPeripheral): Promise<void>;

  /**
   * Cancels an active or pending connection to a peripheral.
   * @param peripheral - The peripheral to disconnect from.
   */
  abstract cancelPeripheralConnection(peripheral: CBPeripheral): Promise<void>;

  /**
   * Retrieves peripherals that are already connected and match the specified services.
   * @param serviceUUIDs - Optional service UUIDs to filter connected peripherals.
   */
  abstract retrieveConnectedPeripherals(serviceUUIDs?: string[]): CBPeripheral[];

  abstract retrievePeripherals(identifiers: UUID[]): CBPeripheral[];
}

export class BleError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
  }
}
