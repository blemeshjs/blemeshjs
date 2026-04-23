import { Bearer, PduType, PduTypes } from "../bearer.js";
import {
  BindableTinyEmitter,
  BleError,
  CBCentralManager,
  CBCentralManagerHandler,
  CBCentralManagerState,
  CBCharacteristic,
  CBCharacteristicProperties,
  CBCharacteristicWriteType,
  CBPeripheral,
  CBPeripheralHandler,
  CBPeripheralState,
  CBService,
  Data,
  DispatchQueue,
  Int64,
  LogCategory,
  LoggerHandler,
  MeshProvisioningService,
  MeshProxyService,
  UUID,
} from "@mesh-link-js/utils";
import { BearerError } from "../bearer-error.js";
import { uint8ArrayToHex } from "uint8array-extras";
import { GattBearerHandler } from "./gatt-bearer-handler.js";
import { GattBearerError } from "./gatt-bearer-error.js";
import { ProxyProtocolHandler } from "./proxy-protocol-handler.js";
import { Mixin } from "ts-mixer";

/**
 * Base implementation for GATT Proxy bearer.
 */
export class BaseGattProxyBearer<
  Service extends typeof MeshProvisioningService | typeof MeshProxyService,
>
  extends Mixin(Bearer, BindableTinyEmitter<GattBearerHandler>)
  implements CBPeripheralHandler, CBCentralManagerHandler
{
  // NOTE: - Properties
  /**
   * The logger receives logs sent from the bearer. The logs will contain
   * raw data of sent and received packets, as well as connection events.
   */
  public logger?: LoggerHandler;

  protected centralManager: CBCentralManager;
  protected basePeripheral!: CBPeripheral;
  private mutex = new DispatchQueue("GattBearer");

  /**
   * The protocol used for segmentation and reassembly.
   */
  private protocolHandler: ProxyProtocolHandler;
  /**
   * The queue of PDUs to be sent. Used if the peripheral is busy.
   */
  private queue: Array<Data> = [];
  /**
   * A flag indicating whether `BaseGattProxyBearer.open()` method was called.
   */
  private isOpened: boolean = false;

  // NOTE: - Computed properties

  protected supportedPduTypes: Array<PduTypes> = [
    PduTypes.networkPdu,
    PduTypes.meshBeacon,
    PduTypes.proxyConfiguration,
    PduTypes.provisioningPdu,
  ];

  public get isOpen(): boolean {
    return (
      (typeof this.basePeripheral !== "undefined" &&
        this.basePeripheral.state === CBPeripheralState.connected &&
        this.dataOutCharacteristic?.isNotifying) ??
      false
    );
  }

  /**
   * The UUID associated with the peer.
   */
  public identifier: UUID;

  private $name: string | undefined;

  /**
   * The name of the peripheral.
   */
  public get name(): string | undefined {
    return this.$name;
  }

  // NOTE: - Characteristic properties

  private dataInCharacteristic?: CBCharacteristic;
  private dataOutCharacteristic?: CBCharacteristic;

  // NOTE: - Public API

  /**
   * Creates the Gatt Proxy Bearer object. Call `BaseGattProxyBearer.open()`
   * to open connection to the proxy.
   *
   * @param uuid The UUID associated with the peer.
   */
  public constructor(
    name: string | undefined,
    uuid: UUID,
    centralManager: CBCentralManager,
    private service: Service,
  ) {
    super();
    this.$name = name;
    this.centralManager = centralManager;
    this.identifier = uuid;
    this.protocolHandler = new ProxyProtocolHandler();
  }

  public open() {
    if (
      this.centralManager.state == CBCentralManagerState.poweredOn &&
      this.basePeripheral?.state == CBPeripheralState.disconnected
    ) {
      this.logger?.v(
        LogCategory.bearer,
        `Connecting to ${this.basePeripheral.name ?? "Unknown Device"}...`,
      );
      this.centralManager
        .connect(this.basePeripheral)
        .catch((error: Error) =>
          this.logger?.d(LogCategory.bearer, `Connection error: ${error.message}`),
        );
    }
    this.isOpened = true;
  }

  public close() {
    if (
      this.basePeripheral?.state === CBPeripheralState.connected ||
      this.basePeripheral?.state == CBPeripheralState.connecting
    ) {
      this.logger?.v(LogCategory.bearer, "Cancelling connection...");
      this.centralManager
        .cancelPeripheralConnection(this.basePeripheral)
        .catch((error: Error) =>
          this.logger?.d(LogCategory.bearer, `Disconnection error: ${error.message}`),
        );
    }
    this.isOpened = false;
  }

  public send(data: Data, type: PduType): void {
    if (!this.supports(type)) {
      throw BearerError.pduTypeNotSupported;
    }
    if (!this.isOpen) {
      throw BearerError.bearerClosed;
    }
    if (typeof this.dataInCharacteristic === "undefined") {
      throw GattBearerError.deviceNotSupported;
    }

    const mtu = this.basePeripheral.maximumWriteValueLength(
      CBCharacteristicWriteType.withoutResponse,
    );
    const packets = this.protocolHandler.segment(data, type, mtu);

    for (const packet of packets) {
      this.logger?.d(LogCategory.bearer, `-> 0x${uint8ArrayToHex(packet)}`);
      this.basePeripheral.writeValue(
        packet,
        this.dataInCharacteristic,
        CBCharacteristicWriteType.withoutResponse,
      );
    }
  }

  /**
   * Retrieves the current RSSI value for the peripheral while it is connected
   * to the central manager.
   *
   * The result will be returned using `GattBearerDelegate.bearerDidReadRSSI()` callback.
   */
  public readRSSI() {
    if (this.basePeripheral.state !== CBPeripheralState.connected) {
      return;
    }
    this.basePeripheral.readRSSI();
  }

  // NOTE: - Implementation

  /**
   * Starts service discovery, only given Service.
   */
  private discoverServices() {
    this.logger?.v(LogCategory.bearer, "Discovering services...");
    this.basePeripheral.discoverServices([this.service.uuid]);
  }

  /**
   * Starts characteristic discovery for Data In and Data Out Characteristics.
   *
   * @param service The service to look for the characteristics in.
   */
  private discoverCharacteristics(service: CBService) {
    this.logger?.v(LogCategory.bearer, "Discovering characteristics...");
    this.basePeripheral.discoverCharacteristics(
      [this.service.dataInUuid, this.service.dataOutUuid],
      service,
    );
  }

  /**
   * Enables notification for the given characteristic.
   *
   * @param characteristic The characteristic to enable notifications for.
   */
  private enableNotifications(characteristic: CBCharacteristic) {
    this.logger?.v(LogCategory.bearer, "Enabling notifications...");
    this.basePeripheral.setNotifyValue(true, characteristic);
  }

  // NOTE: - CentralManagerHandler

  public centralManagerDidDiscoverPeripheral(
    central: CBCentralManager,
    peripheral: CBPeripheral,
    rssi?: number,
    _advertisementData?: unknown,
  ): void {
    this.logger?.v(
      LogCategory.bearer,
      `Discovered ${peripheral.name ?? "Unknown Device"} with RSSI ${rssi}`,
    );
  }

  public centralManagerDidFailConnect(
    central: CBCentralManager,
    peripheral: CBPeripheral,
    error: Error,
  ): void {
    this.logger?.e(LogCategory.bearer, `Failed to connect: ${error.message}`);
  }

  public centralManagerDidUpdateState(_central: CBCentralManager, state: CBCentralManagerState) {
    this.logger?.i(LogCategory.bearer, `Central Manager state changed to ${state}`);
    if (state === CBCentralManagerState.poweredOn) {
      const peripheral = this.centralManager.retrievePeripherals([this.identifier])[0];
      if (typeof peripheral === "undefined") {
        this.logger?.w(
          LogCategory.bearer,
          `Device with identifier ${this.identifier.uuidString} not found`,
        );
        this.isOpened = false;
        return;
      }
      this.basePeripheral = peripheral;
      this.basePeripheral?.bindAllEvents(this);
      if (this.isOpened) {
        this.open();
      }
    } else {
      this.emit("bearerDidClose", this, BearerError.centralManagerNotPoweredOn);
    }
  }

  public centralManagerDidConnect(_: CBCentralManager, peripheral: CBPeripheral) {
    if (peripheral.equal(this.basePeripheral)) {
      this.logger?.i(LogCategory.bearer, `Connected to ${peripheral.name ?? "Unknown Device"}`);
      this.emit("bearerDidConnect", this);
      this.discoverServices();
    }
  }

  public centralManagerDidDisconnectPeripheral(
    _: CBCentralManager,
    peripheral: CBPeripheral,
    error?: Error,
  ) {
    if (peripheral.equal(this.basePeripheral)) {
      const deviceNotSupported =
        typeof this.dataInCharacteristic === "undefined" ||
        typeof this.dataOutCharacteristic === "undefined" ||
        !this.dataOutCharacteristic.properties.includes(CBCharacteristicProperties.notify);
      this.dataInCharacteristic = undefined;
      this.dataOutCharacteristic = undefined;
      if (error instanceof BleError) {
        switch (error.code) {
          case 6:
          case 7:
            this.logger?.e(LogCategory.bearer, error.message);
            break;
          default:
            this.logger?.e(
              LogCategory.bearer,
              `Disconnected from ${peripheral.name ?? "Unknown Device"} with error: ${error}`,
            );
        }
        this.emit("bearerDidClose", this, error);
      } else {
        if (deviceNotSupported) {
          this.logger?.e(
            LogCategory.bearer,
            `Disconnected from ${peripheral.name ?? "Unknown Device"} with error: Device not supported`,
          );
          this.emit("bearerDidClose", this, GattBearerError.deviceNotSupported);
          return;
        }
        this.logger?.i(
          LogCategory.bearer,
          `Disconnected from ${peripheral.name ?? "Unknown Device"}`,
        );
        this.emit("bearerDidClose", this, undefined);
      }
    }
  }

  // NOTE: - PeripheralHandler

  public didDisconnect(_peripheral: CBPeripheral): void {
    this.logger?.v(LogCategory.bearer, "Peripheral disconnected");
  }
  public didUpdateState(_peripheral: CBPeripheral): void {
    this.logger?.v(LogCategory.bearer, "Peripheral state changed");
  }

  public didDiscoverServices(peripheral: CBPeripheral, _?: Error) {
    const services = peripheral.services;
    if (typeof services !== "undefined") {
      for (const service of services) {
        if (this.service.matches(service)) {
          this.logger?.v(LogCategory.bearer, "Service found");
          this.discoverCharacteristics(service);
          return;
        }
      }
    }
    // Required service not found.
    this.logger?.e(LogCategory.bearer, "Device not supported");
    this.close();
  }

  public didDiscoverCharacteristicsForService(_: CBPeripheral, service: CBService, __?: Error) {
    // Look for required characteristics.
    const characteristics = service.characteristics;
    if (typeof characteristics !== "undefined") {
      for (const characteristic of characteristics) {
        if (this.service.dataInUuid.equals(characteristic.uuid)) {
          this.logger?.v(LogCategory.bearer, "Data In characteristic found");
          this.dataInCharacteristic = characteristic;
        } else if (this.service.dataOutUuid.equals(characteristic.uuid)) {
          this.logger?.v(LogCategory.bearer, "Data Out characteristic found");
          this.dataOutCharacteristic = characteristic;
        }
      }
    }

    // Ensure all required characteristics were found.
    if (
      typeof this.dataOutCharacteristic === "undefined" ||
      typeof this.dataInCharacteristic === "undefined" ||
      !this.dataOutCharacteristic.properties.includes(CBCharacteristicProperties.notify)
    ) {
      this.logger?.e(LogCategory.bearer, "Device not supported");
      this.close();
      return;
    }

    this.emit("bearerDidDiscoverServices", this);
    this.enableNotifications(this.dataOutCharacteristic);
  }

  public didUpdateNotificationStateForCharacteristic(
    _: CBPeripheral,
    characteristic: CBCharacteristic,
    __?: Error,
  ) {
    if (!characteristic.equal(this.dataOutCharacteristic) || !characteristic.isNotifying) {
      return;
    }

    this.logger?.v(LogCategory.bearer, "Data Out notifications enabled");
    this.logger?.i(LogCategory.bearer, "GATT Bearer open and ready");
    this.emit("bearerDidOpen", this);
  }

  public didUpdateValueForCharacteristic(
    _: CBPeripheral,
    characteristic: CBCharacteristic,
    error: Error,
  ) {
    if (error) {
      this.logger?.e(LogCategory.bearer, "Characteristic value update error: " + error.message);
      return;
    }

    if (!characteristic.equal(this.dataOutCharacteristic)) return;

    const data = characteristic.value;
    if (typeof data === "undefined") return;

    this.logger?.d(LogCategory.bearer, `<- 0x${uint8ArrayToHex(data)}`);
    const message = this.protocolHandler.reassemble(data);
    if (typeof message !== "undefined") {
      this.emit("bearerDidDeliverData", this, message.data, message.messageType);
    }
  }

  public didWriteValueForCharacteristic(_: CBPeripheral, __: CBCharacteristic, ___?: Error) {
    // Data is sent without response.
    // This method will not be called.
  }

  public didReadRSSI(_: CBPeripheral, RSSI: Int64, __?: Error) {
    this.emit("bearerDidReadRSSI", this, RSSI);
  }
}
