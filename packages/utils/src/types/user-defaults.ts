import { Address } from "../constants/address.js";
import Long from "long";
import { UInt32, UInt64 } from "./number.js";
import { Storage } from "./storage.js";
import { uint8ArrayToString } from "uint8array-extras";
import { isNumber } from "../helpers/common.js";

type StorageValue = string | number | boolean | object | null | undefined;

export class UserDefaults {
  private static instances = new Map<string, UserDefaults>();

  private constructor(
    private suiteName: string,
    private storage: Storage,
  ) {}

  static instance(suiteName: string, storage: Storage): UserDefaults {
    const key = suiteName;
    if (!this.instances.has(key)) {
      this.instances.set(key, new UserDefaults(suiteName, storage));
    }
    return this.instances.get(key)!;
  }

  async get<T = StorageValue>(key: string, parser?: (v: unknown) => T): Promise<T | undefined> {
    const raw = await this.storage.get(this.suiteName + ":" + key);
    return raw ? (parser ? parser(raw) : (raw as unknown as T)) : undefined;
  }
  async set<T = StorageValue>(key: string, value: T): Promise<void> {
    await this.storage.set(this.suiteName + ":" + key, value);
  }

  async remove(key: string): Promise<void> {
    await this.storage.remove(this.suiteName + ":" + key);
  }

  async clear() {
    const data = await this.storage.load();
    if (data === undefined) return;
    const json = JSON.parse(uint8ArrayToString(data)) as Record<string, unknown>;

    // Clear only this suite's keys
    for (const k in json) {
      if (k.startsWith(this.suiteName + ":")) await this.storage.remove(k);
    }
  }

  /**
   * Returns the next SEQ number to be used to send a message from
   * the given Unicast Address.
   *
   * Each time this method is called returned value is incremented by 1.
   *
   * Size of SEQ is 24 bits.
   *
   * @param source The Unicast Address of local Element.
   * @returns The next SEQ number to be used.
   */
  public async nextSequenceNumber(source: Address): Promise<UInt32> {
    // Get the current sequence number source address.
    const sequence = (await this.get<number>(`S${source.hex}`, (v) => (isNumber(v) ? v : 0))) ?? 0;
    // As the sequence number was just used, it has to be incremented.
    await this.set(`S${source.hex}`, sequence + 1);
    return sequence;
  }

  /**
   * Resets the SEQ associated with all Elements of the given Node to 0.
   *
   * This method should be called when the IV Index is incremented and SEQ
   * number should be reset.
   *
   * @param node The local Node.
   */
  public resetSequenceNumbers(node: { elements: Array<{ unicastAddress: Address }> }) {
    return node.elements.reduce(
      (promise, element) => promise.then(() => this.set(`S${element.unicastAddress.hex}`, 0)),
      Promise.resolve(),
    );
  }

  /**
   * Removes the SEQ number associated with the given address.
   *
   * @param source The address to be forgotten.
   */
  public removeSequenceNumber(source: Address) {
    return this.remove(`S${source.hex}`);
  }

  /**
   * Returns the last SeqAuth value stored for the given source address, or nil,
   * if no message has ever been received from that address.
   *
   * The SeqAuth value ensures uniqueness of each message. Each message from
   * the same source address must be sent with unique value of SeqAuth.
   *
   * @param source The source Unicast Address.
   * @returns The 32+24 bit SeqAuth value, or undefined.
   */
  public async lastSeqAuthValue(source: Address): Promise<UInt64 | undefined> {
    const value = await this.get<string>(source.hex);
    return typeof value === "string" ? Long.fromString(value, true, 16) : undefined;
  }

  /**
   * Stores the last received SeqAuth value in User Defaults.
   *
   * @param value The SeqAuth value of received message.
   * @param source The source Unicast Address.
   */
  public storeLastSeqAuthValue(value: UInt64, source: Address) {
    return this.set(source.hex, value.toString(16));
  }

  /**
   * Returns the previous SeqAuth value for the given source address, or nil,
   * if no more than 1 message has ever been received from that address.
   *
   * @param source The source Unicast Address.
   * @returns The 32+24 bit SeqAuth value, or nil.
   */
  public async previousSeqAuthValue(source: Address): Promise<UInt64 | undefined> {
    const value = await this.get<string>(`P${source.hex}`);
    return typeof value === "string" ? Long.fromString(value, true, 16) : undefined;
  }

  /**
   * Stores the previously received SeqAuth value in User Defaults.
   *
   * @param value The previously received SeqAuth value.
   * @param source The source Unicast Address.
   */
  public storePreviousSeqAuthValue(value: UInt64, source: Address) {
    return this.set(`P${source.hex}`, value.toString(16));
  }

  /**
   * Removes all known SeqAuth values associated with any of the Elements
   * of the given remote Node.
   *
   * @param node The remote Node.
   */
  public removeSeqAuthValuesOfNode(node: { elements: Array<{ unicastAddress: Address }> }) {
    return node.elements.reduce<Promise<void>>(
      (promise, element) =>
        promise.then(() => this.removeSeqAuthValuesOfAddress(element.unicastAddress)),
      Promise.resolve(),
    );
  }

  /**
   * Removes last known SeqAuth value associated with the given address
   * of a remote Node.
   *
   * @param source The forgotten Address.
   */
  public async removeSeqAuthValuesOfAddress(source: Address) {
    await this.remove(source.hex);
    await this.remove(`P${source.hex}`);
  }

  public async register(defaults: Record<string, StorageValue>) {
    for (const key in defaults) {
      if ((await this.get(key)) === undefined) {
        await this.set(key, defaults[key]);
      }
    }
  }
}
