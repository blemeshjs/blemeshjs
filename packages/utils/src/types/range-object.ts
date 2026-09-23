import { ClosedRange } from "./closed-range.js";
import { Int64, UInt16 } from "./number.js";

/**
 * A base class for an address or scene range.
 *
 * Ranges are assigned to `Provisioner` objects. Each Provisioner
 * may provision new Nodes, create Groups and Scenes using only values
 * from assigned ranges. The assigned ranges may not overlap with the ranges
 * of other Provisioners, otherwise different instances could reuse the same
 * values leading to collisions.
 */
// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
export class RangeObject<T extends Number = UInt16> {
  private $range: ClosedRange<T>;
  public get range(): ClosedRange<T> {
    return this.$range;
  }

  /** Lower bound of the range. */
  public get lowerBound(): T {
    return this.$range.lowerBound;
  }

  /** Upper bound of the range. */
  public get upperBound(): T {
    return this.$range.upperBound;
  }

  /** Number of elements in the range. */
  public get count(): Int64 {
    return this.$range.length!;
  }

  constructor(range: ClosedRange<T>) {
    this.$range = range;
  }
  /**
   * Returns whether the given value is in the range.
   *
   * @param value The value to be checked.
   * @returns `True` if the value is inside the range, `false` otherwise.
   */
  public contains(value: T): boolean {
    return this.range.contains(value);
  }
  /**
   * Returns whether the given range is within the range.
   *
   * @param range The range to be checked.
   * @returns `True` if the range is within the range, `false` otherwise.
   */
  public containsRange(range: RangeObject<T>): boolean {
    return this.contains(range.lowerBound) && this.contains(range.upperBound);
  }
  /**
   * Returns a Boolean value indicating whether this range and the given
   * range contain a common element.
   *
   * @param other A range to check for elements in common.
   * @returns `True` if this range and other have at least one element in common; otherwise, `false`.
   */
  public overlaps(other: RangeObject<T>): boolean {
    return this.range.overlaps(other.range);
  }
}
