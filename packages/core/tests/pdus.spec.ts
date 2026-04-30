import { beforeAll, describe, expect, it } from "vitest";
import { Data, IvIndex, Storage } from "@blemeshjs/utils";
import { hexToUint8Array, stringToUint8Array } from "uint8array-extras";
import {
  ConfigAppKeyAdd,
  MeshAddress,
  MeshNetwork,
  MeshNetworkManager,
  PduType,
} from "../src/index.js";
import { AccessPdu } from "../src/layers/access-layer/access-pdu.js";
import { UpperTransportPdu } from "../src/layers/upper-transport-layer/upper-transport-pdu.js";
import { SegmentedAccessMessage } from "../src/layers/lower-transport-layer/segmented-access-message.js";
import { NetworkPdu } from "../src/layers/network-layer/network-pdu.js";
import { DeviceKeySet } from "../src/mesh-models/key-set.js";
import { MeshData } from "../src/mesh-models/mesh-data.js";

class TestStorage extends Storage {
  store: Record<string, unknown> = {};
  save(_data: Data): Promise<boolean> {
    return Promise.resolve(true);
  }
  load(): Promise<Data | undefined> {
    return Promise.resolve(
      stringToUint8Array(`{
   "meshNetwork":{
      "$schema":"http://json-schema.org/draft-04/schema#",
      "id":"http://www.bluetooth.com/specifications/assigned-numbers/mesh-profile/cdb-schema.json#",
      "version":"1.0.0",
      "meshUUID":"c47810dd475048c8a64eb069cc0c411d",
      "meshName":"Brian and Mary's House",
      "timestamp":"2018-12-23T11:45:22-08:00",
      "netKeys":[
         {
            "name":"Home Network",
            "index":291,
            "key":"7dd7364cd842ad18c17c2b820c84c3d6",
            "phase":0,
            "minSecurity":"secure",
            "timestamp":"2018-11-20T10:05:20-08:00"
         }
      ],
      "appKeys":[
         {
            "name":"Primary App Key",
            "index":0,
            "boundNetKey":291,
            "key":"3FA985DA6D4CA22DA05C7E7A1F11C783"
         },
         {
            "name":"Home Automation",
            "index":1110,
            "boundNetKey":291,
            "key":"63964771734fbd76e3b40519d1d94a48"
         }
      ],
      "provisioners":[
         {
            "provisionerName":"Brian's Phone",
            "UUID":"07335352c4024677a448a17193022a9b",
            "allocatedGroupRange":[
               {
                  "lowAddress":"C000",
                  "highAddress":"FEFF"
               }
            ],
            "allocatedUnicastRange":[
               {
                  "lowAddress":"0001",
                  "highAddress":"7FFF"
               }
            ],
            "allocatedSceneRange":[
               
            ]
         }
      ],
      "nodes":[
         {
            "UUID":"07335352c4024677a448a17193022a9b",
            "name":"Brian’s phone",
            "cid":"0008",
            "pid":"032B",
            "vid":"0005",
            "crpl":"0100",
            "features":{
               "relay":0,
               "proxy":0,
               "friend":0,
               "lowPower":2
            },
            "deviceKey":"27653BFE0EEEA5ECBBA68975DD0A0244",
            "unicastAddress":"0003",
            "security":"secure",
            "configComplete":true,
            "netKeys":[
               {
                  "index":291,
                  "updated":false
               }
            ],
            "appKeys":[
               {
                  "index":1110,
                  "updated":false
               }
            ],
            "elements":[
               {
                  "index":0,
                  "location":"0000",
                  "models":[
                     {
                        "modelId":"0000",
                        "subscribe":[
                           
                        ],
                        "bind":[
                           
                        ]
                     },
                     {
                        "modelId":"0002",
                        "subscribe":[
                           
                        ],
                        "bind":[
                           
                        ]
                     },
                     {
                        "modelId":"0001",
                        "subscribe":[
                           
                        ],
                        "bind":[
                           
                        ]
                     }
                  ]
               }
            ],
            "excluded":false
         },
         {
            "UUID":"ae937dd50f844e5c873b0e2c5293a237",
            "name":"Bell",
            "deviceKey":"9D6DD0E96EB25DC19A40ED9914F8F03F",
            "unicastAddress":"1201",
            "security":"secure",
            "cid":"0007",
            "pid":"001A",
            "vid":"0003",
            "crpl":"0100",
            "features":{
               "relay":0,
               "proxy":1,
               "friend":0,
               "lowPower":2
            },
            "configComplete":true,
            "netKeys":[
               {
                  "index":291,
                  "updated":false
               }
            ],
            "appKeys":[
               
            ],
            "defaultTTL":9,
            "elements":[
               {
                  "index":0,
                  "location":"010C",
                  "models":[
                     {
                        "modelId":"0000",
                        "subscribe":[
                           
                        ],
                        "bind":[
                           
                        ]
                     },
                     {
                        "modelId":"0002",
                        "subscribe":[
                           
                        ],
                        "bind":[
                           
                        ]
                     },
                     {
                        "modelId":"1000",
                        "subscribe":[
                           
                        ],
                        "bind":[
                           
                        ]
                     }
                  ]
               }
            ],
            "excluded":false
         },
         {
            "UUID":"6e99c8f645ce40459889e2c85d75242f",
            "name":"Low Power Node",
            "deviceKey":"9D6DD0E96EB25DC19A40ED9914F8F03F",
            "unicastAddress":"1234",
            "security":"secure",
            "cid":"0007",
            "pid":"001A",
            "vid":"0003",
            "crpl":"0100",
            "features":{
               "relay":0,
               "proxy":0,
               "friend":0,
               "lowPower":1
            },
            "configComplete":true,
            "netKeys":[
               {
                  "index":291,
                  "updated":false
               }
            ],
            "appKeys":[
               {
                  "index":1110,
                  "updated":false
               }
            ],
            "defaultTTL":3,
            "elements":[
               {
                  "index":0,
                  "location":"010C",
                  "models":[
                     {
                        "modelId":"0000",
                        "subscribe":[
                           
                        ],
                        "bind":[
                           
                        ]
                     },
                     {
                        "modelId":"0002",
                        "subscribe":[
                           
                        ],
                        "bind":[
                           
                        ]
                     },
                     {
                        "modelId":"000a0000",
                        "subscribe":[
                           
                        ],
                        "bind":[
                           1110
                        ]
                     }
                  ]
               }
            ],
            "excluded":false
         }
      ],
      "groups":[
         {
            "name":"Virtual Group",
            "address":"0073E7E4D8B9440FAF8415DF4C56C0E1",
            "parentAddress":"0000"
         }
      ],
      "scenes":[]
   }
}`),
    );
  }
  get(key: string): Promise<unknown> {
    return Promise.resolve(this.store[key]);
  }
  set(key: string, value: unknown): Promise<void> {
    this.store[key] = value;
    return Promise.resolve();
  }
  remove(_key: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  clear(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

describe("PDUs", () => {
  let manager: MeshNetworkManager;
  beforeAll(() => {
    manager = new MeshNetworkManager(new TestStorage(), MeshData, MeshNetwork);

    expect(async () => await manager.load()).not.toThrow();
  });

  it("should load manager properly", () => {
    expect(manager).toBeDefined();
    expect(manager.meshNetwork).toBeDefined();

    const meshNetwork = manager.meshNetwork!;

    expect(meshNetwork.localProvisioner).toBeDefined();
    expect(meshNetwork.localProvisioner!.meshNetwork).toBeDefined();
    expect(meshNetwork.localProvisioner!.primaryUnicastAddress).toBeDefined();
    expect(meshNetwork.localProvisioner!.primaryUnicastAddress?.valueOf()).toBe(0x0003);

    expect(meshNetwork.networkKeys.length).toBe(1);
    expect(meshNetwork.applicationKeys.length).toBe(2);
    expect(meshNetwork.applicationKeys[0].meshNetwork).toBeDefined();
    expect(meshNetwork.applicationKeys[1].meshNetwork).toBeDefined();
    expect(meshNetwork.applicationKeys[0].boundNetworkKeyIndex).toEqual(
      meshNetwork.networkKeys[0].index,
    );
    expect(meshNetwork.applicationKeys[1].boundNetworkKeyIndex).toEqual(
      meshNetwork.networkKeys[0].index,
    );
    expect(meshNetwork.applicationKeys[0].boundNetworkKey).toEqual(meshNetwork.networkKeys[0]);
    expect(meshNetwork.applicationKeys[1].boundNetworkKey).toEqual(meshNetwork.networkKeys[0]);

    expect(meshNetwork.nodes.length).toBe(3);
    expect(meshNetwork.nodes[0].meshNetwork).toBeDefined();
    expect(meshNetwork.nodes[1].meshNetwork).toBeDefined();
  });

  it("sends message 6", () => {
    expect(manager.meshNetwork).toBeDefined();
    const meshNetwork = manager.meshNetwork!;
    const networkKey = meshNetwork.networkKeys[0];
    const ivIndex = new IvIndex(0x12345678, false);
    const source = meshNetwork.localProvisioner?.node?.elements[0]?.unicastAddress;
    expect(source).toBeDefined();
    const node = meshNetwork.nodes[1];
    const destination = MeshAddress.fromAddress(node.primaryUnicastAddress);
    const sequence = 0x3129ab;
    const keySet = DeviceKeySet.fromNetworkKey(networkKey, node)!;

    // Test begins here
    const message = ConfigAppKeyAdd.fromApplicationKey(meshNetwork.applicationKeys[1]);
    expect(message.networkKeyIndex.valueOf()).toBe(0x123);
    expect(message.applicationKeyIndex.valueOf()).toBe(0x456);
    expect(message.key).toEqual(hexToUint8Array("63964771734FBD76E3B40519D1D94A48"));
    expect(message.parameters).toEqual(hexToUint8Array("23614563964771734FBD76E3B40519D1D94A48"));

    const accessPdu = AccessPdu.fromMeshMessage(message, source!, destination, true);
    expect(accessPdu.isSegmented).toBe(true);
    expect(accessPdu.destination).toEqual(destination);
    expect(accessPdu.opCode).toBe(ConfigAppKeyAdd.opCode);
    expect(accessPdu.accessPdu).toEqual(
      hexToUint8Array("0023614563964771734FBD76E3B40519D1D94A48"),
    );

    const pdu = UpperTransportPdu.fromAccessPdu(accessPdu, keySet, sequence, ivIndex);
    expect(pdu.source).toEqual(source);
    expect(pdu.destination).toEqual(destination);
    expect(pdu.sequence).toBe(sequence);
    expect(pdu.aid).toBeUndefined();
    expect(pdu.transportMicSize).toBe(4); // 32-bits
    expect(pdu.accessPdu).toEqual(hexToUint8Array("0023614563964771734FBD76E3B40519D1D94A48"));
    expect(pdu.transportPdu).toEqual(
      hexToUint8Array("EEE888AA2169326D23F3AFDFCFDC18C52FDEF7720F8AF48F"),
    );

    const segment0 = SegmentedAccessMessage.fromUpperTransportPdu(pdu, networkKey, 0);
    expect(segment0.aid).toBeUndefined();
    expect(segment0.source).toEqual(source);
    expect(segment0.destination).toEqual(destination.address);
    expect(segment0.networkKey).toEqual(networkKey);
    expect(segment0.sequenceZero).toBe(0x9ab);
    expect(segment0.segmentOffset).toBe(0);
    expect(segment0.lastSegmentNumber).toBe(1);
    expect(segment0.upperTransportPdu).toEqual(hexToUint8Array("EEE888AA2169326D23F3AFDF"));
    expect(segment0.transportPdu).toEqual(hexToUint8Array("8026AC01EEE888AA2169326D23F3AFDF"));

    const segment1 = SegmentedAccessMessage.fromUpperTransportPdu(pdu, networkKey, 1);
    expect(segment1.source).toEqual(source);
    expect(segment1.destination).toEqual(destination.address);
    expect(segment1.networkKey).toEqual(networkKey);
    expect(segment1.sequenceZero).toBe(0x9ab);
    expect(segment1.segmentOffset).toBe(1);
    expect(segment1.lastSegmentNumber).toBe(1);
    expect(segment1.upperTransportPdu).toEqual(hexToUint8Array("CFDC18C52FDEF7720F8AF48F"));
    expect(segment1.transportPdu).toEqual(hexToUint8Array("8026AC21CFDC18C52FDEF7720F8AF48F"));

    let networkPdu0 = NetworkPdu.encode(segment0, PduType.networkPdu, sequence, 4);
    expect(networkPdu0).not.instanceof(Error);
    networkPdu0 = networkPdu0 as NetworkPdu;
    expect(networkPdu0.sequence).toBe(sequence);
    expect(networkPdu0.source).toBe(source);
    expect(networkPdu0.destination).toBe(destination.address);
    expect(networkPdu0.ivi).toBe(0);
    expect(networkPdu0.nid).toBe(0x68);
    expect(networkPdu0.networkKey).toBe(networkKey);
    expect(networkPdu0.pdu).toEqual(
      hexToUint8Array("68CAB5C5348A230AFBA8C63D4E681631C09DEAF4FD409611459A3D6C3E"),
    );

    let networkPdu1 = NetworkPdu.encode(segment1, PduType.networkPdu, sequence + 1, 4);

    expect(networkPdu1).not.instanceof(Error);
    networkPdu1 = networkPdu1 as NetworkPdu;
    expect(networkPdu1.sequence).toBe(sequence + 1);
    expect(networkPdu1.source).toBe(source);
    expect(networkPdu1.destination).toBe(destination.address);
    expect(networkPdu1.ivi).toBe(0);
    expect(networkPdu1.nid).toBe(0x68);
    expect(networkPdu1.networkKey).toBe(networkKey);
    expect(networkPdu1.pdu).toEqual(
      hexToUint8Array("681615B5DD4A846CAE0C032BF0746F44F1B8CC8CE502AEF9D2393E5B93"),
    );
  });
});
