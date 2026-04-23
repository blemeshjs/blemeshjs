import Long from "long";
import { Int64 } from "./number.js";

export class ClosedRange<T> {
  readonly lowerBound: T;
  readonly upperBound: T;
  private readonly comparator: (a: T, b: T) => number;

  /** Length of range: (upper - lower + 1) for number types */
  get length(): Int64 | undefined {
    if (typeof this.lowerBound === "number" && typeof this.upperBound === "number") {
      return Long.fromNumber((this.upperBound as number) - (this.lowerBound as number) + 1);
    }
    return undefined;
  }

  constructor(lower: T, upper: T, comparator?: (a: T, b: T) => number) {
    if (comparator) {
      if (comparator(lower, upper) > 0) {
        throw new Error(`Invalid range: lower > upper`);
      }
    } else {
      // Assume number or string
      if ((lower as number) > (upper as number)) {
        throw new Error(`Invalid range: lower > upper`);
      }
    }

    this.lowerBound = lower;
    this.upperBound = upper;
    this.comparator = comparator ?? ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  contains(value: T): boolean {
    return (
      this.comparator(value, this.lowerBound) >= 0 && this.comparator(value, this.upperBound) <= 0
    );
  }

  overlaps(other: ClosedRange<T>): boolean {
    const cmp = this.comparator;
    return (
      cmp(this.lowerBound, other.upperBound) <= 0 && cmp(other.lowerBound, this.upperBound) <= 0
    );
  }

  forEach(callback: (value: T) => void): void {
    if (typeof this.lowerBound === "number") {
      for (let i = this.lowerBound as number; i <= (this.upperBound as number); i++) {
        callback(i as unknown as T);
      }
    } else {
      throw new Error("forEach only supports number ranges");
    }
  }

  toString(): string {
    return `${this.lowerBound}...${this.upperBound}`;
  }
}
