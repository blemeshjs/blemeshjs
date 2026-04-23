import { Clazz, createModelSchema, custom } from "serializr";
import { TimeInterval, UInt16, UInt8 } from "../types/index.js";
import { Address } from "../constants/index.js";

abstract class State {
  /**
   * The timestamp at which the subscription was started.
   */
  protected abstract startDate: number;
  /**
   * The Heartbeat Subscription Count state is a 16-bit counter that controls
   * the number of periodical Heartbeat transport control messages received
   * since receiving the most recent Config Heartbeat Subscription Set message.
   * The counter stops counting at 0xFFFF.
   */
  public abstract count: UInt16;
  /**
   * The Heartbeat Subscription Min Hops state determines the minimum hops value
   * registered when receiving Heartbeat messages since receiving the most recent
   * Config Heartbeat Subscription Set message.
   */
  public abstract minHops: UInt8;
  /**
   * The Heartbeat Subscription Max Hops state determines the maximum hops value
   * registered when receiving Heartbeat messages since receiving the most recent
   * Config Heartbeat Subscription Set message.
   */
  public abstract maxHops: UInt8;
  /**
   * The Heartbeat Subscription Period state controls the duration for processing
   * Heartbeat transport control messages. When set to 0x0000, Heartbeat messages
   * are not processed. When set to a value greater than or equal to 0x0001,
   * Heartbeat messages are processed.
   */
  protected abstract period: TimeInterval;
  /**
   * The Heartbeat Subscription Period Log is a representation of the Heartbeat
   * Subscription Period state value. The Heartbeat Subscription Period Log and
   * Heartbeat Subscription Period with the value 0x00 and 0x0000 are equivalent.
   * The Heartbeat Subscription Period Log value between 0x01 and 0x11 shall
   * represent the Heartbeat Subscription Period value
   */
  public abstract get periodLog(): UInt8;
}

export abstract class HeartbeatSubscription {
  /**
   * The source address for the Heartbeat messages.
   *
   * It must be a Unicast Address.
   */
  public abstract source: Address;

  /**
   * The destination address for the Heartbeat messages.
   *
   * It can be either a Group or Unicast Address.
   */
  public abstract destination: Address;

  /**
   * The state contains variables used for handling Heartbeat messages received
   * by the local Node.
   */
  public abstract state: State | undefined;

  /**
   * Returns whether the subscription is enabled, or not.
   *
   * Subscription gets disabled when the specified period times out.
   */
  public abstract get isEnabled(): boolean;

  /**
   * Returns whether the received Heartbeat message matches subscription parameters.
   *
   * @param heartbeat The received Heartbeat message.
   * @returns True, if Heartbeat message matches the subscription; false otherwise.
   */
  public abstract matches<T>(heartbeat: T): boolean;

  /**
   * Updates the counter based on received Heartbeat message.
   *
   * @param heartbeat The received Heartbeat message.
   */
  public abstract updateIfMatches<T>(heartbeat: T): void;

  /**
   * Converts Subscription Period to Subscription Period Log.
   *
   * @param remainingPeriod The remaining period, as `TimeInterval`.
   * @returns The logarithmic value.
   */
  public static remainingPeriod2Period(remainingPeriod: TimeInterval): UInt8 {
    switch (true) {
      case remainingPeriod === 0:
        // Periodic Heartbeat messages are not published.
        return 0x00;
      case remainingPeriod >= 0xffff:
        // Maximum value.
        return 0x11;
      default:
        return Math.log2(remainingPeriod) + 1;
    }
  }

  /**
   * Converts Subscription Period Log to Subscription Period.
   *
   * @param periodLog The logarithmic value in range 0x00...0x11.
   * @returns The value.
   */
  public static periodLog2Period(periodLog: UInt8): UInt16 {
    switch (true) {
      case periodLog === 0x00:
        // Periodic Heartbeat messages are not published.
        return 0x0000;
      case periodLog >= 0x01 && periodLog <= 0x10:
        // Period = 2^(n-1) seconds.
        return Math.pow(2.0, periodLog - 1);
      case periodLog === 0x11:
        // Maximum value.
        return 0xffff;
      default:
        // NOTE: fatal error so shouldn't happen
        throw new Error(`PeriodLog out or range: ${periodLog} (required: 0x00-0x11)`);
    }
  }
}

createModelSchema(HeartbeatSubscription as unknown as Clazz<object>, {
  source: custom(
    (v: Address) => v.hex,
    (v: string) => v,
  ),
  destination: custom(
    (v: Address) => v.hex,
    (v: string) => v,
  ),
});
