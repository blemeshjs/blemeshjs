import { Element as $Element } from "@blemeshjs/core";
import { computed, makeObservable } from "mobx";
import { InternalModel } from "./model.js";
import { createProxy, keysOf } from "../types";
import { CoreMeshNetworkManager } from "../mesh-network/core-mesh-network-manager.js";

export type Element = ReturnType<typeof InternalElement.toProxy>;
export class InternalElement {
  public get models() {
    return this.$element.models.map((model) =>
      InternalModel.toProxy(model, this.$coreMeshNetworkManager),
    );
  }

  public static toProxy(element: $Element, coreMeshNetworkManager: CoreMeshNetworkManager) {
    return createProxy(
      element,
      new InternalElement(element, coreMeshNetworkManager),
      keysOf<$Element>()([]),
      keysOf<$Element>()(["name", "unicastAddress", "location", "index"]),
    );
  }

  private constructor(
    private $element: $Element,
    private $coreMeshNetworkManager: CoreMeshNetworkManager,
  ) {
    makeObservable(this, {
      models: computed,
    });
  }
}
