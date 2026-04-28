import { NetworkPdu } from "../layers/network-layer/network-pdu.js";
import { MeshNetwork } from "./mesh-network.js";
import { UUID } from "@blemeshjs/utils";
import { Security } from "./security.js";
import { Node, NodeKey } from "./node.js";
import { Element } from "./element.js";
import { Location } from "@blemeshjs/utils";

/**
 * A class representing an unknown Node connected as a GATT Proxy Node.
 *
 * An Unknown Node is a Node from which a message Proxy Configuration has been received,
 * but the mesh network has no information about it.
 *
 * The Unknown Node has fixed security level set to `Security.insecure`,
 * a single empty Element and only one `NetworkKey`, the one used to encrypt
 * the Proxy Configuration message. All other properties are unknown.
 *
 * NOTE: It is not possible to request its Composition Data, as the Device Key is not known.
 */
export class UnknownNode extends Node {
  constructor(pdu: NetworkPdu, meshNetwork: MeshNetwork) {
    super(undefined, pdu.source, 0);
    this.uuid = new UUID();
    this.deviceKey = undefined;
    this.security = Security.insecure;
    this.$netKeys = [new NodeKey(pdu.networkKey.index, false)];
    this.$appKeys = [];
    this.$elements = [Element.fromLocation(Location.unknown)];
    this.meshNetwork = meshNetwork;
  }
}
