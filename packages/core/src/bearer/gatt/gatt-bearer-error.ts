/**
 * Set of errors that may be thrown from the GATT bearer.
 */
export class GattBearerError extends Error {
  /**
   * The connected device does not have services required
   * by the Bearer.
   */
  public static deviceNotSupported = new GattBearerError("Device not supported");

  private constructor(message: string) {
    super(message);
    this.name = "GattBearerError";
  }
}
