import { z } from "zod";

/**
 * A namespace for Mesh Configuration Database Zod schemas.
 * This provides a clean, organized, and properly typed structure for validation.
 */
export namespace MeshCDB {
  // Base & Primitive Type Definitions
  export const UnicastAddress = z
    .string()
    .regex(
      /^(([1-7][0-9a-fA-F]{3})|([0-7][1-9a-fA-F][0-9a-fA-F]{2})|([0-7][0-9a-fA-F][1-9a-fA-F][0-9a-fA-F])|([0-7][0-9a-fA-F][0-9a-fA-F][1-9a-fA-F]))$/,
    );
  export const Timestamp = z.iso.datetime({ offset: true });
  export const Credentials = z.number().int().min(0).max(1);
  export const Ttl = z.number().int().min(0).max(127);
  export const TtlDefault = z.literal(255);
  export const FeatureState = z.union([z.literal(0), z.literal(1), z.literal(2)]);
  export const KeyIndex = z.number().int().min(0).max(4095);
  export const GroupAddress = z
    .string()
    .regex(/^([c-fC-F][0-9a-eA-E][0-9a-fA-F]{2}|[c-eC-E][[fF][0-9a-fA-F]{2})$/);
  export const SpecialGroupAddress = z
    .string()
    .regex(/^([fF]{2}[0-9a-eA-E][0-9a-fA-F]|[fF]{3}[0-9a-eA-E])$/);
  export const AllNodesAddress = z.string().regex(/^[fF]{4}$/);
  export const UUID = z.union([z.uuid(), z.string().regex(/^[0-9a-fA-F]{32}$/)]);
  export const UnassignedAddress = z.literal("0000");
  export const Identifier = z.string().regex(/^[0-9a-fA-F]{4}$/);
  export const Key = z.string().regex(/^[0-9a-fA-F]{32}$/);
  export const KeyRefreshPhase = z.number().int().min(0).max(2);
  export const SecurityLevel = z.enum(["insecure", "secure"]);
  export const ElementIndex = z.number().int().min(0).max(255);
  export const HeartbeatPeriod = z
    .enum([
      "0",
      "1",
      "2",
      "4",
      "8",
      "16",
      "32",
      "64",
      "128",
      "256",
      "512",
      "1024",
      "2048",
      "4096",
      "8192",
      "16384",
      "32768",
      "65536",
    ])
    .transform(Number);

  // Composite & Union Type Definitions
  export const AnyAddress = z.union([
    UnicastAddress,
    GroupAddress,
    SpecialGroupAddress,
    AllNodesAddress,
    UUID,
  ]);
  export const GroupAddressOrLabelUUID = z.union([GroupAddress, UUID]);
  export const ParentAddress = z.union([GroupAddressOrLabelUUID, UnassignedAddress]);
  export const ModelId = z.union([
    z.string().regex(/^[0-9a-fA-F]{4}$/),
    z.string().regex(/^[0-9a-fA-F]{8}$/),
  ]);

  // Object Schema Definitions
  export const Publish = z
    .object({
      address: AnyAddress,
      index: KeyIndex,
      ttl: z.union([Ttl, TtlDefault]),
      period: z.object({
        numberOfSteps: z.number().int().min(0).max(63),
        resolution: z.enum(["100", "1000", "10000", "600000"]).transform(Number),
      }),
      retransmit: z
        .object({
          count: z.number().int().min(0).max(7),
          interval: z.number().int(),
        })
        .strict(),
      credentials: Credentials,
    })
    .strict();

  export const Subscribe = z.array(z.union([GroupAddress, SpecialGroupAddress, UUID]));
  export const Bind = z.array(KeyIndex);

  export const Model = z
    .object({
      modelId: ModelId,
      subscribe: Subscribe,
      publish: Publish.optional(),
      bind: Bind,
    })
    .strict();

  export const Group = z
    .object({
      name: z.string(),
      address: GroupAddressOrLabelUUID,
      parentAddress: ParentAddress,
    })
    .strict();

  export const Element = z
    .object({
      index: ElementIndex,
      location: Identifier,
      name: z.string().optional(),
      models: z.array(Model),
    })
    .strict();

  export const AppKey = z
    .object({
      name: z.string(),
      index: KeyIndex,
      boundNetKey: KeyIndex,
      key: Key,
      oldKey: Key.optional(),
    })
    .strict();

  export const NodeKey = z
    .object({
      index: KeyIndex,
      updated: z.boolean(),
    })
    .strict();

  export const NetKey = z
    .object({
      name: z.string(),
      index: KeyIndex,
      key: Key,
      oldKey: Key.optional(),
      minSecurity: SecurityLevel,
      phase: KeyRefreshPhase,
      timestamp: Timestamp.optional(),
    })
    .strict();

  export const NetworkRetransmit = z
    .object({
      count: z.number().int().min(0).max(7),
      interval: z.number().int(),
    })
    .strict();

  export const HeartbeatPublication = z
    .object({
      address: z.union([UnicastAddress, GroupAddress, SpecialGroupAddress, AllNodesAddress]),
      period: HeartbeatPeriod,
      ttl: Ttl,
      index: KeyIndex,
      features: z.array(z.enum(["relay", "proxy", "friend", "lowPower"])),
    })
    .strict();

  export const HeartbeatSubscription = z
    .object({
      source: UnicastAddress,
      destination: z.union([UnicastAddress, GroupAddress, SpecialGroupAddress, AllNodesAddress]),
    })
    .strict();

  export const Node = z
    .object({
      UUID: UUID,
      name: z.string().optional(),
      unicastAddress: UnicastAddress,
      security: SecurityLevel,
      deviceKey: Key.optional(),
      cid: Identifier.optional(),
      vid: Identifier.optional(),
      pid: Identifier.optional(),
      crpl: Identifier.optional(),
      features: z
        .object({
          relay: FeatureState.optional(),
          proxy: FeatureState.optional(),
          friend: FeatureState.optional(),
          lowPower: FeatureState.optional(),
        })
        .strict()
        .optional(),
      elements: z.array(Element).min(1),
      configComplete: z.boolean(),
      netKeys: z.array(NodeKey).min(1),
      appKeys: z.array(NodeKey),
      secureNetworkBeacon: z.boolean().optional(),
      defaultTTL: Ttl.optional(),
      networkTransmit: NetworkRetransmit.optional(),
      relayRetransmit: NetworkRetransmit.optional(),
      excluded: z.boolean(),
      heartbeatPub: HeartbeatPublication.optional(),
      heartbeatSub: HeartbeatSubscription.optional(),
    })
    .strict();

  export const Provisioner = z
    .object({
      provisionerName: z.string(),
      UUID: UUID,
      allocatedGroupRange: z
        .array(
          z
            .object({
              highAddress: GroupAddress,
              lowAddress: GroupAddress,
            })
            .strict(),
        )
        .min(1),
      allocatedUnicastRange: z
        .array(
          z
            .object({
              highAddress: UnicastAddress,
              lowAddress: UnicastAddress,
            })
            .strict(),
        )
        .min(1),
      allocatedSceneRange: z.array(
        z
          .object({
            firstScene: Identifier,
            lastScene: Identifier,
          })
          .strict(),
      ),
    })
    .strict();

  export const Scene = z
    .object({
      name: z.string(),
      addresses: z.array(UnicastAddress),
      number: Identifier,
    })
    .strict();

  export const ExclusionList = z
    .object({
      ivIndex: z.number().int(),
      addresses: z.array(UnicastAddress).min(1),
    })
    .strict();

  // Main Schema
  export const MeshConfigurationDatabase = z
    .object({
      $schema: z.string(),
      id: z.string(),
      version: z.string(),
      meshName: z.string(),
      meshUUID: UUID,
      timestamp: Timestamp,
      netKeys: z.array(NetKey).min(1),
      appKeys: z.array(AppKey),
      provisioners: z.array(Provisioner).min(1),
      nodes: z.array(Node),
      groups: z.array(Group),
      scenes: z.array(Scene),
      networkExclusions: z.array(ExclusionList).optional(),
      partial: z.boolean().default(false),
    })
    .strict();
}
