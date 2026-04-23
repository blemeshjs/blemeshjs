/**
 * Set of errors that may be thrown from the bearer.
 */
export class BearerError extends Error {
  /**
   * Thrown when the Central Manager is not in ON state.
   */
  public static centralManagerNotPoweredOn = new BearerError("Central Manager not powered on.");
  /**
   * Thrown when the given PDU type is not supported
   * by the Bearer.
   */
  public static pduTypeNotSupported = new BearerError("PDU type not supported.");
  /**
   * Thrown when the Bearer is not ready to send data.
   */
  public static bearerClosed = new BearerError("The bearer is closed.");
  /**
   * Thrown when the Bearer is busy and cannot send new message at that moment.
   */
  public static busy = new BearerError("The bearer is busy.");

  private constructor(message: string) {
    super(message);
  }
}
