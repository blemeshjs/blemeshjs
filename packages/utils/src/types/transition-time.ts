import { StepResolution } from "./step-resolution.js";
import { UInt8, Int32 } from "./number.js";
import { TimeInterval } from "./time-interval.js";

/**
 * This structure represents a time needed to transition from one state to another,
 * for example dimming a light.
 *
 * Internally, it uses steps and step resolution. Thanks to that only some time
 * intervals are possible. Use ``TransitionTime/interval`` to get exact time
 */
export class TransitionTime {
  /**
   * Transition is immediate.
   */
  public static immediate = new TransitionTime(0, StepResolution.hundredsOfMilliseconds);

  /**
   * Returns whether the transition time is known.
   */
  public get isKnown(): boolean {
    return this.steps < 0x3f;
  }

  /**
   * Whether the transition is immediate.
   */
  public get isImmediate(): boolean {
    return this.steps == 0;
  }
  /**
   * Transition Number of Steps, 6-bit value.
   *
   * Value 0 indicates an immediate transition.
   *
   * Value 0x3F means that the value is unknown. The state cannot be
   * set to this value, but an element may report an unknown value if
   * a transition is higher than 0x3E or not determined.
   */
  public steps: UInt8;
  /**
   * The step resolution.
   */
  public stepResolution: StepResolution;

  /**
   * The transition time in milliseconds.
   *
   * `undefined` value represents an unknown time.
   */
  public get milliseconds(): Int32 | undefined {
    if (this.steps === 0x3f) {
      return;
    }
    return StepResolution.toMilliseconds(this.stepResolution, this.steps & 0x3f);
  }
  /**
   *
   * `undefined` value represents an unknown time.
   */
  public get interval(): TimeInterval | undefined {
    if (this.milliseconds === undefined) {
      return;
    }
    return this.milliseconds / 1000.0;
  }

  /**
   * The raw representation of the transition in a mesh message.
   */
  public get rawValue(): UInt8 {
    return (((this.steps & 0x3f) | (this.stepResolution << 6)) & 0xff) >>> 0;
  }

  /**
   * Creates the Transition Time object.
   *
   * Only values of 0x00 through 0x3E shall be used to specify the value
   * of the Transition Number of Steps field.
   *
   * NOTE: Use ``TransitionTime/init()`` to create a Transition Time
   *         representing an unknown time.
   * @param steps Transition Number of Steps, valid values are in
   *                    range 0...62. Value 63 means that the value is
   *                    unknown and the state cannot be set to this value.
   * @param stepResolution The step resolution.
   */
  public constructor(steps: UInt8, stepResolution: StepResolution) {
    this.steps = Math.min(steps, 0x3e);
    this.stepResolution = stepResolution;
  }

  /**
   * Creates the Transition Time object for an unknown time.
   */
  public static unknown() {
    return new TransitionTime(0x3f, StepResolution.hundredsOfMilliseconds);
  }
  /**
   * the Transition Time object for the `TimeInterval`.
   *
   * NOTE: Mind, that the transition time will be converted to steps
   *         and step resolution using rounding. Check implementation
   *         for details.
   *
   * @param interval The transition time in seconds.
   */
  public static fromInterval(interval: TimeInterval) {
    switch (true) {
      case interval <= 0:
        return new TransitionTime(0, StepResolution.hundredsOfMilliseconds);
      case interval <= 62 * 0.1:
        return new TransitionTime(interval * 10, StepResolution.hundredsOfMilliseconds);
      case interval <= 62:
        return new TransitionTime(interval, StepResolution.seconds);
      case interval <= 62 * 10.0:
        return new TransitionTime(interval / 10.0, StepResolution.tensOfSeconds);
      case interval <= 62 * 10 * 60.0:
        return new TransitionTime(interval / (10 * 60.0), StepResolution.tensOfMinutes);
      default:
        return new TransitionTime(0x3e, StepResolution.tensOfMinutes);
    }
  }
  public static fromRawValue(rawValue: UInt8) {
    return new TransitionTime(rawValue & 0x3f, rawValue >> 6);
  }
  /**
   * Returns this Transition Time value, if it's known, or
   * the default value. If default value is `nil`, instantaneous
   * transition is returned.
   *
   * @param defaultTransitionTime The optional default value of the transition time.
   */
  public or(defaultTransitionTime?: TransitionTime): TransitionTime {
    switch (true) {
      case this && this.isKnown:
        return this;

      default:
        return defaultTransitionTime ?? TransitionTime.immediate;
    }
  }

  public toString(): string {
    if (!this.isKnown) {
      return "Unknown";
    }
    if (this.isImmediate) {
      return "Immediate";
    }

    switch (this.stepResolution) {
      case StepResolution.hundredsOfMilliseconds:
        if (this.steps < 10) {
          return `${this.steps * 100} ms`;
        } else if (this.steps === 10) {
          return "1 sec";
        } else {
          return `${Math.floor(this.steps / 10)}.${this.steps % 10} sec`;
        }
      case StepResolution.seconds:
        if (this.steps < 60) {
          return `${this.steps} sec`;
        } else if (this.steps === 60) {
          return "1 min";
        } else {
          return `1 min ${this.steps - 60} sec`;
        }
      case StepResolution.tensOfSeconds:
        if (this.steps < 6) {
          return `${this.steps * 10} sec`;
        } else if (this.steps % 6 === 0) {
          return `${Math.floor(this.steps / 6)} min`;
        } else {
          return `${Math.floor(this.steps / 6)} min ${(this.steps % 6) * 10} sec`;
        }
      case StepResolution.tensOfMinutes:
        if (this.steps < 6) {
          return `${this.steps * 10} min`;
        } else if (this.steps % 6 === 0) {
          return `${Math.floor(this.steps / 6)} h`;
        } else {
          return `${Math.floor(this.steps / 6)} h ${(this.steps % 6) * 10} min`;
        }
      default:
        return "Unknown";
    }
  }
}
