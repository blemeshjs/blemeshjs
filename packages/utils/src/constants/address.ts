import { packUInt16BE, packUInt16LE } from "../helpers/number.js";
import { UInt16 } from "../types/number.js";

/**
 * Bluetooth Mesh address type. Type alias for `UInt16`.
 *
 * In Bluetooth mesh addresses are divided into several categories:
 * - Unassigned Address - address 0x0000.
 * - Unicast Addresses - a unique address of an `Element`.
 * - Group Address - a group address allows sending messages to multiple receivers.
 * - Virtual Group Address - each virtual address is a hash of a Virtual Label (UUID).
 * - Fixed Group Addresses - set of predefined group addresses.
 */
export class Address extends Number {
  /// An Unassigned Address is an address in which the Element of a Node
  /// has not been configured yet or no address has been allocated.
  public static unassignedAddress = new Address(0x0000);
  public static minUnicastAddress = new Address(0x0001);
  public static maxUnicastAddress = new Address(0x7fff);
  public static minVirtualAddress = new Address(0x8000);
  public static maxVirtualAddress = new Address(0xbfff);
  public static minGroupAddress = new Address(0xc000);
  public static maxGroupAddress = new Address(0xfeff);

  public get hex(): string {
    return this.valueOf().toString(16).padStart(4, "0").toUpperCase();
  }

  public get dec(): number {
    return this.valueOf();
  }

  public get bytes(): Uint8Array {
    return packUInt16LE(this.valueOf());
  }

  equal(other: Address): boolean {
    return this.valueOf() === other.valueOf();
  }

  public get bytesBE(): Uint8Array {
    return packUInt16BE(this.valueOf());
  }

  public constructor(value: UInt16) {
    super(value);
  }
  public static fromHex(hex: string): Address | undefined {
    if (hex.length !== 4) return undefined;
    const value = parseInt(hex, 16);
    if (typeof value !== "number") return undefined;
    return new Address(value);
  }

  /**
   * A message sent to the all-proxies address will be processed by the
   * Primary Element of all nodes that have the friend functionality enabled.
   *
   * That means, that Models on the Primary Element of all the Nodes are
   * automatically subscribed to all-proxies address if the Node has
   * Proxy functionality enabled. Models on the Primary and other Elements
   * of a Node may subscribe to this address to receive messages no matter
   * what the feature state is.
   */
  public static allProxies = new Address(0xfffc);
  /**
   * A message sent to the all-friends address will be processed by the
   * Primary Element of all nodes that have the friend functionality enabled.
   *
   * That means, that Models on the Primary Element of all the Nodes are
   * automatically subscribed to all-friends address if the Node has
   * Friend functionality enabled. Models on the Primary and other Elements
   * of a Node may subscribe to this address to receive messages no matter
   * what the feature state is.
   */
  public static allFriends = new Address(0xfffd);
  /**
   * A message sent to the all-relays address will be processed by the
   * Primary Element of all nodes that have the relay functionality enabled.
   *
   * That means, that Models on the Primary Element of all the Nodes are
   * automatically subscribed to all-relays address if the Node has
   * Relay functionality enabled. Models on the Primary and other Elements
   * of a Node may subscribe to this address to receive messages no matter
   * what the feature state is.
   */
  public static allRelays = new Address(0xfffe);
  /**
   * A message sent to the all-nodes address will be processed by the
   * Primary Element of all nodes.
   *
   * That means, that all Models on the Primary Element of all the Nodes
   * are automatically subscribed to all-nodes address. It is not possible
   * for Models on other Elements to receive messages sent to All Nodes address,
   * as they cannot subscribe to this address.
   */
  public static allNodes = new Address(0xffff);

  /** Returns `true` if the address is from a valid range. */
  public get isValidAddress(): boolean {
    return this.valueOf() < 0xff00 || this.valueOf() > 0xfffb;
  }

  /**
   * Returns `true` if the address is an Unassigned Address.
   * Unassigned addresses is equal to 0b0000000000000000.
   */
  public get isUnassigned(): boolean {
    return this.valueOf() === Address.unassignedAddress.valueOf();
  }

  /**
   * Returns `true` if the address is an Unicast Address.
   * Unicast addresses match 0b00xxxxxxxxxxxxxx (except 0b0000000000000000).
   */
  public get isUnicast(): boolean {
    return (this.valueOf() & 0x8000) == 0x0000 && !this.isUnassigned;
  }

  /**
   * Returns `true` if the address is a Virtual Address.
   * Virtual addresses match 0b10xxxxxxxxxxxxxx.
   */
  public get isVirtual(): boolean {
    return (this.valueOf() & 0xc000) == 0x8000;
  }

  /**
   * Returns `true` if the address is a Group Address.
   * Group addresses match 0b11xxxxxxxxxxxxxx.
   */
  public get isGroup(): boolean {
    return (this.valueOf() & 0xc000) == 0xc000 && this.isValidAddress;
  }

  /**
   * Returns `true` if the address is a special Group Address.
   *
   * Special groups are:
   * * All Proxies: 0xFFFC
   * * All Friends: 0xFFFD
   * * All Relays: 0xFFFE
   * * All Nodes: 0xFFFF
   */
  public get isSpecialGroup(): boolean {
    return this.valueOf() >= 0xff00;
  }
}
