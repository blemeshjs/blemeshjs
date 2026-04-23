export class BigUInt {
  private littleEndianBytes: number[];

  public static readonly maxDecimalDigits = 32;
  public static readonly maxBytes = 14;

  constructor(decimalString: string) {
    if (!decimalString || !/^\d+$/.test(decimalString)) {
      throw new Error("Invalid decimal string");
    }
    if (decimalString.length > BigUInt.maxDecimalDigits) {
      throw new Error("Decimal string too long");
    }

    this.littleEndianBytes = [0];

    for (const char of decimalString) {
      const digit = char.charCodeAt(0) - 48;
      this.multiplyBy10();
      this.addSmall(digit);
    }

    this.normalize();
  }

  /** Big-endian bytes */
  public toBytes(sizeInBytes: number): Uint8Array | undefined {
    if (sizeInBytes < 1) return undefined;

    const trimmed = [...this.littleEndianBytes];
    while (trimmed.length > 1 && trimmed[trimmed.length - 1] === 0) {
      trimmed.pop();
    }

    if (trimmed.length > sizeInBytes) return undefined;

    const bigEndian = trimmed.reverse();
    const padding = new Uint8Array(sizeInBytes - bigEndian.length);
    return new Uint8Array([...padding, ...bigEndian]);
  }

  public toDecimalString(): string {
    if (this.littleEndianBytes.length === 1 && this.littleEndianBytes[0] === 0) {
      return "0";
    }

    let temp = this.clone();
    const digits: number[] = [];

    while (!(temp.littleEndianBytes.length === 1 && temp.littleEndianBytes[0] === 0)) {
      const { quotient, remainder } = temp.dividingBy10();
      digits.push(remainder);
      temp = quotient;
    }

    return digits.reverse().join("");
  }

  private clone(): BigUInt {
    const b = new BigUInt("0");
    b.littleEndianBytes = [...this.littleEndianBytes];
    return b;
  }

  private normalize() {
    while (
      this.littleEndianBytes.length > 1 &&
      this.littleEndianBytes[this.littleEndianBytes.length - 1] === 0
    ) {
      this.littleEndianBytes.pop();
    }
  }

  private multiplyBy10(): boolean {
    let carry = 0;

    for (let i = 0; i < this.littleEndianBytes.length; i++) {
      const prod = this.littleEndianBytes[i] * 10 + carry;
      this.littleEndianBytes[i] = prod % 256;
      carry = Math.floor(prod / 256);
    }

    while (carry > 0) {
      if (this.littleEndianBytes.length >= BigUInt.maxBytes) return false;
      this.littleEndianBytes.push(carry % 256);
      carry = Math.floor(carry / 256);
    }

    return true;
  }

  private addSmall(value: number): boolean {
    let carry = value;
    let i = 0;

    while (carry > 0) {
      if (i >= this.littleEndianBytes.length) {
        if (this.littleEndianBytes.length >= BigUInt.maxBytes) return false;
        this.littleEndianBytes.push(0);
      }

      const sum = this.littleEndianBytes[i] + carry;
      this.littleEndianBytes[i] = sum % 256;
      carry = Math.floor(sum / 256);
      i++;
    }

    return true;
  }

  private dividingBy10(): { quotient: BigUInt; remainder: number } {
    const resultBytes = new Array<number>(this.littleEndianBytes.length).fill(0);
    let remainder = 0;

    for (let idx = this.littleEndianBytes.length - 1; idx >= 0; idx--) {
      const acc = remainder * 256 + this.littleEndianBytes[idx];
      const q = Math.floor(acc / 10);
      remainder = acc % 10;
      resultBytes[idx] = q;
    }

    const qBigUInt = new BigUInt("0");
    qBigUInt.littleEndianBytes = resultBytes;
    qBigUInt.normalize();
    return { quotient: qBigUInt, remainder };
  }

  public toString(): string {
    return this.toDecimalString();
  }

  public static random(length: number): BigUInt | undefined {
    if (length < 1 || length > BigUInt.maxDecimalDigits) return undefined;

    let s = "";

    s += (Math.floor(Math.random() * 9) + 1).toString();

    for (let i = 1; i < length; i++) {
      s += Math.floor(Math.random() * 10).toString();
    }

    return new BigUInt(s);
  }
}
