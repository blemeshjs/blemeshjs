/**
 * A set of errors thrown from the transport layer.
 */
export class LowerTransportError extends Error {
  /**
   * The segmented message has not been acknowledged before the timeout occurred.
   */
  public static timeout = new LowerTransportError("Request timed out.");
  /**
   * Sending segmented messages was cancelled.
   */
  public static cancelled = new LowerTransportError("Message cancelled.");
  /**
   * The target device is busy at the moment and could not accept the message.
   */
  public static busy = new LowerTransportError("Node is busy. Try later.");

  public constructor(message: string) {
    super(message);
    this.name = "LowerTransportError";
  }
}
