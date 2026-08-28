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
  LogCategory,
  LoggerHandler,
  MeshProvisioningService,
  MeshProxyService,
  UUID,
} from "@blemeshjs/utils";
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

  public async open() {
    if (this.isOpened) return;
    this.isOpened = true;

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

    if (
      this.centralManager.state == CBCentralManagerState.poweredOn &&
      this.basePeripheral?.state == CBPeripheralState.disconnected
    ) {
      this.logger?.v(
        LogCategory.bearer,
        `Connecting to ${this.basePeripheral.name ?? "Unknown Device"}...`,
      );
      return this.centralManager
        .connect(this.basePeripheral)
        .then(() => {
          this.logger?.i(
            LogCategory.bearer,
            `Connected to ${this.basePeripheral.name ?? "Unknown Device"}`,
          );
          this.emit("bearerDidConnect", this);
        })
        .then(() => this.discoverServices())
        .then((services) => {
          return services.reduce<Promise<void>>(
            (promise, service) =>
              promise.then(() => {
                if (this.service.matches(service)) {
                  this.logger?.v(LogCategory.bearer, "Service found");
                  return this.discoverCharacteristics(service).then((characteristics) => {
                    // Look for required characteristics.
                    for (const characteristic of characteristics) {
                      if (this.service.dataInUuid.equals(characteristic.uuid)) {
                        this.logger?.v(LogCategory.bearer, "Data In characteristic found");
                        this.dataInCharacteristic = characteristic;
                      } else if (this.service.dataOutUuid.equals(characteristic.uuid)) {
                        this.logger?.v(LogCategory.bearer, "Data Out characteristic found");
                        this.dataOutCharacteristic = characteristic;
                      }
                    }

                    // Ensure all required characteristics were found.
                    if (
                      typeof this.dataOutCharacteristic === "undefined" ||
                      typeof this.dataInCharacteristic === "undefined" ||
                      !this.dataOutCharacteristic.properties.includes(
                        CBCharacteristicProperties.notify,
                      )
                    ) {
                      this.logger?.e(LogCategory.bearer, "Device not supported");
                      return this.close();
                    }
                    this.emit("bearerDidDiscoverServices", this);
                    return this.enableNotifications(this.dataOutCharacteristic).then(() => {
                      this.logger?.v(LogCategory.bearer, "Data Out notifications enabled");
                      this.logger?.i(LogCategory.bearer, "GATT Bearer open and ready");
                      this.emit("bearerDidOpen", this);
                    });
                  });
                }
              }),
            Promise.resolve(),
          );
        });
    }
  }

  public async close() {
    if (!this.isOpened) return;
    this.isOpened = false;
    if (
      this.basePeripheral?.state === CBPeripheralState.connected ||
      this.basePeripheral?.state == CBPeripheralState.connecting
    ) {
      this.logger?.v(LogCategory.bearer, "Cancelling connection...");
      return this.centralManager.cancelPeripheralConnection(this.basePeripheral);
    }
  }

  public send(data: Data, type: PduType) {
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

    return packets.reduce<Promise<void>>(
      (promise, packet) =>
        promise.then(() => {
          this.logger?.d(LogCategory.bearer, `-> 0x${uint8ArrayToHex(packet)}`);
          return this.basePeripheral.writeValue(
            packet,
            this.dataInCharacteristic!,
            CBCharacteristicWriteType.withoutResponse,
          );
        }),
      Promise.resolve(),
    );
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
    return this.basePeripheral.readRSSI();
  }

  // NOTE: - Implementation

  /**
   * Starts service discovery, only given Service.
   */
  private discoverServices() {
    this.logger?.v(LogCategory.bearer, "Discovering services...");
    return this.basePeripheral.discoverServices([this.service.uuid]);
  }

  /**
   * Starts characteristic discovery for Data In and Data Out Characteristics.
   *
   * @param service The service to look for the characteristics in.
   */
  private discoverCharacteristics(service: CBService) {
    this.logger?.v(LogCategory.bearer, "Discovering characteristics...");
    return this.basePeripheral.discoverCharacteristics(
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
    return this.basePeripheral.setNotifyValue(true, characteristic);
  }

  // NOTE: - CentralManagerHandler
  public centralManagerDidUpdateState(_central: CBCentralManager, state: CBCentralManagerState) {
    this.logger?.i(LogCategory.bearer, `Central Manager state changed to ${state}`);
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

  public centralManagerDidDiscoverPeripheral(
    _central: CBCentralManager,
    peripheral: CBPeripheral,
    rssi?: number,
    _advertisementData?: unknown,
  ): void {
    this.logger?.v(
      LogCategory.bearer,
      `Discovered ${peripheral.name ?? "Unknown Device"} with RSSI ${rssi}`,
    );
  }

  // NOTE: - PeripheralHandler
  public didDisconnect(_peripheral: CBPeripheral): void {
    this.logger?.v(LogCategory.bearer, "Peripheral disconnected");
  }

  public didUpdateState(_peripheral: CBPeripheral): void {
    this.logger?.v(LogCategory.bearer, "Peripheral state changed");
  }

  public didUpdateValueForCharacteristic(
    _peripheral: CBPeripheral,
    characteristic: CBCharacteristic,
  ) {
    if (!characteristic.equal(this.dataOutCharacteristic)) return;

    const data = characteristic.value;
    if (typeof data === "undefined") return;

    this.logger?.d(LogCategory.bearer, `<- 0x${uint8ArrayToHex(data)}`);
    const message = this.protocolHandler.reassemble(data);
    if (typeof message !== "undefined") {
      this.emit("bearerDidDeliverData", this, message.data, message.messageType);
    }
  }
}
