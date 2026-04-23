import { UInt32, MeshMessage, Address } from "@mesh-link-js/utils";
import { MeshAddress } from "./mesh-address.js";

type NetworkManager = {
  cancelMessageWithHandler: (handler: MessageHandle) => Promise<void>;
};

export class MessageHandle {
  public manager: NetworkManager;

  /**
   * The Op Code of the message.
   */
  public opCode: UInt32;
  /**
   * The source Unicast Address.
   */
  public source: Address;
  /**
   * The destination Address.
   *
   * This can be any type of Address.
   */
  public destination: MeshAddress;

  constructor(
    message: MeshMessage,
    source: Address,
    destination: MeshAddress,
    manager: NetworkManager,
  ) {
    this.opCode = message.opCode;
    this.source = source;
    this.destination = destination;
    this.manager = manager;
  }

  /**
   * Cancels sending the message.
   *
   * Only segmented or acknowledged messages may be cancelled.
   *
   * Unsegmented unacknowledged messages are sent almost instantaneously
   * (depending on the connection interval and message size)
   * and therefore cannot be cancelled.
   */
  public async cancel() {
    await this.manager?.cancelMessageWithHandler(this);
  }
}
