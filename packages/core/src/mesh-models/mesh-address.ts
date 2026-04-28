import { Crypto } from "@blemeshjs/crypto";
import { UUID, Address } from "@blemeshjs/utils";

export class MeshAddress {
  public get hex(): string {
    if (typeof this.virtualLabel !== "undefined") {
      return this.virtualLabel.hex;
    }
    return this.address.hex;
  }
  constructor(
    /** 16-bit address. */
    public address: Address,
    /** Virtual Label UUID. */
    public virtualLabel: UUID | undefined,
  ) {}

  public static fromAddress(address: Address): MeshAddress {
    return new MeshAddress(address, undefined);
  }

  public static fromVirtualLabel(virtualLabel: UUID): MeshAddress {
    return new MeshAddress(Crypto.calculateVirtualAddress(virtualLabel), virtualLabel);
  }

  public static fromHex(hex: string): MeshAddress | undefined {
    const address = Address.fromHex(hex);
    if (typeof address !== "undefined") return MeshAddress.fromAddress(address);
    let virtualLabel = UUID.fromUuidString(hex);
    if (typeof virtualLabel === "undefined") virtualLabel = UUID.fromHex(hex);
    if (typeof virtualLabel === "undefined") return undefined;
    return MeshAddress.fromVirtualLabel(virtualLabel);
  }

  equal(other: unknown): boolean {
    if (!(other instanceof MeshAddress)) return false;
    return this.address.equal(other.address);
  }

  toString(): string {
    if (typeof this.virtualLabel !== "undefined") {
      return this.virtualLabel.hex;
    }
    return `0x${this.address.hex}`;
  }
}
