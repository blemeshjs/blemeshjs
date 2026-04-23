import { UInt32, UInt8 } from "../types/number.js";

export class IvIndex {
  public static indexKey = "IVIndex";
  public static timestampKey = "IVTimestamp";
  public static ivRecoveryKey = "IVRecovery";
  /**
   * The IV Index used for transmitting messages.
   */
  public get transmitIndex(): UInt32 {
    return this.updateActive && this.index > 0 ? this.index - 1 : this.index;
  }

  /**
   * The previous IV Index, or `undefined` in case of an initial one.
   */
  public get previous(): IvIndex | undefined {
    return !this.updateActive
      ? new IvIndex(this.index, true)
      : this.index > 0
        ? new IvIndex(this.index - 1, false)
        : undefined;
  }

  constructor(
    public index: UInt32 = 0,
    public updateActive: boolean = false,
  ) {}

  /**
   * The IV Index that is to be used for decrypting messages.
   *
   * @param ivi The IVI bit of the received Network PDU.
   * @returns The IV Index to be used to decrypt the message.
   */
  public indexFor(ivi: UInt8): UInt32 {
    return ivi === (this.index & 1) ? this.index : Math.max(1, this.index - 1);
  }

  public equals(other: unknown): boolean {
    if (!(other instanceof IvIndex)) return false;
    return this.index === other.index && this.updateActive === other.updateActive;
  }

  public lt(other: unknown): boolean {
    if (!(other instanceof IvIndex)) return false;
    return (
      this.index < other.index ||
      (this.index === other.index && this.updateActive && !other.updateActive)
    );
  }
  /**
   * Creates the IV Index from the given dictionary. It must be valid, otherwise `nil` is returned.
   *
   * @param map The dictionary with IV Index.
   * @returns The IV Index object or `undefined`.
   */
  public static fromMap(map?: Record<string, unknown>): IvIndex | undefined {
    try {
      if (map === null || typeof map === "undefined") return;
      const index: UInt32 = map["index"] as number;
      const updateActive = Boolean(map["updateActive"]);
      return new IvIndex(index, updateActive);
    } catch (error) {
      console.error("Invalid IV Index map:", error);
      return undefined;
    }
  }

  /**
   * Returns the IV Index as dictionary.
   */
  public get asMap(): Record<string, unknown> {
    return { index: this.index, updateActive: this.updateActive };
  }
  public toString(): string {
    return `IV Index: ${this.index} (${this.updateActive ? "update active" : "normal operation"})`;
  }
}
