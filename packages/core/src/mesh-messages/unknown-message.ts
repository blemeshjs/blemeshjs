import { Data, MeshMessage, UInt32 } from "@mesh-link-js/utils";
import { uint8ArrayToHex } from "uint8array-extras";

/**
 * The unknown message is returned if no local Model defines
 * a message type for the received Op Code.
 *
 * The Op Code and raw parameters can be read directly.
 *
 * In order to have the Unknown Message parsed, a `Model` has to
 * be defined in `MeshNetworkManager.localElements` with
 * a `ModelHandler` defining a type for the given Op Code in
 * `ModelHandler.messageTypes`.
 */
export class UnknownMessage extends MeshMessage {
  constructor(
    public parameters: Data,
    /**
     * The opcode is set when the message is received. Initially it is set
     * to 0, as the constructor takes only parameters.
     */
    public opCode: UInt32 = 0,
  ) {
    super();
  }

  public static fromParameters(parameters: Data) {
    return new UnknownMessage(parameters);
  }

  toString(): string {
    const opCodeHex = this.opCode.toString(16).padStart(6, "0");
    const parametersHex =
      typeof this.parameters !== "undefined" ? uint8ArrayToHex(this.parameters) : "undefinted";
    return `UnknownMessage(opCode: 0x${opCodeHex}, parameters: ${parametersHex})`;
  }
}
