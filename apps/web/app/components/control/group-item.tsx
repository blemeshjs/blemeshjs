import { useControlStore } from "@/app/hooks/useControl";
import { Surface, Button, toast } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { observer } from "mobx-react-lite";
import { toastError } from "@/app/helpers/error";
import { useMutation } from "@tanstack/react-query";
import { useMesh } from "../mesh-provider";

export const GroupItem = observer(() => {
  const mesh = useMesh();
  const { selectedGroup, setSelectedGroup } = useControlStore();
  const groupMutation = useMutation({
    mutationFn: async (type: "remove-group") => {
      if (!selectedGroup) throw new Error("No group selected");
      switch (type) {
        case "remove-group":
          return mesh.removeGroup(selectedGroup).then(() => setSelectedGroup(undefined));
      }
    },
    onSuccess: (_data, type) => {
      switch (type) {
        case "remove-group":
          toast("Success", { variant: "success", description: "Group removed" });
          break;
      }
    },
    onError: (error) => {
      console.error(error);
      toastError(error);
    },
  });

  if (!selectedGroup) return null;

  return (
    <Surface variant="default" className="min-w-0 rounded-xl p-3">
      <div className="flex w-full min-w-0 flex-wrap justify-between gap-2">
        <div className="min-w-0 flex gap-2 flex-col">
          <p className="text-xs text-muted">Name: {selectedGroup.groupName}</p>
          <p className="text-xs text-muted">Address: 0x{selectedGroup.groupAddress}</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-2">
          <Button
            size="sm"
            onPress={() => groupMutation.mutate("remove-group")}
            variant="danger-soft"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </Surface>
  );
});
