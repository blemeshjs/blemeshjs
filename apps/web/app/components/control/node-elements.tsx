import { useControlStore } from "@/app/hooks/useControl";
import { Button, Disclosure, Surface, Tabs } from "@heroui/react";
import { NodeElement } from "./node-element";
import { observer } from "mobx-react-lite";
import { useMesh } from "../mesh-provider";

export const NodeElements = observer(() => {
  const mesh = useMesh();
  const { expandedKeys, selectedNode, selectedElement, setSelectedElement } = useControlStore();

  if (!selectedNode) return null;

  return (
    <Disclosure id="elements">
      <Disclosure.Heading>
        <Button
          slot="trigger"
          variant={expandedKeys.has("elements") ? "secondary" : "tertiary"}
          className="w-full bg-transparent"
        >
          Elements ({selectedNode.elements.length})
          <Disclosure.Indicator className="text-muted" />
        </Button>
      </Disclosure.Heading>
      <Disclosure.Content>
        <Surface variant="tertiary" className=" rounded-xl p-2">
          {selectedNode.elements.length === 0 ? (
            <p className="text-sm text-muted">No elements on this node.</p>
          ) : (
            <Tabs
              selectedKey={selectedElement?.index}
              key={selectedNode.elements.map((element) => element.index).join(",")}
              onSelectionChange={(value) => {
                const element = mesh.getElement(selectedNode.uuid.uuidString, Number(value));
                if (!element) return;
                setSelectedElement(element);
              }}
            >
              <Tabs.ListContainer>
                <Tabs.List
                  aria-label={`Elements of ${selectedNode.name}`}
                  className="flex flex-row gap-2"
                >
                  {selectedNode.elements.map((element, index) => (
                    <Tabs.Tab key={element.index} id={element.index} className="justify-center">
                      {element.name ?? `Element ${index + 1}`}
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  ))}
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          )}
          <NodeElement />
        </Surface>
      </Disclosure.Content>
    </Disclosure>
  );
});
