import {
  DispatchQueue,
  LoggerHandler,
  UserDefaults,
  Hex,
  NSNull,
  Data,
  LogCategory,
  Address,
  IvIndex,
  KeyRefreshPhase,
  timeIntervalSinceNow,
  UInt8,
  UInt32,
  BackgroundTimer,
  ProxyConfigurationMessage,
} from "@mesh-link-js/utils";
import { MeshNetwork, NetworkKey } from "../../mesh-models/index.js";
import { NetworkManager } from "../network-manager.js";
import { LRUCache } from "lru-cache";
import { PduType } from "../../bearer/bearer.js";
import { uint8ArrayToHex } from "uint8array-extras";
import { NetworkPdu, NetworkPduDecoder } from "./network-pdu.js";
import { NetworkBeaconPdu } from "./network-beacon-pdu.js";
import { ControlMessage } from "../lower-transport-layer/control-message.js";
import { FilterStatus } from "../../mesh-messages/proxy-configuration/filter-status.js";
import {
  UnprovisionedDeviceBeacon,
  UnprovisionedDeviceBeaconDecoder,
} from "./unprovisioned-device-beacon.js";
import { NetworkBeaconDecoder } from "./network-beacon-decoder.js";
import { BearerError } from "../../bearer/bearer-error.js";
import { LowerTransportPdu } from "../lower-transport-layer/lower-transport-pdu.js";
import { hasMixin } from "ts-mixer";
import { AccessMessage } from "../lower-transport-layer/access-message.js";
import { GattBearer } from "../../bearer/index.js";
import { NetworkKeys } from "../../mesh-models-array/index.js";
import { ApplicationKeys } from "../../mesh-models-array/index.js";
import { UnknownNode } from "../../mesh-models/index.js";

export class NetworkLayer {
  private readonly networkManager?: NetworkManager;
  private readonly meshNetwork: MeshNetwork;
  private networkMessageCache: LRUCache<Hex, NSNull>;
  private defaults: UserDefaults;

  private mutex = new DispatchQueue("NetworkLayerMutex");

  private get logger(): LoggerHandler | undefined {
    return this.networkManager?.logger;
  }
  /**
   * The Network Key from the received Secure Network Beacon that contained
   * information about the Primary Network Key, if such was received,
   * or from the most recently received beacon otherwise.
   *
   * Secure Network Beacons are sent each time a Proxy Client connects
   * to a Proxy Server, one for each Network Key known to this server Node.
   *
   * This property is used for the Proxy Configuration messages, as they must be
   * encrypted with a Network Key known to the connected Proxy Node. To make the
   * implementation simpler (as it is not known to which Node the Proxy Client
   * is connected to), instead of trying all Network Keys, the messages are
   * encrypted with only the primary or the last received key. The primary, as
   * it is unlikely that the primary key will be removed from a Node, or last
   * received, as there is the highest chance of success, as this one was added
   * most recently.
   *
   * @NOTE: Each time a new Network Key is added to the Proxy Node,
   * it sends the Secure Network Beacon to the connected Proxy Client.
   * However, as there is no beacon sent when a key is removed, the
   * stored Network Key may be invalid. Therefore, it may be, that the
   * key with this index is no longer stored on the connected Node
   * and the Proxy Configuration messages will not work.
   */
  public proxyNetworkKey?: NetworkKey;

  public constructor(networkManager: NetworkManager) {
    this.networkManager = networkManager;
    this.meshNetwork = networkManager.meshNetwork;
    this.defaults = UserDefaults.instance(this.meshNetwork.uuid.uuidString, networkManager.storage);
    this.networkMessageCache = new LRUCache<Hex, NSNull>({
      max: 1000,
      ttl: 1000 * 60 * 60, // 1 hour
      allowStale: true,
    });
  }

  public async handleIncomingPdu(pdu: Data, type: PduType) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    if (type === PduType.provisioningPdu) {
      // Provisioning is handled using Provisioning Manager.
      return;
    }

    // Secure Network Beacons can repeat whenever the device connects to a new Proxy.
    if (type !== PduType.meshBeacon) {
      // Ensure the PDU has not been handled already.
      if (this.networkMessageCache.has(uint8ArrayToHex(pdu))) {
        // PDU has been handled already, ignore it.
        this.logger?.d(LogCategory.network, "PDU already handled");
        return;
      }

      this.networkMessageCache.set(uint8ArrayToHex(pdu), NSNull);
    }

