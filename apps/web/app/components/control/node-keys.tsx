import { Button, Disclosure, Separator } from "@heroui/react";
import { KeyListEditor } from "./key-list-editor";
import { useControlStore } from "@/app/hooks/useControl";
import { observer } from "mobx-react-lite";

export const NodeKeys = observer(() => {
  const { selectedNode, expandedKeys } = useControlStore();
  if (!selectedNode) return null;
  return (
    <>
      <Disclosure id="appKeys">
        <Disclosure.Heading>
          <Button
            slot="trigger"
            variant={expandedKeys.has("appKeys") ? "secondary" : "tertiary"}
            className="w-full bg-transparent"
          >
            Node App Keys ({selectedNode.applicationKeys.length})
            <Disclosure.Indicator className="text-muted" />
          </Button>
        </Disclosure.Heading>
        <Disclosure.Content>
          <KeyListEditor
            keys={selectedNode.applicationKeys}
            options={selectedNode.availableApplicationKeys}
            onRefresh={() => null}
            onAdd={(value) => selectedNode.addApplicationKey(value)}
            onRemove={(value) => selectedNode.removeApplicationKey(value)}
          />
        </Disclosure.Content>
      </Disclosure>
      <Separator className="my-2" />
      <Disclosure id="netKeys">
        <Disclosure.Heading>
          <Button
            slot="trigger"
            variant={expandedKeys.has("netKeys") ? "secondary" : "tertiary"}
            className="w-full bg-transparent"
          >
            Node Net Keys ({selectedNode.networkKeys.length})
            <Disclosure.Indicator className="text-muted" />
          </Button>
        </Disclosure.Heading>
        <Disclosure.Content>
          <KeyListEditor
            keys={selectedNode.networkKeys}
            options={[]}
            onRefresh={() => null}
            onAdd={(value) => selectedNode.addNetworkKey(value)}
            onRemove={(value) => selectedNode.removeNetworkKey(value)}
          />
        </Disclosure.Content>
      </Disclosure>
    </>
  );
});
