import { Int32, UInt8 } from "./number.js";

/**
 * The Step Resolution field enumerates the resolution of the Number of Steps field
 * in `TransitionTime` or `Period`.
 */
export enum StepResolution {
  /**
   * The Step Resolution is 100 milliseconds.
   */
  hundredsOfMilliseconds = 0b00,
  /**
   * The Step Resolution is 1 second.
   */
  seconds = 0b01,
  /**
   * The Step Resolution is 10 seconds.
   */
  tensOfSeconds = 0b10,
  /**
   * The Step Resolution is 10 minutes.
   */
  tensOfMinutes = 0b11,
}

export namespace StepResolution {
  export const fromResolution = (resolution: Int32): StepResolution | undefined => {
    switch (resolution) {
      case 100:
        return StepResolution.hundredsOfMilliseconds;
      case 1000:
        return StepResolution.seconds;
      case 10000:
        return StepResolution.tensOfSeconds;
      case 600000:
        return StepResolution.tensOfMinutes;
      default:
        return undefined; // Unknown resolution
    }
  };

  /**
   * Converts the steps to milliseconds using the step resolution.
   */
  export const toMilliseconds = (resolution: StepResolution, steps: UInt8): Int32 => {
    switch (resolution) {
      case StepResolution.hundredsOfMilliseconds:
        return steps * 100;
      case StepResolution.seconds:
        return steps * 1000;
      case StepResolution.tensOfSeconds:
        return steps * 10000;
      case StepResolution.tensOfMinutes:
        return steps * 600000;
      default:
        return steps * 100; // Fallback to hundreds of milliseconds
    }
  };

  export const toString = (resolution: StepResolution): string => {
    switch (resolution) {
      case StepResolution.hundredsOfMilliseconds:
        return "100 milliseconds";
      case StepResolution.seconds:
        return "1 second";
      case StepResolution.tensOfSeconds:
        return "10 seconds";
      case StepResolution.tensOfMinutes:
        return "10 minutes";
      default:
        return `Unknown Step Resolution: ${resolution}`;
    }
  };
}
