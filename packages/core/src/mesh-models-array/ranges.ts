import { AddressRange, SceneRange } from "../mesh-models/index.js";
import { ClosedRange, RangeObject } from "@blemeshjs/utils";

/**
 * Returns `true` if all the address ranges are valid. Valid address ranges
 * are in Unicast or Group ranges.
 *
 * @param ranges An array of address ranges to check.
 * @returns `True` if the all address ranges are in Unicast or Group range, `false` otherwise.
 */
export const isValidRanges = (ranges: Array<AddressRange | SceneRange>): boolean => {
  return !ranges.some((range) => !range.isValid);
};

/**
 * Returns `true` if all the address ranges are of unicast type.
 *
 * @param ranges An array of address ranges to check.
 * @returns `True` if the all address ranges are of unicast type, `false` otherwise.
 */
export const isUnicastRanges = (ranges: Array<AddressRange>): boolean => {
  return !ranges.some((range) => !range.isUnicastRange);
};

/**
 * Returns `true` if all the address ranges are of group type.
 *
 * @param ranges An array of address ranges to check.
 * @returns `True` if the all address ranges are of group type, `false` otherwise.
 */
export const isGroupRanges = (ranges: Array<AddressRange>): boolean => {
  return !ranges.some((range) => !range.isGroupRange);
};

function extractConstructor<T>(arr: T[]): (new (...args: unknown[]) => T) | undefined {
  if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === "object" && arr[0] !== null) {
    return arr[0].constructor as new (...args: unknown[]) => T;
  }
  return undefined;
}

/**
 * Returns a sorted array of ranges. If any ranges were overlapping, they
 * will be merged.
 *
 * @param ranges An array of address ranges to merge.
 * @returns Sorted array of ranges with all overlapping ranges merged.
 */
// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
export const mergedRanges = <K extends Number, T extends RangeObject<K>>(
  ranges: Array<T>,
): Array<T> => {
  if (ranges.length <= 1) {
    return ranges;
  }
  // We have to get the type from the first object, otherwise the result
  // array would be [RangeObject] instead of [AddressRange] or [SceneRange].
  const RangeType = extractConstructor(ranges);

  if (RangeType === undefined) return [];

  const result: Array<T> = [];

  let accumulator!: T;

  for (const range of ranges.sort(
    (a, b) => a.range.lowerBound.valueOf() - b.range.lowerBound.valueOf(),
  )) {
    // Analyzing first range? Set it as the accumulator.
    if (typeof accumulator === "undefined") {
      accumulator = range;
    }

    // Is the range already in accumulator's range?
    if (accumulator.range.upperBound >= range.range.upperBound) {
      // Do nothing.
    }

    // Does the range start inside the accumulator, or just after the accumulator?
    else if (accumulator.range.upperBound.valueOf() + 1 >= range.range.lowerBound.valueOf()) {
      // Set the accumulator as merged range.
      accumulator = new RangeType(
        new ClosedRange(accumulator.range.lowerBound, range.range.upperBound),
      );
    }

    // There must have been a gap, the accumulator can be appended to result array.
    /* if accumulator.range.upperBound < range.range.lowerBound */
    else {
      result.push(accumulator);
      // Initialize the new accumulator as the new range.
      accumulator = range;
    }
  }

  // Add the last accumulator if it was set above.
  if (typeof accumulator !== "undefined") {
    result.push(accumulator);
  }

  return result;
};
/**
 * Returns whether the range is within any of the ranges in this array.
 *
 * @param ranges An array of address ranges to check.
 * @param range The range to be checked.
 * @returns `True` if the range is within the range array, `false` otherwise.
 */
// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
export function rangesContains<E extends Number>(
  ranges: Array<RangeObject<E>>,
  range: RangeObject<E>,
): boolean {
  return ranges.some(($range) => $range.containsRange(range));
}
