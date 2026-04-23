import { useControlStore } from "@/app/hooks/useControl";
import { Surface, Button, DisclosureGroup, Separator, toast, Link } from "@heroui/react";
import { Cpu, RotateCcw, Trash2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import { uint8ArrayToHex } from "uint8array-extras";
import { NodeElements } from "./node-elements";
import { NodeKeys } from "./node-keys";
import { toastError } from "@/app/helpers/error";
import { useMutation } from "@tanstack/react-query";
import { CompanyIdentifier, toPaddedHex16 } from "@mesh-link-js/utils";

export const NodeItem = observer(() => {
  const { selectedNode, setSelectedNode, expandedKeys, setExpandedKeys } = useControlStore();
  const nodeMutation = useMutation({
    mutationFn: async (type: "get-comp-data" | "get-def-ttl" | "reset") => {
      if (!selectedNode) throw new Error("No node selected");
      switch (type) {
        case "get-comp-data":
          return selectedNode.getCompositionData();
        case "get-def-ttl":
          return selectedNode.getTtl();
        case "reset":
          return selectedNode.reset().then(() => setSelectedNode(undefined));
      }
    },
    onSuccess: (_data, type) => {
      switch (type) {
        case "get-comp-data":
          toast("Success", { variant: "success", description: "Read Composition data" });
          break;
        case "get-def-ttl":
          toast("Success", { variant: "success", description: "Read default TTL" });
          break;
        case "reset":
          toast("Success", { variant: "success", description: "Node Reset Successful " });
          break;
      }
    },
    onError: (error) => {
      console.error(error);
      toastError(error);
    },
  });

  if (!selectedNode) return null;

  return (
    <Surface variant="default" className="min-w-0 rounded-xl p-3">
      <div className="flex w-full min-w-0 flex-wrap justify-between gap-2">
        <div className="min-w-0 flex gap-2 flex-col">
          <p className="text-xs text-muted">Name: {selectedNode.name}</p>
          <p className="text-xs text-muted">Node ID: 0x{selectedNode.uuid.hex}</p>
          <p className="text-xs text-muted">Address: 0x{selectedNode.primaryUnicastAddress.hex}</p>
          <p className="text-xs text-muted">
            Device Key: 0x
            {selectedNode.deviceKey ? uint8ArrayToHex(selectedNode.deviceKey) : ""}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted">
              Default TTL:{" "}
              {selectedNode.defaultTtl !== undefined ? selectedNode.defaultTtl : "Unknown"}
            </p>
            <Link onPress={() => nodeMutation.mutate("get-def-ttl")} className="text-xs">
              Refresh
            </Link>
          </div>
          <p className="text-xs text-muted">
            Company Identifier:{" "}
            {selectedNode.companyIdentifier !== undefined
              ? `0x${toPaddedHex16(selectedNode.companyIdentifier)} - ${CompanyIdentifier.nameForId(selectedNode.companyIdentifier)}`
              : "unknown"}
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-2">
          <Button
            onPress={() => nodeMutation.mutate("get-comp-data")}
            size="sm"
            variant="secondary"
          >
            <Cpu size={14} />
            Get Composition Data
          </Button>
          <Button
            onPress={() => nodeMutation.mutate("reset")}
            size="sm"
            isPending={nodeMutation.isPending}
            variant="danger"
          >
            <RotateCcw size={14} />
          </Button>
          <Button size="sm" variant="danger-soft">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <DisclosureGroup expandedKeys={expandedKeys} onExpandedChange={setExpandedKeys}>
        <NodeElements />
        <Separator className="my-2" />
        <NodeKeys />
      </DisclosureGroup>
    </Surface>
  );
});
