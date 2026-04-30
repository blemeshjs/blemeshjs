import { Button, Card, Description, Label, ListBox, Surface, Tabs, toast } from "@heroui/react";
import {
  BluetoothConnected,
  BluetoothOff,
  BluetoothSearching,
  Component,
  Search,
  Settings2,
  SlidersHorizontal,
  Unplug,
} from "lucide-react";
import { useMesh } from "./mesh-provider";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useControlStore } from "../hooks/useControl";
import { NodeItem } from "./control/node-item";
import { ProvisioningModal } from "./provisioning-modal";
import { AddGroupModal } from "./add-group-modal";
import { toastError } from "../helpers/error";
import { ScanError } from "@blemeshjs/sdk-web";
import { GroupItem } from "./control/group-item";
import { useSettingsStore } from "../hooks/useSettings";
import { FeatureTab } from "../types/settings";

export const ControlFlow = observer(() => {
  const mesh = useMesh();
  const { setFeatureTab, featureTab } = useSettingsStore();
  const [isProxyScanActive, setIsProxyScanActive] = useState(false);
  const { selectedNode, selectedGroup, setSelectedGroup, setSelectedNode } = useControlStore();

  useEffect(() => {
    const bindAllEvents = mesh.connection.bindAllEvents;
    const unbindAllEvents = bindAllEvents({
      "ble:error": (error) => {
        switch (true) {
          case error instanceof ScanError:
            toast.warning("Scan error", { description: error.message });
            break;
          default:
            toastError(error);
            break;
        }
      },
      "scan:new-proxy": (proxy) => {
        const connect = mesh.connection.connect;
        connect(proxy).catch((error) => {
          console.error("Failed to connect to proxy", error);
        });
      },
      "connection:status": (status) => {
        switch (status) {
          case "connecting":
          case "discovering-services":
          case "initializing":
            setIsProxyScanActive(true);
            break;
          case "connected":
          case "disconnected":
            setIsProxyScanActive(false);
            break;
        }
      },
    });
    return unbindAllEvents;
  }, [mesh.connection.bindAllEvents, mesh.connection.connect]);

  useEffect(() => {
    setSelectedNode(mesh.provisionerNode);
  }, [mesh.provisionerNode, setSelectedNode]);

  return (
    <Card>
      <Card.Header>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <SlidersHorizontal size={16} />
              Mesh Feature Studio
            </h2>
          </div>
          {isProxyScanActive ? (
            <BluetoothSearching className="text-warning" size={18} />
          ) : !!mesh.connection.isOpen ? (
            <BluetoothConnected className="text-accent" size={18} />
          ) : (
            <BluetoothOff className="text-danger" size={18} />
          )}
          <Button
            variant="primary"
            size="sm"
            onPress={() => mesh.connection.scan({})}
            isDisabled={isProxyScanActive || mesh.connection.isOpen}
          >
            <Search size={14} />
            Scan Proxy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onPress={() => mesh.connection.close()}
            isDisabled={!mesh.connection.isOpen}
          >
            <Unplug size={14} />
            Disconnect
          </Button>
        </div>
      </Card.Header>
      <Card.Content className="space-y-4">
        <Tabs
          selectedKey={featureTab}
          onSelectionChange={(value) => setFeatureTab(String(value) as FeatureTab)}
          variant="secondary"
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Mesh feature tabs" className="flex flex-wrap gap-2">
              <Tabs.Tab id="nodes" className="flex-1 gap-2 justify-center sm:min-w-[120px]">
                <Settings2 size={14} />
                Nodes
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="groups" className="flex-1 gap-2 justify-center sm:min-w-[120px]">
                <Component size={14} />
                Groups
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>

        {featureTab === "groups" && (
          <Surface variant="secondary" className="rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted">
                Configure available groups and group memberships. Select a group to view and manage
                its
              </p>
              <AddGroupModal />
            </div>
            {mesh.groups.length === 0 ? (
              <p className="text-sm text-muted">No groups available.</p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                <Surface variant="default" className="min-w-0 rounded-xl p-2">
                  <ListBox
                    aria-label="Group list"
                    selectionMode="single"
                    selectedKeys={selectedGroup ? [selectedGroup.groupAddress] : []}
                    onSelectionChange={(keys) => {
                      const [first] = Array.from(keys as Set<string>);
                      const group = mesh.getGroup(first);
                      if (!group) return;
                      setSelectedGroup(group);
                    }}
                  >
                    {mesh.groups.map((group) => (
                      <ListBox.Item
                        key={group.groupAddress}
                        id={group.groupAddress}
                        textValue={group.groupName}
                      >
                        <div className="flex flex-col min-w-0">
                          <Label>{group.groupName}</Label>
                          <Description>Address: 0x{group.groupAddress}</Description>
                        </div>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Surface>
                <GroupItem />
              </div>
            )}
          </Surface>
        )}

        {featureTab === "nodes" && (
          <Surface variant="secondary" className="rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted">
                Configure node-level defaults, element composition, and model publish-subscribe
                bindings.
              </p>
              <ProvisioningModal />
            </div>
            {mesh.allNodes.length === 0 ? (
              <p className="text-sm text-muted">No provisioned nodes available.</p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                <Surface variant="default" className="min-w-0 rounded-xl p-2">
                  <ListBox
                    aria-label="Node list"
                    selectionMode="single"
                    selectedKeys={selectedNode ? [selectedNode.uuid.uuidString] : []}
                    onSelectionChange={(keys) => {
                      const [first] = Array.from(keys as Set<string>);
                      const node = mesh.getNode(first);
                      if (!node) return;
                      setSelectedNode(node);
                    }}
                  >
                    {mesh.allNodes.map((node) => (
                      <ListBox.Item
                        key={node.uuid.uuidString}
                        id={node.uuid.uuidString}
                        textValue={node.name}
                      >
                        <div className="flex flex-col min-w-0">
                          <Label>{node.name}</Label>
                          <Description>Address: 0x{node.primaryUnicastAddress.hex}</Description>
                          <Description>Elements: {node.elementsCount}</Description>
                        </div>
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Surface>
                <NodeItem />
              </div>
            )}
          </Surface>
        )}
      </Card.Content>
    </Card>
  );
});
