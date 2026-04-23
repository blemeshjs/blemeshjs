import { Data } from "./buffer.js";
import { Int32 } from "./number.js";

export class OptionSet<F extends number> {
  private readonly $value: number;

  constructor(value: number = 0) {
    this.$value = value;
  }

  static empty<F extends number>() {
    return new this<F>(0);
  }

  static fromData<F extends number>(data: Data, offset: Int32) {
    return new this<F>(data[offset]);
  }

  get rawValue(): number {
    return this.$value;
  }

  contains(flag: F): boolean {
    return (this.$value & flag) !== 0;
  }

  insert(flag: F): OptionSet<F> {
    return new OptionSet<F>(this.$value | flag);
  }

  remove(flag: F): OptionSet<F> {
    return new OptionSet<F>(this.$value & ~flag);
  }

  toggle(flag: F): OptionSet<F> {
    return new OptionSet<F>(this.$value ^ flag);
  }

  union(other: OptionSet<F>): OptionSet<F> {
    return new OptionSet<F>(this.$value | other.$value);
  }

  subtract(other: OptionSet<F>): OptionSet<F> {
    return new OptionSet<F>(this.$value & ~other.$value);
  }

  intersect(other: OptionSet<F>): OptionSet<F> {
    return new OptionSet<F>(this.$value & other.$value);
  }

  equals(other: OptionSet<F>): boolean {
    return this.$value === other.$value;
  }

  isDisjoint(other: OptionSet<F>): boolean {
    return (this.$value & other.$value) === 0;
  }

  toString(): string {
    return `OptionSet(${this.$value})`;
  }

  isDisjointWithArray(others: Array<OptionSet<F>>): boolean {
    for (const other of others) {
      if ((this.$value & other.$value) !== 0) {
        return false;
      }
    }
    return true;
  }
}
