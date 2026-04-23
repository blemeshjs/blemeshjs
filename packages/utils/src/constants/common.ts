/**
 * The key used in `UserDefaults` to store the UUID of the local Provisioner for
 * each loaded mesh network.
 *
 * The intent is to restore the same instance (move to index 0) whenever the same mesh
 * network configuration is imported.
 *
 * Local Provisioner UUID is saved whenever a new Provisioner is added or moved
 * to index 0 in the `MeshNetwork.provisioners` array in mesh network object.
 *
 * Use `MeshNetwork.restoreLocalProvisioner()` to restore the Provisioner instance.
 */
export const LocalProvisionerUuidKey = "provisioner";
