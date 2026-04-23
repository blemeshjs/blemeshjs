import { Button, Disclosure, DisclosureGroup, Separator, Surface } from "@heroui/react";
import { GenericOnOffController } from "../models/generic-on-off";
import { KeyListEditor } from "./key-list-editor";
import { useControlStore } from "@/app/hooks/useControl";
import { useState } from "react";
import { observer } from "mobx-react-lite";

export const NodeModel = observer(() => {
  const { selectedModel } = useControlStore();
  const [expandedModelOptions, setExpandedModelOptions] = useState(
    new Set<string | number>("controls"),
  );
  if (!selectedModel) return null;
  return (
    <Surface variant="default" className="flex flex-col min-w-0 rounded-xl p-3 space-y-2">
      <div className="text-xs text-muted">
        <p>Name: {selectedModel.name ?? `Model ${selectedModel.modelId}`}</p>
      </div>
      <DisclosureGroup
        expandedKeys={expandedModelOptions}
        onExpandedChange={setExpandedModelOptions}
      >
        <Separator className="my-2" />
        <Disclosure id="controls">
          <Disclosure.Heading>
            <Button
              slot="trigger"
              variant={expandedModelOptions.has("controls") ? "secondary" : "tertiary"}
              className="w-full bg-transparent"
            >
              Controls
              <Disclosure.Indicator className="text-muted" />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            {selectedModel.isGenericOnOffServer && <GenericOnOffController />}
          </Disclosure.Content>
        </Disclosure>
        <Separator className="my-2" />
        <Disclosure id="modelAppKeys">
          <Disclosure.Heading>
            <Button
              slot="trigger"
              variant={expandedModelOptions.has("models") ? "secondary" : "tertiary"}
              className="w-full bg-transparent"
            >
              Model App Keys ({selectedModel.boundApplicationKeys.length})
              <Disclosure.Indicator className="text-muted" />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            <KeyListEditor
              keys={selectedModel.boundApplicationKeys}
              options={selectedModel.applicationKeys}
              onRefresh={() => null}
              onAdd={(value) => selectedModel.bindApplicationKey(value)}
              onRemove={(value) => selectedModel.unbindApplicationKey(value)}
            />
          </Disclosure.Content>
        </Disclosure>
        <Separator className="my-2" />
      </DisclosureGroup>
    </Surface>
  );
});
