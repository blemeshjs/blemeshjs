import { Data } from "@mesh-link-js/utils";
import { Bearer, PduType } from "./bearer.js";

/**
 * A bearer data handler processes mesh messages received by the bearer.
 */
export abstract class BearerDataHandler<T extends Bearer = Bearer> {
  /**
   * Callback called when a packet has been received using the Bearer.
   * Data longer than MTU will automatically be reassembled
   * using the bearer protocol if bearer implements segmentation.
   *
   *  @param bearer The Bearer on which the data were received.
   *  @param data The data received.
   * @param type The type of the received data.
   */
  public abstract bearerDidDeliverData(bearer: T, data: Data, type: PduType): void;
}

/**
 * The bearer handler will receive events when the bearer has been opened
 * or closed.
 */
export abstract class BearerHandler<T extends Bearer = Bearer> {
  /**
   * Callback called when the Bearer is ready for use.
   *
   * @param bearer The Bearer.
   */
  public abstract bearerDidOpen(bearer: T): void;

  /**
   * Callback called when the Bearer is no longer open.
   *
   * @param bearer The Bearer.
   * @param error The reason of closing the Bearer, or `undefined` if closing was intended.
   */
  public abstract bearerDidClose(bearer: T, error?: Error): void;
}
