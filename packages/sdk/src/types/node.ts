export class NodeError extends Error {
  public static readonly NodeReset = new NodeError("Node has been reset");
  constructor(message: string) {
    super(message);
    this.name = "NodeError";
  }
}
