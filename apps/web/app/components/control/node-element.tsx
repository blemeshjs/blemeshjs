import { useControlStore } from "@/app/hooks/useControl";
import { Button, Disclosure, DisclosureGroup, Tabs } from "@heroui/react";
import { Location } from "@mesh-link-js/utils";
import { NodeModel } from "./node-model";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useMesh } from "../mesh-provider";

export const NodeElement = observer(() => {
  const { selectedElement, selectedModel, setSelectedModel, selectedNode } = useControlStore();
  const mesh = useMesh();
  const [expandedModels, setExpandedModels] = useState(new Set<string | number>(["models"]));

  if (!selectedElement) return null;
  return (
    <>
      <div className="text-xs text-muted">
        <p>Name: {selectedElement.name ?? `Element ${selectedElement.index + 1}`}</p>
        <p>Index: {selectedElement.index}</p>
        <p>Address: 0x{selectedElement.unicastAddress.hex}</p>
        <p>Location: {Location.toString(selectedElement.location)}</p>
        <p>Models: {selectedElement.models.length}</p>
      </div>
      <DisclosureGroup expandedKeys={expandedModels} onExpandedChange={setExpandedModels}>
        <Disclosure id="models">
          <Disclosure.Heading>
            <Button
              slot="trigger"
              variant={expandedModels.has("models") ? "secondary" : "tertiary"}
              className="w-full bg-transparent"
            >
              Models ({selectedElement.models.length})
              <Disclosure.Indicator className="text-muted" />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            {selectedElement.models.length === 0 ? (
              <p className="text-sm text-muted">No models on this element.</p>
            ) : (
              <Tabs
                selectedKey={selectedModel?.modelId}
                key={selectedElement.models.map((model) => model.modelId).join(",")}
                onSelectionChange={(value) => {
                  const model = mesh.getModel(
                    selectedNode!.uuid.uuidString,
                    selectedElement.index,
                    Number(value),
                  );
                  if (!model) return;
                  setSelectedModel(model);
                }}
              >
                <Tabs.ListContainer>
                  <Tabs.List
                    aria-label={`Models of ${selectedElement.name}`}
                    className="flex flex-1"
                  >
                    {selectedElement.models.map((model) => (
                      <Tabs.Tab
                        key={model.modelId}
                        id={model.modelId}
                        className="whitespace-nowrap justify-center"
                      >
                        {model.name ?? `Model ${model.modelId}`}
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                </Tabs.ListContainer>
              </Tabs>
            )}
            <NodeModel />
          </Disclosure.Content>
        </Disclosure>
      </DisclosureGroup>
    </>
  );
});
