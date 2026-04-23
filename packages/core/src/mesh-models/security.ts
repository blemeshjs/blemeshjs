export class Security {
  /**
   * A key is considered insecure if at least one Node has been provisioned
   * without using Out-Of-Band Public Key exchange. This Node is also considered
   * insecure.
   */
  public static insecure = new Security("insecure");
  /**
   * A key is considered secure if all Nodes which know the key have been
   * provisioned using Secure Procedure, that is using Out-Of-Band Public Key.
   */
  public static secure = new Security("secure");

  public constructor(public readonly value: string) {}

  public static fromString(value: string): Security | undefined {
    switch (value.toLowerCase()) {
      case "insecure":
        return Security.insecure;
      case "secure":
        return Security.secure;
      default:
        return undefined;
    }
  }

  toString(): string {
    switch (this) {
      case Security.insecure:
        return "Insecure";
      case Security.secure:
        return "Secure";
      default:
        return "Unknown Security Level: " + this.value;
    }
  }
}