    //Try decoding the PDU.
    switch (type) {
      case PduType.networkPdu: {
        const networkPdu = NetworkPduDecoder.decode(pdu, type, this.meshNetwork);
        if (typeof networkPdu !== "undefined") {
          this.logger?.i(LogCategory.network, `${networkPdu} received`);
          await networkManager.lowerTransportLayer.handleNetworkPdu(networkPdu);
          return;
        }

        this.logger?.w(LogCategory.network, "Failed to decrypt PDU");
        break;
      }
      case PduType.meshBeacon: {
        const beaconPdu = NetworkBeaconDecoder.decode(pdu, this.meshNetwork);
        if (typeof beaconPdu !== "undefined") {
          this.logger?.i(
            LogCategory.network,
            `${beaconPdu} received (authenticated using key: ${beaconPdu.networkKey})`,
          );
          await this.handleNetworkBeacon(beaconPdu);
          return;
        }
        const $beaconPdu = UnprovisionedDeviceBeaconDecoder.decode(pdu);
        if (typeof $beaconPdu !== "undefined") {
          this.logger?.i(LogCategory.network, `${$beaconPdu} received`);
          this.handleUnprovisionedDeviceBeacon($beaconPdu);
          return;
        }
        this.logger?.w(LogCategory.network, "Failed to decrypt mesh beacon PDU");
      }
      case PduType.proxyConfiguration: {
        const proxyPdu = NetworkPduDecoder.decode(pdu, type, this.meshNetwork);
        if (typeof proxyPdu !== "undefined") {
          this.logger?.i(LogCategory.network, `${proxyPdu} received`);
          await this.handleProxyConfigurationPdu(proxyPdu);
          return;
        }
        this.logger?.w(LogCategory.network, "Failed to decrypt Proxy PDU");
        break;
      }
      default:
        return;
    }
  }
  /**
   * This method handles the Unprovisioned Device beacon.
   *
   * The current implementation does nothing, as remote provisioning is
   * currently not supported.
   *
   * @param unprovisionedDeviceBeacon The Unprovisioned Device beacon received.
   */
  public handleUnprovisionedDeviceBeacon(_unprovisionedDeviceBeacon: UnprovisionedDeviceBeacon) {
    // TODO: Handle Unprovisioned Device beacon.
  }

  /**
   * Updates the information about the Network Key known to the current Proxy Server.
   *
   * The Network Key is required to send Proxy Configuration Messages that can be
   * decoded by the connected Proxy.
   *
   * For new Proxy connections this method also initiates the Proxy Filter with
   * preset `ProxyFilter.initialState`.
   *
   * @param networkKey The Network Key known to the connected Proxy.
   */
  public async updateProxyFilter(networkKey: NetworkKey) {
    const justConnected = typeof this.proxyNetworkKey === "undefined";

    // Keep the primary Network Key or the most recently received one from the connected
    // Proxy Server. This is to make sure (almost) that the Proxy Configuration messages
    // are sent encrypted with a key known to this Node.
    this.proxyNetworkKey = networkKey;

    if (justConnected) {
      await this.networkManager?.proxy?.newProxyDidConnect();
    }
  }

  /**
   * This method tries to send the Proxy Configuration Message.
   *
   * The Proxy Filter object will be informed about the success or a failure.
   *
   * @param message The Proxy Configuration message to be sent.
   */
  public async sendProxyConfigurationMessage(message: ProxyConfigurationMessage) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    const networkKey = this.proxyNetworkKey;
    if (typeof networkKey === "undefined") {
      // The Proxy Network Key is unknown.
      this.networkManager?.proxy?.managerFailedToDeliverMessage(message, BearerError.bearerClosed);
      return;
    }

    // If the Provisioner does not have a Unicast Address, just use a fake one
    // to configure the Proxy Server. This allows sniffing the network without
    // an option to send messages.
    const source =
      this.meshNetwork.localProvisioner?.node?.primaryUnicastAddress ?? Address.maxUnicastAddress;
    this.logger?.i(LogCategory.proxy, `Sending ${message} from: ${source.hex} to: 0000`);
    const pdu = ControlMessage.fromProxyConfigurationMessage(
      message,
      source,
      networkKey,
      this.meshNetwork.ivIndex,
    );
    this.logger?.i(LogCategory.network, `Sending ${pdu}`);
    try {
      await this.sendLowerTransportPdu(pdu, PduType.proxyConfiguration, pdu.ttl);
      networkManager.proxy?.managerDidDeliverMessage(message);
    } catch (error) {
      if (error === BearerError.bearerClosed) {
        this.proxyNetworkKey = undefined;
      }
      networkManager.proxy?.managerFailedToDeliverMessage(message, error as Error);
    }
  }

  /**
   * This method tries to send the Lower Transport Message of given type to the
   * given destination address. If the local Provisioner does not exist, or
   * does not have Unicast Address assigned, this method does nothing.
   *
   * @param pdu The Lower Transport PDU to be sent.
   * @param type The PDU type.
   * @param ttl The initial TTL (Time To Live) value of the message.
   * @throws This method may throw when the `MeshNetworkManager.transmitter` is not set, or has failed to send the PDU.
   */
  public async sendLowerTransportPdu(
    pdu: LowerTransportPdu,
    type: PduType,
    ttl: UInt8,
  ): Promise<void> {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") throw BearerError.bearerClosed;
    const transmitter = networkManager.transmitter;
    if (typeof transmitter === "undefined") throw BearerError.bearerClosed;

    const sequence: UInt32 = hasMixin(pdu, AccessMessage)
      ? pdu.sequence
      : await this.nextSequenceNumber(pdu.source);
    const networkPdu = NetworkPdu.encode(pdu, type, sequence, ttl) as NetworkPdu;
    this.logger?.i(
      LogCategory.network,
      `Sending ${networkPdu} encrypted using ${networkPdu.networkKey}`,
    );
    // Loopback interface.
    if (this.shouldLoopback(networkPdu)) {
      await this.handleIncomingPdu(networkPdu.pdu, type);
      // Messages sent with TTL = 1 will only be sent locally.
      if (ttl === 1) return;
      if (this.isLocalUnicastAddress(networkPdu.destination)) {
        // No need to send messages targeting local Unicast Addresses.
        return;
      }
      // If the message was sent locally, don't report Bearer closer error.
      transmitter.send(networkPdu.pdu, type);
    } else {
      // Messages sent with TTL = 1 may only be sent locally.
      if (ttl === 1) return;
      try {
        transmitter.send(networkPdu.pdu, type);
      } catch (error) {
        if (error === BearerError.bearerClosed) {
          this.proxyNetworkKey = undefined;
        }
        throw error;
      }
    }

    // Unless a GATT Bearer is used, the Network PDUs should be sent multiple times
    // if Network Transmit has been set for the local Provisioner's Node.
    const networkTransmit = this.meshNetwork.localProvisioner?.node?.networkTransmit;
    if (
      type === PduType.networkPdu &&
      !hasMixin(transmitter, GattBearer) &&
      networkTransmit &&
      networkTransmit.count > 1
    ) {
      let count = networkTransmit.count;
      BackgroundTimer.scheduledTimer(networkTransmit.timeInterval, true, (timer) => {
        if (typeof this === "undefined" || typeof this.networkManager === "undefined") {
          timer.invalidate();
          return;
        }
        networkManager.transmitter?.send(networkPdu.pdu, type);
        count -= 1;
        if (count === 0) {
          timer.invalidate();
        }
      });
    }
  }

  /**
   * Handles the received Proxy Configuration PDU.
   *
   * This method parses the payload and instantiates a message class.
   * The message is passed to the `ProxyFilter` for processing.
   *
   * @param proxyPdu The received Proxy Configuration PDU.
   */
  public async handleProxyConfigurationPdu(proxyPdu: NetworkPdu) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    const payload = proxyPdu.transportPdu;
    if (!(payload.length > 1)) {
      return;
    }
    const controlMessage = ControlMessage.fromNetworkPdu(proxyPdu);
    if (typeof controlMessage === "undefined") {
      this.logger?.w(LogCategory.network, "Failed to decrypt proxy PDU");
      return;
    }
    this.logger?.i(
      LogCategory.network,
      `${controlMessage} received (decrypted using key: ${controlMessage.networkKey})`,
    );

    let MessageType: typeof FilterStatus | undefined;

    switch (controlMessage.opCode) {
      case FilterStatus.opCode:
        MessageType = FilterStatus;
        break;
      default:
        MessageType = undefined;
        break;
    }
    try {
      if (typeof MessageType === "undefined") throw new Error("");
      const message = MessageType.fromData(controlMessage.upperTransportPdu);
      if (typeof message === "undefined") throw new Error("");
      this.logger?.i(
        LogCategory.proxy,
        `${message} received from: ${proxyPdu.source.hex} to: ${proxyPdu.destination.hex}`,
      );
      // Look for the proxy Node.
      const proxyNode =
        this.meshNetwork.nodeWithAddress(proxyPdu.source) ??
        new UnknownNode(proxyPdu, this.meshNetwork);
      await networkManager.proxy?.handle(message, proxyNode);
    } catch (error) {
      console.error(error);
      this.logger?.w(
        LogCategory.proxy,
        `Unsupported proxy configuration message (opcode: ${controlMessage.opCode})`,
      );
    }
  }

  /**
   * This method handles PDUs containing network state.
   *
   * As of Mesh Protocol 1.1 these are the Secure Network beacons and Private beacons.
   *
   * It will set the IV Index and IV Update Active flag and change the Key Refresh Phase based on the
   * information specified in the beacon.
   *
   * @param networkBeacon The Secure Network or Private beacon received.
   */
  async handleNetworkBeacon(networkBeacon: NetworkBeaconPdu) {
    const networkManager = this.networkManager;
    if (typeof networkManager === "undefined") return;
    /// The Network Key the beacon was authenticated with.
    const networkKey = networkBeacon.networkKey;
    // As of now, the library does not retransmit beacons.
    // If this node is a member of the primary subnet and the received beacon for a secondary subnet,
    // it shall disregard it.
    if (
      NetworkKeys.primaryKey(this.meshNetwork.networkKeys) !== undefined &&
      networkKey.isSecondary
    ) {
      this.logger?.w(
        LogCategory.network,
        `Discarding beacon for secondary network (key index: ${networkKey.index.toString(16)})`,
      );

      // If we've connected to a Proxy Node that doesn't know the Primary Network
      // we should still notify the user about a new Proxy.
      if (typeof this.proxyNetworkKey === "undefined") {
        await this.updateProxyFilter(networkKey);
      }
      return;
    }

    // Get the last IV Index.
    const map = await this.defaults.get<Record<string, unknown>>(IvIndex.indexKey);
    /// The last used IV Index for this mesh network.
    const lastIVIndex = IvIndex.fromMap(map) ?? new IvIndex();
    /// The date of the last change of IV Index or IV Update Flag.
    const timestamp = await this.defaults.get<number>(IvIndex.timestampKey);
    const lastTransitionDate = typeof timestamp === "number" ? new Date(timestamp) : undefined;
    /// A flag whether the IV has recently been updated using IV Recovery procedure.
    /// The at-least-96h requirement for the duration of the current state will not apply.
    /// The node shall not execute more than one IV Index Recovery within a period of 192 hours.
    const isIvRecoveryActive = (await this.defaults.get<boolean>(IvIndex.ivRecoveryKey)) ?? false;
    /// The test mode disables the 96h rule, leaving all other behavior unchanged.
    const isIvTestModeActive = networkManager.networkParameters.ivUpdateTestMode;
    // Ensure, that the received beacon can overwrite current IV Index.
    const flag = networkManager.networkParameters.allowIvIndexRecoveryOver42;
    if (
      networkBeacon.canOverwrite(
        lastIVIndex,
        lastTransitionDate,
        isIvRecoveryActive,
        isIvTestModeActive,
        flag,
      )
    ) {
      // Update the IV Index based on the information from the beacon.
      this.meshNetwork.ivIndex = networkBeacon.ivIndex;

      if (this.meshNetwork.ivIndex > lastIVIndex) {
        this.logger?.i(LogCategory.network, `Applying ${this.meshNetwork.ivIndex}`);
      }
      // If the IV Index used for transmitting messages effectively increased,
      // the Node shall reset the sequence number to 0x000000.
      //
      // NOTE: This library keeps separate sequence numbers for each Element of the
      //       local provisioner (source Unicast Address). All of them need to be reset.
      const localNode = this.meshNetwork.localProvisioner?.node;
      if (
        typeof localNode !== "undefined" &&
        this.meshNetwork.ivIndex.transmitIndex > lastIVIndex.transmitIndex
      ) {
        this.logger?.i(LogCategory.network, "Resetting local sequence numbers to 0");
        await this.defaults.resetSequenceNumbers(localNode);
      }

      // Store the last IV Index.
      await this.defaults.set(IvIndex.indexKey, this.meshNetwork.ivIndex.asMap);
      if (!lastIVIndex.equals(this.meshNetwork.ivIndex)) {
        await this.defaults.set(IvIndex.timestampKey, Date.now());

        const ivRecovery =
          this.meshNetwork.ivIndex.index > lastIVIndex.index + 1 &&
          networkBeacon.ivIndex.updateActive == false;
        await this.defaults.set(IvIndex.ivRecoveryKey, ivRecovery);
      }

      // If the Key Refresh Procedure is in progress, and the new Network Key
      // has already been set, the key refresh flag indicates switching to Phase 2.
      if (
        KeyRefreshPhase.keyDistribution === networkKey.phase &&
        networkBeacon.validForKeyRefreshProcedure &&
        networkBeacon.keyRefreshFlag === true
      ) {
        networkKey.phase = KeyRefreshPhase.usingNewKeys;
      }
      // If the Key Refresh Procedure is in Phase 2, and the key refresh flag is
      // set to false.
      if (
        KeyRefreshPhase.usingNewKeys === networkKey.phase &&
        networkBeacon.validForKeyRefreshProcedure &&
        networkBeacon.keyRefreshFlag === false
      ) {
        // Revoke the old Network Key...
        networkKey.oldKey = undefined; // This will set the phase to .normalOperation.
        // ...and old Application Keys bound to it.
        ApplicationKeys.boundToNetworkKey(this.meshNetwork.applicationKeys, networkKey).forEach(
          (key) => {
            key.oldKey = undefined;
          },
        );
      }
    } else if (!networkBeacon.ivIndex.equals(lastIVIndex.previous)) {
      let numberOfHoursSinceDate = "unknown time";
      if (typeof timestamp !== "undefined") {
        numberOfHoursSinceDate = `${-timeIntervalSinceNow(timestamp) / 3600}h`;
      }
      this.logger?.w(
        LogCategory.network,
        `Discarding beacon (${networkBeacon.ivIndex}, last ${lastIVIndex}, changed: ${numberOfHoursSinceDate} ago, test mode: ${networkManager.networkParameters.ivUpdateTestMode})`,
      );
      return;
    } // else,
    // the beacon was sent by a Node with a previous IV Index,
    // that has not yet transitioned to the one local Node has. Such IV Index
    // is still valid, at least for some time.

    await this.updateProxyFilter(networkKey);
  }

  /**
   * Returns whether the given Address is an address of a local Element.
   *
   * @param address The Address to check.
   * @returns `True` if the address is a Unicast Address and belongs to one of the local Node's elements; `false` otherwise.
   */
  public isLocalUnicastAddress(address: Address): boolean {
    return this.meshNetwork.localProvisioner?.node?.containsElementWithAddress(address) ?? false;
  }

  /**
   * Returns whether the PDU should loop back for local processing.
   *
   * @param networkPdu The PDU to check.
   */
  public shouldLoopback(networkPdu: NetworkPdu): boolean {
    const address = networkPdu.destination;
    return address.isGroup || address.isVirtual || this.isLocalUnicastAddress(address);
  }
  /**
   * This method returns the next outgoing Sequence number for the given
   * local source Address.
   *
   * @param source The source Element's Unicast Address.
   * @returns The Sequence number a message can be sent with.
   */
  public nextSequenceNumber(source: Address): Promise<UInt32> {
    return this.defaults.nextSequenceNumber(source);
  }
}
