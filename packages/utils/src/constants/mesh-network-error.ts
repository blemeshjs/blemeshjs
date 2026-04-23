/**
 * A set of generic mesh errors.
 */
export class MeshNetworkError extends Error {
  /**
   * Thrown when any allocated range of the new Provisioner overlaps
   * with an existing one.
   */
  public static overlappingProvisionerRanges = new MeshNetworkError(
    "Overlapping Provisioner ranges.",
  );
  /**
   * Thrown when trying to add a Provisioner that is already a part
   * of another mesh network.
   */
  public static provisionerUsedInAnotherNetwork = new MeshNetworkError(
    "Provisioner used in another network.",
  );
  /**
   * Thrown when a new Provisioner has the same UUID as one node that
   * is already in the mesh network.
   */
  public static nodeAlreadyExist = new MeshNetworkError(
    "Node with the same UUID already exists in the network.",
  );
  /**
   * Thrown when a node cannot be added due to lack of available
   * addresses in Provisioner's range.
   */
  public static noAddressAvailable = new MeshNetworkError(
    "No address available in Provisioner's range.",
  );
  /**
   * Thrown when the address cannot be assigned as it is being used by
   * another node.
   */
  public static addressNotAvailable = new MeshNetworkError(
    "Address used by another Node in the network.",
  );
  /**
   * Thrown when the address is of a wrong type.
   */
  public static invalidAddress = new MeshNetworkError("Invalid range.");
  /**
   * Thrown when a node cannot be added due to its address not being
   * inside Provisioner's unicast address range.
   */
  public static addressNotInAllocatedRange = new MeshNetworkError(
    "Address outside Provisioner's range.",
  );
  /**
   * Thrown when the requested Provisioner is not in the Mesh Network.
   */
  public static provisionerNotInNetwork = new MeshNetworkError(
    "Provisioner does not belong to the network.",
  );
  /**
   * Thrown when the object cannot be removed.
   */
  public static cannotRemove = new MeshNetworkError("Object could not be removed.");
  /**
   * Thrown when the range to be allocated is of invalid type.
   */
  public static invalidRange = new MeshNetworkError("Invalid range.");
  /** Thrown when the provided key is not 128-bit long. */
  public static invalidKey = new MeshNetworkError("Invalid key: The key must be 128-bit long.");
  /** Thrown when trying to remove a key that is being used by another Node. */
  public static keyInUse = new MeshNetworkError("Cannot remove: Key in use.");
  /** Thrown when trying to remove a key that is not known by the network. */
  public static keyNotKnown: MeshNetworkError = new MeshNetworkError(
    "Cannot remove: Key not known by the network.",
  );
  /**
   * Thrown when a new Group is being added with the same address as one
   * that is already in the network.
   */
  public static groupAlreadyExists = new MeshNetworkError(
    "Group with the same address already exists in the network.",
  );
  /**
   * Thrown when a new Scene is being added with the same number as one
   * that is already in the network.
   */
  public static sceneAlreadyExists = new MeshNetworkError(
    "Scene with the same number already exists in the network.",
  );
  /**
   * Thrown when trying to remove a Group that is either a parent of another
   * Group, or set as publication or subscription address for a Model.
   */
  public static groupInUse = new MeshNetworkError("Cannot remove: Group in use.");
  /** Thrown when trying to remove a Scene stored by at least one Scene Register. */
  public static sceneInUse = new MeshNetworkError("Cannot remove: Scene in use.");
  /** Thrown when the given Key Index is not valid. */
  public static keyIndexOutOfRange = new MeshNetworkError("Key Index out of range.");
  /** Thrown when Network Key is required to continue with the operation. */
  public static noNetworkKey = new MeshNetworkError("No Network Key.");
  /** Thrown when Application Key is required to continue with the operation. */
  public static noApplicationKey = new MeshNetworkError("No Application Key.");
  /** Thrown when trying to send a mesh message before setting up the mesh network. */
  public static noNetwork = new MeshNetworkError("Mesh Network not created.");
  /**
   * Thrown when setting too small IV Index. The new IV Index must be greater than
   * or equal to the previous one.
   */
  public static ivIndexTooSmall = new MeshNetworkError("IV Index too small.");
  /** Thrown when a key with the same index already exists in the network. */
  public static keyIndexAlreadyExists = new MeshNetworkError(
    "Key with the same index already exists in the network.",
  );
  private constructor(message: string) {
    super(message);
  }
}
