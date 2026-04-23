import { Int32 } from "../types/number.js";

export function chunkedMap<T>(map: Map<string, T>, maxSize: Int32): Array<Map<string, T>> {
  const result: Array<Map<string, T>> = [];
  let current: Map<string, T> = new Map();
  for (const [key, value] of map.entries()) {
    if (maxSize === current.size) {
      result.push(current);
      current = new Map();
    }
    current.set(key, value);
  }
  result.push(current);
  return result;
}
