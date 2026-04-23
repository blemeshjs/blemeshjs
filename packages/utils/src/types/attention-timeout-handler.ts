import { TimeInterval } from "./time-interval.js";

/**
 * An Attention Timer Handler is used to notify the app about the Attention Timer state.
 *
 * The Attention Timer is used to attract the user's attention to the device.
 *
 * It may only be started and stopped by sending a `HealthAttentionSet` or
 * `HealthAttentionSetUnacknowledged` message to the main Element
 * of the local Node.
 */
export abstract class AttentionTimerHandler {
  /**
   * A callback called when the Attention Timer state has been started.
   *
   * The app should start attracting the user's attention.
   *
   * @param duration The time after which the Attention Timer will time out, in range 1-255 seconds.
   */
  public abstract attentionTimerDidStart(duration: TimeInterval): void;

  /**
   * A callback called when the Attention Timer state has been stopped.
   *
   * This callback is called when the Attention Timer times out, or is stopped
   * remotely by a remote user.
   */
  public abstract attentionTimerDidStop(): void;
}
