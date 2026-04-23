import { hexToUint8Array } from "uint8array-extras";
import { describe, expect, it } from "vitest";
import { ConfigCompositionDataStatus, Page0 } from "../src/index.js";
import { hasMixin } from "ts-mixer";
import { NodeFeatureState } from "../src/mesh-models/node-features.js";
import { Location } from "@mesh-link-js/utils";

describe("Parsing", () => {
  it("parses composition data", () => {
    const data = hexToUint8Array(
      "0034127856CDAB05000A000601020100000100785634120801000221436587AABBCCDD",
    );
    const compositionData = ConfigCompositionDataStatus.fromData(data);

    expect(compositionData).toBeDefined();
    expect(compositionData?.page).toBeDefined();
    expect(compositionData?.page.page).toBe(0);
    const page0 = hasMixin(compositionData?.page, Page0) ? compositionData?.page : undefined;
    expect(page0).toBeDefined();
    expect(page0?.companyIdentifier).toBe(0x1234);
    expect(page0?.productIdentifier).toBe(0x5678);
    expect(page0?.versionIdentifier).toBe(0xabcd);
    expect(page0?.minimumNumberOfReplayProtectionList).toBe(0x0005);
    expect(page0?.features.relay).toBe(NodeFeatureState.notSupported);
    expect(page0?.features.proxy).toBeUndefined();
    expect(page0?.features.friend).toBe(NodeFeatureState.notSupported);
    expect(page0?.features.lowPower).toBe(NodeFeatureState.enabled);
    expect(page0?.elements.length).toBe(2);
    const element0 = page0?.elements[0];
    expect(element0?.location).toBe(Location.main);
    expect(element0?.index).toBe(0);
    expect(element0?.models.length).toBe(3);
    expect(element0?.models[0].modelId).toBe(0x0000);
    expect(element0?.models[0].isBluetoothSIGAssigned ?? false).toBe(true);
    expect(element0?.models[1].modelId).toBe(0x0001);
    expect(element0?.models[1].isBluetoothSIGAssigned ?? false).toBe(true);
    expect(element0?.models[2].modelId).toBe(0x56781234);
    expect(element0?.models[2].isBluetoothSIGAssigned ?? true).toBe(false);

    const element1 = page0?.elements[1];
    expect(element1?.location).toBe(Location.auxiliary);
    expect(element1?.index).toBe(1);
    expect(element1?.models.length).toBe(2);
    expect(element1?.models[0].modelId).toBe(0x43218765);
    expect(element1?.models[0].isBluetoothSIGAssigned ?? true).toBe(false);
    expect(element1?.models[1].modelId).toBe(0xbbaaddcc);
    expect(element1?.models[1].isBluetoothSIGAssigned ?? true).toBe(false);

    expect(compositionData?.parameters).toEqual(data);
  });
});
