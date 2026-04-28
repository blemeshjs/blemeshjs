import { NetworkKey } from "./network-key.js";
import { Data, KeyRefreshPhase, KeySet, UInt8 } from "@blemeshjs/utils";
import { ApplicationKey } from "./application-key.js";
import { Node } from "./node.js";

export class AccessKeySet extends KeySet {
  public get networkKey(): NetworkKey {
    return this.applicationKey.boundNetworkKey;
  }

  public get accessKey(): Data {
    if (KeyRefreshPhase.keyDistribution === this.networkKey.phase) {
      return this.applicationKey.oldKey ?? this.applicationKey.key;
    }
    return this.applicationKey.key;
  }

  public get aid(): UInt8 | undefined {
    if (KeyRefreshPhase.keyDistribution === this.networkKey.phase) {
      return this.applicationKey.oldAid ?? this.applicationKey.aid;
    }
    return this.applicationKey.aid;
  }
  constructor(public applicationKey: ApplicationKey) {
    super();
  }

  toString(): string {
    return `${this.applicationKey}`;
  }
}

export class DeviceKeySet extends KeySet {
  public aid: UInt8 | undefined = undefined;

  constructor(
    public networkKey: NetworkKey,
    public node: Node,
    public accessKey: Data,
  ) {
    super();
  }
  public static fromNetworkKey(networkKey: NetworkKey, node: Node): DeviceKeySet | undefined {
    if (typeof node.deviceKey === "undefined") {
      return undefined;
    }
    return new DeviceKeySet(networkKey, node, node.deviceKey);
  }

  toString(): string {
    return `${this.node.name ?? "Unknown device"}'s Device Key`;
  }
}
