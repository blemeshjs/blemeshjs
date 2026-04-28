import { ClosedRange, DecodingError, RangeObject, MeshCDB, SceneNumber } from "@blemeshjs/utils";
import { z } from "zod";
import { createModelSchema, custom } from "serializr";

const SceneRangeSchema = z
  .object({
    firstScene: MeshCDB.Identifier,
    lastScene: MeshCDB.Identifier,
  })
  .strict();

/**
 * The range of `SceneNumber`s assigned to a `Provisioner`.
 */
export class SceneRange extends RangeObject<SceneNumber> {
  /**
   * A range containing all valid Scene Numbers.
   */
  public static allScenes: SceneRange = new SceneRange(
    new ClosedRange<SceneNumber>(SceneNumber.minScene, SceneNumber.maxScene),
  );
  /**
   * The first Scene Number of the range.
   */
  public get firstScene(): SceneNumber {
    return this.range.lowerBound;
  }

  /**
   * The last Scene Number of the range.
   */
  public get lastScene(): SceneNumber {
    return this.range.upperBound;
  }

  /**
   * Returns `true` if the scene range is valid.
   *
   * @returns `True` if the scene range is valid, `false` otherwise.
   */
  public get isValid(): boolean {
    return this.firstScene.isValidSceneNumber && this.lastScene.isValidSceneNumber;
  }
  public static decode(jv: Record<string, unknown>) {
    const parsed = SceneRangeSchema.parse(jv);

    const firstScene = SceneNumber.fromHex(parsed.firstScene);
    if (typeof firstScene === "undefined") {
      throw new DecodingError("Scene must be 4-character hexadecimal string.");
    }
    const lastScene = SceneNumber.fromHex(parsed.lastScene);
    if (typeof lastScene === "undefined") {
      throw new DecodingError("Scene must be 4-character hexadecimal string.");
    }
    return new SceneRange(new ClosedRange<SceneNumber>(firstScene, lastScene));
  }
}

createModelSchema(SceneRange, {
  firstScene: custom(
    (v: SceneNumber) => v.hex,
    (v: string) => v,
  ),
  lastScene: custom(
    (v: SceneNumber) => v.hex,
    (v: string) => v,
  ),
});
