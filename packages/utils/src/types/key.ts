import { Clazz, createModelSchema, custom, primitive } from "serializr";
import { hexToUint8Array, uint8ArrayToHex } from "uint8array-extras";
import { Data } from "./buffer.js";
import { KeyIndex } from "./key-index.js";

/**
 * Base protocol for Network and Application Keys.
 */
export abstract class Key {
  protected abstract $name: string;
  /**
   * UTF-8 string, which should be a human readable name of this key.
   */
  public get name(): string {
    return this.$name;
  }
  public set name(value: string) {
    this.$name = value;
  }
  protected abstract $index: KeyIndex;
  /**
   * Index of this key, in range from 0 through to 4095.
   */
  public get index(): KeyIndex {
    return this.$index;
  }
  /**
   * 128-bit key.
   */
  protected abstract $key: Data;
  public get key(): Data {
    return this.$key;
  }
}

// Key is abstract; cast to allow createModelSchema to register the schema for
// prototype-chain-based inheritance in serializr.

createModelSchema(Key as unknown as Clazz<object>, {
  name: primitive(),
  index: custom(
    (v: KeyIndex) => v.valueOf(),
    (v: number) => new KeyIndex(v),
  ),
  key: custom(
    (v: Data) => uint8ArrayToHex(v),
    (v: string) => hexToUint8Array(v),
  ),
});
