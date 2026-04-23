/**
 * Abstract base class for transport implementations.
 * Provides a static method to retrieve the advertisement data service data key.
 */
export abstract class Transport {
  /**
   * Returns the advertisement data service data key for the transport.
   * Subclasses should override this method to provide the appropriate key.
   * @throws Error if not implemented by the subclass.
   */
  public static get AdvertisementDataServiceDataKey(): string {
    throw new Error(
      "Getting advertisement data service data key is not implemented for this transport.",
    );
  }
}
