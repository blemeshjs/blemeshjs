import {
  Address,
  Algorithm,
  BindableTinyEmitter,
  Data,
  LogCategory,
  LoggerHandler,
  UInt8,
} from "@blemeshjs/utils";

import { textEncode } from "@borewit/text-codec";
import { Bearer, PduType, ProvisioningBearer } from "../bearer/bearer.js";
import { MeshNetwork } from "../mesh-models/mesh-network.js";
import { NetworkKey } from "../mesh-models/network-key.js";
import { UnprovisionedDevice } from "./unprovisioned-device.js";
import { BearerError } from "../bearer/bearer-error.js";
import {
  AuthAction,
  ProvisioningError,
  ProvisioningState,
  ProvisioningStateType,
} from "./provisioning-state.js";
import { ProvisioningData } from "./provisioning-data.js";
import { AuthenticationMethod, AuthenticationMethodType } from "./oob.js";
import { ProvisioningCapabilities } from "./provisioning-capabilities.js";
import { BearerDataHandler, BearerHandler } from "../bearer/bearer-handler.js";
import {
  ProvisioningPduType,
  ProvisioningRequest,
  ProvisioningResponse,
} from "./provisioning-pdu.js";
import { areUint8ArraysEqual, concatUint8Arrays } from "uint8array-extras";
import { Node } from "../mesh-models/node.js";
import { Algorithms } from "./algorithm.js";
import { AddressRange } from "../mesh-models/address-range.js";
import { PublicKey, PublicKeyMethod } from "./public-key.js";

/**
 * The handler for receiving provisioning events.
 *
 * The handler must also provide user input during the provisioning process
 * related to Input or Output OOB.
 */
export type ProvisioningHandler = {
  /**
   * called when an authentication action is required
   * from the user.
   *
   * @param action The action to be performed.
   */
  authenticationActionRequired(action: AuthAction): void;

  /**
   * Callback called when the user finished Input Action on the
   * device.
   */
  inputComplete(): void;

  /**
   * Callback called whenever the provisioning status changes.
   *
   * @param unprovisionedDevice The device which state has changed.
   * @param state The completed provisioning state.
   */
  provisioningState(unprovisionedDevice: UnprovisionedDevice, state: ProvisioningState): void;
};

/**
 * The manager responsible for provisioning a new device into the mesh network.
 *
 * To create an instance of a `ProvisioningManager` use `MeshNetworkManager.provisionUnprovisionedDevice()`.
 *
 * Provisioning is initiated by calling `identifyAndAttractFor()`. This method will make the
 * provisioned device to blink, make sound or attract in any supported way, so that the user could
 * verify which device is being provisioned. The target device will return `ProvisioningCapabilities`,
 * returned to `handler` as `ProvisioningState.capabilitiesReceived()`.
 *
 * User needs to set the `unicastAddress` (by default set to `suggestedUnicastAddress`), `networkKey`
 * and call `provision()`. If user interaction is required
 * during provisioning process corresponding delegate callbacks will be invoked.
 *
 * The provisioning is completed when `ProvisioningState.complete` state is returned.
 */
