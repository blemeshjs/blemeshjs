import { isNumber } from "../helpers/index.js";
import { UInt16 } from "../types/index.js";

/**
 * Scene number enum type.
 *
 * @see UInt16
 *
 */
export class SceneNumber extends Number {
  public static invalidScene = new SceneNumber(0x0000);
  public static minScene = new SceneNumber(0x0001);
  public static maxScene = new SceneNumber(0xffff);

  public get hex(): string {
    return this.valueOf().toString(16).padStart(4, "0").toUpperCase();
  }
  static fromHex(hex: string): SceneNumber | undefined {
    if (hex.length !== 4) return undefined;
    const value = parseInt(hex, 16);
    if (!isNumber(value)) {
      return undefined;
    }
    return new SceneNumber(value);
  }

  public constructor(value: UInt16) {
    super(value);
  }
  /**
   * Returns `true` if the scene number is valid.
   *
   * Valid scenes have numbers from `minScene` to `maxScene`.
   * @returns `true` if the scene number is valid, `false` otherwise.
   */
  public get isValidSceneNumber(): boolean {
    return SceneNumber.invalidScene.valueOf() !== this.valueOf();
  }
}
