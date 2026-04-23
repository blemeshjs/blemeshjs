/**
 * A set of errors originating from the access layer.
 */
export class AccessError extends Error {
  /**
   * Error thrown when the local Provisioner does not have
   * a Unicast Address specified and is not able to send
   * requested message.
   */
  public static invalidSource = new AccessError(
    "Local Provisioner does not have Unicast Address specified.",
  );
  /**
   * Thrown when trying to send a message using an Element
   * that does not belong to the local Provisioner's Node.
   */
  public static invalidElement = new AccessError("Element does not belong to the local Node.");
  /**
   * Thrown when the given TTL is not valid. Valid TTL must
   * be 0 or in range 2...127.
   */
  public static invalidTtl = new AccessError("Invalid TTL.");
  /**
   * Thrown when the destination Address is not known and the
   * library cannot determine the Network Key to use.
   */
  public static invalidDestination = new AccessError(
    "The destination address is invalid or unknown.",
  );
  /**
   * Thrown when the target Node cannot decrypt messages
   * sent with the given key.
   */
  public static invalidKey = new AccessError(
    "The target Node cannot decrypt messages sent with the specified key.",
  );
  /**
   * Thrown when trying to send a message from a Model that
   * does not have any Application Key bound to it.
   */
  public static modelNotBoundToAppKey = new AccessError(
    "No Application Key bound to the given Model.",
  );
  /**
   * Thrown when trying to send a config message to a Node of
   * which the Device Key is not known.
   */
  public static noDeviceKey = new AccessError("Unknown Device Key.");
  /**
   * Thrown when a message is sent that is encrypted with a Network Key
   * that is not known to the connected GATT Proxy, or no GATT Proxy is
   * connected.
   */
  public static cannotRelay = new AccessError(
    "No GATT Proxy Node is connected or the connected Proxy does not know the Network Key used to secure this message.",
  );
  /**
   * Error thrown when the Provisioner is trying to delete
   * the last Network Key from the Node, or a key that is used
   * to secure the message.
   */
  public static cannotDelete = new AccessError(
    "Cannot delete the last Network Key or a key used to secure the message.",
  );
  /**
   * Error thrown when trying to send a message to an address
   * for which another message is already being sent.
   */
  public static busy = new AccessError(
    "Unable to send a message to specified address. Another transfer in progress.",
  );
  /**
   * Thrown, when the acknowledgment has not been received until
   * the time run out.
   */
  public static timeout = new AccessError("Request timed out.");
  /**
   * Thrown when sending the message was cancelled.
   */
  public static cancelled = new AccessError("Message cancelled.");

  private constructor(message: string) {
    super(message);
    this.name = "AccessError";
  }
}
