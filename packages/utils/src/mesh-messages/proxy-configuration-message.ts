import { BaseMeshMessage } from "./mesh-message.js";
import { Mixin } from "ts-mixer";
import { UInt8 } from "../types/index.js";

/**
 * A base class for Proxy configuration messages.
 */
export abstract class ProxyConfigurationMessage extends BaseMeshMessage {
  /**
   * The message Op Code.
   */
  public abstract get opCode(): UInt8;
}

/**
 * A type of Proxy Configuration message which opcode is known
 * during compilation time.
 */
export abstract class StaticProxyConfigurationMessage extends ProxyConfigurationMessage {
  /**
   * The message Op Code.
   */
  public static opCode: UInt8;
}
/**
 * A base class for acknowledged proxy configuration messages.
 *
 * An acknowledged message is transmitted and acknowledged by each
 * receiving element by responding to that message. The response is
 * typically a status message. If a response is not received within
 * an arbitrary time period, the message will be retransmitted
 * automatically until the timeout occurs.
 */
export abstract class AcknowledgedProxyConfigurationMessage extends ProxyConfigurationMessage {
  /**
   * The Op Code of the response message.
   */
  public abstract get responseOpCode(): UInt8;
}
/**
 * A base class static acknowledged proxy configuration messages.
 */
export abstract class StaticAcknowledgedProxyConfigurationMessage extends Mixin(
  AcknowledgedProxyConfigurationMessage,
  StaticProxyConfigurationMessage,
) {
  /**
   * The Type of the response message.
   */
  public static responseType: typeof StaticProxyConfigurationMessage;

  public get responseOpCode(): UInt8 {
    return StaticAcknowledgedProxyConfigurationMessage.responseType.opCode;
  }
}
