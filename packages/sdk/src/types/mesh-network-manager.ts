export class MeshNetworkManagerError extends Error {
  public static readonly SaveError = new MeshNetworkManagerError(
    "Error saving mesh network configuration, please save manually.",
  );

  constructor(message: string) {
    super(message);
    this.name = "MeshNetworkManagerError";
  }
}
