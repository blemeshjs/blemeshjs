import { makeObservable, observable } from "mobx";
import { Storage } from "@blemeshjs/utils";
import z from "zod";
import { serialize } from "serializr";
import { Serialized } from "serializr/lib/core/serialize.js";
import { MeshNetwork } from "./mesh-network.js";

/**
 * The Mesh Network configuration saved internally.
 * It contains the Mesh Network and additional data that
 * are not in the JSON schema, but are used by in the app.
 */
export class MeshData {
  /**
   * Mesh Network state.
   */
  public meshNetwork: MeshNetwork | undefined = undefined;

  public decode(json: Record<string, unknown>, storage: Storage): boolean {
    const parsed = z
      .object({
        meshNetwork: z.record(z.string(), z.any()),
      })
      .safeParse(json);
    if (!parsed.success) return false;
    const meshNetwork = MeshNetwork.decode(parsed.data.meshNetwork, storage);
    this.meshNetwork = meshNetwork;
    return true;
  }

  public encode(): Serialized<MeshNetwork> | undefined {
    return serialize(MeshNetwork, this.meshNetwork);
  }

  constructor() {
    makeObservable(this, {
      meshNetwork: observable,
    });
  }
}
