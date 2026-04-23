/**
 * configuration allows to narrow down the exported configuration to a
 * required minimum.
 *
 * When sharing a mesh network configuration a care must be taken not to
 * share sensitive information to prevent unauthorized use.
 *
 * When sharing a configuration with a guest, a separate Network Key and
 * set of Application Keys should be created. The Nodes given to the guest under
 * control should be configured to use the keys. The guest can be given only
 * the part of the network related to the guest Network Key, with all other data
 * excluded. Also, to prevent reconfiguration of the Nodes, only partial Nodes
 * configuration can be shared, which excludes the Device Keys of those Nodes.
 */
export enum ExportConfiguration {
  /**
   * This configuration will contain the whole copy of local mesh network.
   */
  full,
}
