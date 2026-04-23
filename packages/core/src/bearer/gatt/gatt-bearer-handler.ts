import { Int64 } from "@mesh-link-js/utils";
import { BearerHandler } from "../bearer-handler.js";
import { Bearer } from "../bearer.js";

/**
 * This class extends `BearerHandler` and adds GATT specific
 * event handlers.
 */
export abstract class GattBearerHandler extends BearerHandler {
  /**
   * Callback called when the GATT device has connected.
   *
   * @param bearer The Bearer.
   */
  public abstract bearerDidConnect(bearer: Bearer): void;

  /**
   * Callback called when the services of the GATT device
   * have been discovered.
   *
   * @param bearer The Bearer.
   */
  public abstract bearerDidDiscoverServices(bearer: Bearer): void;

  /**
   * Callback called periodically when a RSSI value to the
   * GATT Bearer has been obtained.
   *
   * @param bearer The Bearer.
   * @param RSSI The Received Signal Strength Indication value, from -127 to around 4.
   */
  public abstract bearerDidReadRSSI(bearer: Bearer, RSSI: Int64): void;
}