export class ProvisioningManager
  extends BindableTinyEmitter<ProvisioningHandler>
  implements BearerHandler, BearerDataHandler
{
  private unprovisionedDevice: UnprovisionedDevice;
  private bearer: ProvisioningBearer;
  private meshNetwork: MeshNetwork;
  private bearerHandlersOffHandle?: () => void;

  private authenticationMethod?: AuthenticationMethod;
  private authAction?: AuthAction;
  private provisioningData?: ProvisioningData;

  /**
   * The Unicast Address that will be assigned to the device.
   * After device capabilities are received, the address is automatically set to
   * the first available unicast address from Provisioner's range.
   */
  public unicastAddress?: Address;
  private $suggestedUnicastAddress?: Address;
  /**
   * Automatically assigned Unicast Address. This is the first available
   * Unicast Address from the Provisioner's range with enough free following
   * addresses to be assigned to the device. This value is available after
   * the Provisioning Capabilities have been received and such address was found.
   */
  public get suggestedUnicastAddress(): Address | undefined {
    return this.$suggestedUnicastAddress;
  }
  public $provisioningCapabilities?: ProvisioningCapabilities;
  /**
   * The provisioning capabilities of the device. This information
   * is retrieved from the remote device during identification process.
   */
  public get provisioningCapabilities(): ProvisioningCapabilities | undefined {
    return this.$provisioningCapabilities;
  }
  private set provisioningCapabilities(capabilities: ProvisioningCapabilities | undefined) {
    this.$provisioningCapabilities = capabilities;
  }

  /**
   * The Network Key to be sent to the device during provisioning.
   * Setting this property is mandatory before calling
   * `provision()`.
   */
  public networkKey?: NetworkKey;
  /**
   * The logger handler will be called whenever a new log entry is created.
   */
  public logger?: LoggerHandler;
  private readonly $state: ProvisioningState = ProvisioningState.ready;
  public get state() {
    return this.$state;
  }
  /**
   * The current state of the provisioning process.
   */
  private set state(state: ProvisioningState) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.$state = state;
    if (state.type === ProvisioningStateType.failed) {
      this.logger?.e(LogCategory.provisioning, `${ProvisioningState.toString(state)}`);
    } else {
      this.logger?.i(LogCategory.provisioning, `${ProvisioningState.toString(state)}`);
    }
    this.emit("provisioningState", this.unprovisionedDevice, state);
  }

  /**
   * Returns whether the Unprovisioned Device can be provisioned using this
   * Provisioner Manager.
   *
   * If `identify()` has not been called, and the Provisioning
   * Capabilities are not known, this property returns `undefined`.
   *
   * @returns Whether the device can be provisioned by this manager, that is whether the manager supports at least one of the provisioning algorithms supported by the device.
   */
  public get isDeviceSupported(): boolean | undefined {
    if (this.$provisioningCapabilities === undefined) return;
    const supportedAlgorithms = [
      Algorithms.BTM_ECDH_P256_CMAC_AES128_AES_CCM,
      Algorithms.BTM_ECDH_P256_HMAC_SHA256_AES_CCM,
    ];
    return !this.$provisioningCapabilities.algorithms.isDisjointWithArray(supportedAlgorithms);
  }
  /**
   * Returns whether the Unicast Address can be used to provision the device.
   * The Provisioning Capabilities must be obtained prior to using this property,
   * otherwise the number of device's elements is unknown. Also, the mesh
   * network must have the local Provisioner set.
   */
  public get isUnicastAddressValid(): boolean {
    const provisioner = this.meshNetwork.localProvisioner;
    const capabilities = this.provisioningCapabilities;
    const unicastAddress = this.unicastAddress;
    if (provisioner === undefined || capabilities === undefined || unicastAddress === undefined)
      return false;
    const range = AddressRange.fromAddress(unicastAddress, capabilities.numberOfElements);
    return (
      this.meshNetwork.isAddressRangeAvailable(range) && provisioner.hasAllocatedAddressRange(range)
    );
  }

  /**
   * Creates the Provisioning Manager that will handle provisioning of the
   * Unprovisioned Device over the given Provisioning Bearer.
   *
   * To initiate provisioning process `ProvisioningManager.identify()`
   * method shall be called.
   *
   * @param unprovisionedDevice The device to provision into the network.
   * @param bearer The Bearer used for sending Provisioning PDUs.
   * @param meshNetwork The mesh network to provision the device to.
   */
  public constructor(
    unprovisionedDevice: UnprovisionedDevice,
    bearer: ProvisioningBearer,
    meshNetwork: MeshNetwork,
  ) {
    super();
    this.unprovisionedDevice = unprovisionedDevice;
    this.bearer = bearer;
    this.meshNetwork = meshNetwork;
    this.networkKey = meshNetwork.networkKeys[0];
  }
  /**
   * This method initializes the provisioning of the device.
   *
   * As a result of this method `ProvisioningDelegate.provisioningState()`
   * method will be called with the state `ProvisioningState.capabilitiesReceived()`.
   * If the device is supported, `ProvisioningManager.provision()`
   * shall be called to continue provisioning.
   *
   * @param attentionTimer This value determines for how long (in seconds) the device shall remain attracting human's attention by blinking, flashing, buzzing, etc. The value 0 disables Attention Timer.
   * @returns A `ProvisioningError` | `BearerError` can be returned in case of an error.
   */
  public identify(attentionTimer: UInt8): void | ProvisioningError | BearerError {
    // Does the Bearer support provisioning?
    if (!this.bearer.supports(PduType.provisioningPdu)) {
      this.logger?.e(LogCategory.provisioning, "Bearer does not support provisioning PDU");
      return BearerError.pduTypeNotSupported;
    }

    // Has the provisioning been restarted?
    if (this.state.type === ProvisioningStateType.failed) {
      this.reset();
    }

    // Is the Provisioner Manager in the right state?
    if (this.state.type !== ProvisioningStateType.ready) {
      this.logger?.e(LogCategory.provisioning, "Provisioning manager is in invalid state");
      return ProvisioningError.invalidState;
    }

    // Is the Bearer open?
    if (!this.bearer.isOpen) {
      this.logger?.e(LogCategory.provisioning, "Bearer closed");
      return BearerError.bearerClosed;
    }

    this.bearerHandlersOffHandle = this.bearer.bindAllEvents(this);

    // Initialize provisioning data.
    this.provisioningData = new ProvisioningData();

    this.state = ProvisioningState.requestingCapabilities;
    const provisioningInvite = ProvisioningRequest.invite(attentionTimer);
    this.logger?.v(
      LogCategory.provisioning,
      `Sending ${ProvisioningRequest.toString(provisioningInvite)}`,
    );
    return this.sendAndAccumulateTo(provisioningInvite, this.provisioningData);
  }

  /**
   * Resets the provisioning properties and state.
   */
  public reset() {
    this.authenticationMethod = undefined;
    this.provisioningCapabilities = undefined;
    this.provisioningData = undefined;
    this.state = ProvisioningState.ready;
  }

  public bearerDidOpen(_bearer: Bearer): void {
    // This method will not be called, as bearer.handler is restored
    // when is bearer closed.
  }

  public bearerDidClose(_bearer: Bearer, _error?: Error): void {
    // Restore original delegates.
    if (this.bearerHandlersOffHandle) {
      this.bearerHandlersOffHandle();
      this.bearerHandlersOffHandle = undefined;
    }
    this.reset();
  }

  public bearerDidDeliverData(_bearer: Bearer, data: Data, _type: PduType) {
    // Try parsing the response.
    const response = ProvisioningResponse.fromProvisioningPdu(data);
    if (response instanceof ProvisioningError) {
      this.state = ProvisioningState.failed(response);
      return;
    }
    this.logger?.v(LogCategory.provisioning, `${ProvisioningResponse.toString(response)} received`);

    // Act depending on the current state and the response received.
    switch (true) {
      // Provisioning Capabilities have been received.
      case this.state.type === ProvisioningStateType.requestingCapabilities &&
        response.type === ProvisioningPduType.capabilities: {
        this.provisioningCapabilities = response.capabilities;
        this.provisioningData!.accumulate(data.slice(1));

        // Calculate the Unicast Address automatically based on the
        // elements count.
        const localProvisioner = this.meshNetwork.localProvisioner;
        if (this.unicastAddress === undefined && localProvisioner !== undefined) {
          const count = response.capabilities.numberOfElements;
          this.unicastAddress = this.meshNetwork.nextAvailableUnicastAddressStartingFrom(
            count,
            localProvisioner,
          );
          this.$suggestedUnicastAddress = this.unicastAddress;
        }
        this.state = ProvisioningState.capabilitiesReceived(response.capabilities);
        if (this.unicastAddress === undefined) {
          this.state = ProvisioningState.failed(ProvisioningError.noAddressAvailable);
        }
        break;
      }

      // Device Public Key has been received.
      case this.state.type === ProvisioningStateType.provisioning &&
        response.type === ProvisioningPduType.publicKey: {
        // Errata E16350 added an extra validation whether the received Public Key
        // is different than Provisioner's one.
        if (areUint8ArraysEqual(response.key, this.provisioningData!.provisionerPublicKey)) {
          this.state = ProvisioningState.failed(ProvisioningError.invalidPublicKey);
          return;
        }
        this.provisioningData!.accumulate(data.slice(1));
        const error = this.provisioningData!.provisionerDidObtain(response.key, false);
        try {
          if (error) throw error;
          this.obtainAuthValue();
        } catch (error) {
          this.state = ProvisioningState.failed(error as Error);
        }

        break;
      }

      // The user has performed the Input Action on the device.
      case this.state.type === ProvisioningStateType.provisioning &&
        response.type === ProvisioningPduType.inputComplete:
        this.emit("inputComplete");
        const sizeInBytes = Algorithm.length(this.provisioningData!.algorithm) >> 3;

        switch (this.authAction!.action) {
          case "displayNumber": {
            try {
              const authValue = this.authAction!.value.toBytes(sizeInBytes);
              if (authValue === undefined) throw ProvisioningError.invalidOobValueFormat;
              this.authValueReceived(authValue);
            } catch (error) {
              this.state = ProvisioningState.failed(error as Error);
            }
            break;
          }
          case "displayAlphanumeric": {
            try {
              let authValue = textEncode(this.authAction!.text, "ascii");
              authValue = concatUint8Arrays([
                authValue,
                new Uint8Array(Math.max(0, sizeInBytes - authValue.length)),
              ]);
              this.authValueReceived(authValue);
            } catch (error) {
              this.state = ProvisioningState.failed(error as Error);
            }
            break;
          }
          default:
            // The Input Complete should not be received for other actions.
            break;
        }

        break;

      // The Provisioning Confirmation value has been received.
      case this.state.type === ProvisioningStateType.provisioning &&
        response.type === ProvisioningPduType.confirmation: {
        // Errata E16350 added an extra validation whether the received Confirmation
        // is different than Provisioner's one.
        if (areUint8ArraysEqual(response.data, this.provisioningData!.provisionerConfirmation)) {
          this.state = ProvisioningState.failed(ProvisioningError.confirmationFailed);
          return;
        }
        this.provisioningData!.provisionerDidObtainDeviceConfirmation(response.data);
        try {
          const provisioningRandom = ProvisioningRequest.random(
            this.provisioningData!.provisionerRandom,
          );
          this.logger?.v(
            LogCategory.provisioning,
            `Sending ${ProvisioningRequest.toString(provisioningRandom)}`,
          );
          this.send(provisioningRandom);
        } catch (error) {
          if (error instanceof Error) {
            this.state = ProvisioningState.failed(error);
          }
          this.logger?.e(
            LogCategory.provisioning,
            "Error: failed to send provisioning random: " +
              (error instanceof Error ? error.message : null),
          );
        }

        break;
      }

      // The device Random value has been received. We may now authenticate the device.
      case this.state.type === ProvisioningStateType.provisioning &&
        response.type === ProvisioningPduType.random: {
        this.provisioningData!.provisionerDidObtainDeviceRandom(response.data);
        try {
          const error = this.provisioningData!.validateConfirmation();
          if (error) throw error;
          const encryptedData = ProvisioningRequest.data(
            this.provisioningData!.encryptedProvisioningDataWithMic,
          );
          this.logger?.v(
            LogCategory.provisioning,
            `Sending ${ProvisioningRequest.toString(encryptedData)}`,
          );
          this.send(encryptedData);
        } catch (error) {
          if (error instanceof Error) {
            this.state = ProvisioningState.failed(error);
          }
          this.logger?.e(
            LogCategory.provisioning,
            "Error: failed to send provisioning data: " +
              (error instanceof Error ? error.message : null),
          );
        }
        break;
      }

      // The provisioning process is complete.
      case this.state.type === ProvisioningStateType.provisioning &&
        response.type === ProvisioningPduType.complete: {
        const security = this.provisioningData!.security;
        const deviceKey = this.provisioningData!.deviceKey;
        const n = this.provisioningCapabilities!.numberOfElements;
        const node = Node.forUnprovisionedDevice(
          this.unprovisionedDevice,
          n,
          deviceKey,
          security,
          this.provisioningData!.networkKey,
          this.provisioningData!.unicastAddress,
        );
        // If the node was reprovisioned, remove the old instance.
        this.meshNetwork.removeNodeWithUuid(node.uuid);
        // Now it's safe to add the new Node.
        const error = this.meshNetwork.addNode(node);
        if (error) {
          this.state = ProvisioningState.failed(error);
        } else {
          this.state = ProvisioningState.complete;
        }
        break;
      }

      // The provisioned device sent an error.
      case response.type === ProvisioningPduType.failed:
        this.state = ProvisioningState.failed(ProvisioningError.remoteError(response.error));
        break;

      default:
        this.state = ProvisioningState.failed(ProvisioningError.invalidState);
        break;
    }
  }

  /**
   * method sends the provisioning request to the device
   * over the Bearer specified in the init. Additionally, it
   * adds the request payload to given inputs. Inputs are
   * required in device authorization.
   *
   * @param request The request to be sent.
   * @param inputs  The Provisioning Inputs.
   */
  private sendAndAccumulateTo(request: ProvisioningRequest, data: ProvisioningData) {
    const pdu = ProvisioningRequest.pdu(request);
    // The first byte is the type. We only accumulate payload.
    data.accumulate(pdu.slice(1));
    return this.bearer.send(pdu, PduType.provisioningPdu);
  }

  /**
   * This method sends the provisioning request to the device
   * over the Bearer specified in the init.
   *
   * @param request The request to be sent.
   */
  private send(request: ProvisioningRequest) {
    return this.bearer.sendProvisioningRequest(request);
  }

  /**
   * This method should be called when the OOB value has been received
   * and Auth Value has been calculated.
   *
   * It computes and sends the Provisioner Confirmation to the device.
   *
   * @param value The 16 or 32 byte long Auth Value, depending on the selected algorithm.
   */
  public authValueReceived(value: Data) {
    this.authAction = undefined;
    this.provisioningData!.provisionerDidObtainAuthValue(value);
    try {
      const provisioningConfirmation = ProvisioningRequest.confirmation(
        this.provisioningData!.provisionerConfirmation,
      );
      this.logger?.v(
        LogCategory.provisioning,
        `Sending ${ProvisioningRequest.toString(provisioningConfirmation)}`,
      );
      this.send(provisioningConfirmation);
    } catch (error) {
      if (error instanceof Error) {
        this.state = ProvisioningState.failed(error);
      }
      console.error("Error: failed to send provisioning confirmation: ", error);
    }
  }

  /**
   * This method asks the user to provide a OOB value based on the
   * authentication method specified in the provisioning process.
   *
   * For `AuthenticationMethod.noOob` case, the value is automatically
   * set to 0s.
   *
   * This method will call `authValueReceived()` when the value
   * has been obtained.
   */
  public obtainAuthValue() {
    // The AuthValue is 16 or 32 bytes long, depending on the selected algorithm.
    const sizeInBytes = Algorithm.length(this.provisioningData!.algorithm) >> 3;

    switch (this.authenticationMethod!.type) {
      // For No OOB, the AuthValue is just the byte array filled with 0s.
      case AuthenticationMethodType.noOob:
        const authValue = new Uint8Array(sizeInBytes);
        this.authValueReceived(authValue);
      // TODO: Implement other authentication methods.
    }
  }

  /**
   * This method starts the provisioning of the Unprovisioned Device.
   *
   * `identify()` has to be invoked prior to calling this method to receive
   * the `ProvisioningCapabilities`, which include information regarding supported algorithms,
   * public key method and authentication method.
   *
   * For the provisioning process to be considered `Security.secure`, it is required that
   * the Provisionee's Public Key is provided Out-of-Band using `PublicKey.oobPublicKey()`.
   * The Public Key information should be available in the Unprovisioned Device beacon.
   * If the device does not provide OOB Public Key, `PublicKey.noOobPublicKey` shall
   * be used and the provisioned Node and the Network Key will be considered `Security.insecure`.
   *
   * If a different authentication method than `AuthenticationMethod.noOob` is
   * chosen a `ProvisioningDelegate.authenticationActionRequired()` callback
   * will be called during provisioning to provide the Out-of-Band value in case of
   * `AuthenticationMethod.staticOob` or `AuthenticationMethod.outputOob()`
   * or display it to the user for providing it on the Provisionee in case of
   * `AuthenticationMethod.inputOob()`. In the latter case, an additional
   * `ProvisioningDelegate.inputComplete()` callback will be called when user has finished
   * providing the value.
   *
   * NOTE: Mesh Protocol 1.1 introduced a new, stronger provisioning algorithm ``Algorithm/BTM_ECDH_P256_HMAC_SHA256_AES_CCM``. It is recommended for devices which support it.
   *
   * @throws A `ProvisioningError` can be thrown in case of an error.
   */
  public provision(
    algorithm: Algorithm,
    publicKey: PublicKey,
    authenticationMethod: AuthenticationMethod,
  ) {
    // Is the Provisioner Manager in the right state?
    if (
      this.state.type !== ProvisioningStateType.capabilitiesReceived &&
      this.provisioningCapabilities === undefined
    ) {
      this.logger?.e(LogCategory.provisioning, "Provisioning manager is in invalid state");
      return ProvisioningError.invalidState;
    }

    // Can the Unprovisioned Device be provisioned by this manager?
    if (!this.isDeviceSupported) {
      this.logger?.e(LogCategory.provisioning, "Device not supported");
      return ProvisioningError.unsupportedDevice;
    }

    // Was the Unicast Address specified?
    if (this.unicastAddress === undefined) {
      this.unicastAddress = this.suggestedUnicastAddress;
    }

    if (this.unicastAddress === undefined) {
      this.logger?.e(LogCategory.provisioning, "Unicast Address not specified");
      return ProvisioningError.addressNotSpecified;
    }

    // Ensure the Network Key is set.
    if (this.networkKey === undefined) {
      this.logger?.e(LogCategory.provisioning, "Network Key not specified");
      return ProvisioningError.networkKeyNotSpecified;
    }

    // Is the Bearer open?
    if (!this.bearer.isOpen) {
      this.logger?.e(LogCategory.provisioning, "Bearer closed");
      return BearerError.bearerClosed;
    }

    // Try generating Private and Public Keys. This may fail if the given
    // algorithm is not supported.
    this.provisioningData?.generateKeys(algorithm);

    // If the device's Public Key was obtained OOB, we are now ready to
    // calculate the device's Shared Secret.
    if (publicKey.method === PublicKeyMethod.oobPublicKey) {
      // The OOB Public Key is for sure different than the one randomly generated
      // moment ago. Even if not, it truly has been randomly generated, so it's not
      // an attack.
      const error = this.provisioningData?.provisionerDidObtain(publicKey.key, true);
      if (error) {
        this.state = ProvisioningState.failed(error);
      }
    }

    // Send Provisioning Start request.
    this.state = ProvisioningState.provisioning;
    this.provisioningData?.prepare(this.meshNetwork, this.networkKey, this.unicastAddress);
    const provisioningStart = ProvisioningRequest.start(
      algorithm,
      publicKey.method,
      authenticationMethod,
    );
    this.logger?.v(
      LogCategory.provisioning,
      `Sending ${ProvisioningRequest.toString(provisioningStart)}`,
    );
    this.sendAndAccumulateTo(provisioningStart, this.provisioningData!);
    this.authenticationMethod = authenticationMethod;

    // Send the Public Key of the Provisioner.
    const provisioningPublicKey = ProvisioningRequest.publicKey(
      this.provisioningData!.provisionerPublicKey,
    );
    this.logger?.v(
      LogCategory.provisioning,
      `Sending ${ProvisioningRequest.toString(provisioningPublicKey)}`,
    );
    this.sendAndAccumulateTo(provisioningPublicKey, this.provisioningData!);

    // If the device's Public Key was obtained OOB, we are now ready to
    // authenticate.
    if (publicKey.method === PublicKeyMethod.oobPublicKey) {
      this.provisioningData!.accumulate(publicKey.key);
      this.obtainAuthValue();
    }
  }
}
