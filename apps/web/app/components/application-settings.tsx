import {
  Button,
  ButtonGroup,
  Card,
  Disclosure,
  DisclosureGroup,
  Input,
  Label,
  Separator,
  Spinner,
  Surface,
  TextField,
  toast,
} from "@heroui/react";
import {
  BookOpen,
  Check,
  Github,
  Moon,
  PackageSearch,
  RefreshCcw,
  Settings2,
  Share,
  Sun,
} from "lucide-react";
import { useMesh } from "./mesh-provider";
import { useImmer } from "use-immer";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toastError } from "../helpers/error";
import { KeyEditor } from "./key-editor";
import { useControlStore } from "../hooks/useControl";
import { useTheme } from "next-themes";
import { uint8ArrayToString } from "uint8array-extras";

export const ApplicationSettings = observer(() => {
  const mesh = useMesh();
  const { theme, setTheme } = useTheme();
  const { reset } = useControlStore();
  const [networkName, setNetworkName] = useImmer(mesh.meshNetwork?.meshName || "");
  const [expandedSettings, setExpandedSettings] = useState(new Set<string | number>());
  const resetMutation = useMutation({
    mutationFn: () => {
      reset();
      return mesh.reset();
    },
    onSuccess: () => {
      toast("Network reset", { variant: "success" });
    },
    onError: (error) => {
      console.error(error);
      toastError(error);
    },
  });
  const updateNameMutation = useMutation({
    mutationFn: mesh.updateMeshNetwork.bind(mesh),
    onSuccess: () => {
      toast("Network name updated", { variant: "success" });
    },
    onError: (error) => {
      console.error(error);
      toastError(error);
    },
  });
  const exportMutation = useMutation({
    onSuccess: () => {
      toast("Network exported", { variant: "success" });
    },
    onError: (error) => {
      console.error(error);
      toastError(error);
    },
    mutationFn: async () => {
      const data = await mesh.export();
      if (!data) return toast("No data to export", { variant: "warning" });
      console.log("Exported data:", data, uint8ArrayToString(data));
      const json = uint8ArrayToString(data);
      const blob = new Blob([json], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${mesh.meshNetwork?.meshName ?? "mesh-network"}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    },
  });

  useEffect(() => {
    setNetworkName(mesh.meshNetwork?.meshName || "");
  }, [mesh.meshNetwork?.meshName, setNetworkName]);

  return (
    <Card>
      <Card.Header>
        <Card.Title className="font-semibold">BLEMeshJS SDK DASHBOARD</Card.Title>
        <Card.Description className="flex items-center gap-2 text-xs">
          Provision and control Bluetooth Mesh networks directly from your browser.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <Settings2 size={14} />
          Application Settings
        </h2>
        <ButtonGroup>
          <Button
            size="sm"
            className="flex-1"
            variant={theme === "light" ? "primary" : "secondary"}
            onPress={() => setTheme("light")}
          >
            <Sun size={14} />
          </Button>
          <Button
            size="sm"
            className="flex-1"
            variant={theme === "dark" ? "primary" : "secondary"}
            onPress={() => setTheme("dark")}
          >
            <Moon size={14} />
          </Button>
        </ButtonGroup>
        <Separator className="my-2" />
        <DisclosureGroup onExpandedChange={setExpandedSettings} expandedKeys={expandedSettings}>
          <Disclosure id="meshNetwork">
            <Disclosure.Heading>
              <Button
                slot="trigger"
                variant={expandedSettings.has("meshNetwork") ? "secondary" : "tertiary"}
                className="w-full bg-transparent"
              >
                Mesh Network
                <Disclosure.Indicator className="text-muted" />
              </Button>
            </Disclosure.Heading>
            <Disclosure.Content>
              <Surface variant="secondary" className={`rounded-xl p-2.5`}>
                <div className="flex gap-2 flex-col">
                  <TextField>
                    <Label className="text-muted">Network Name</Label>
                    <div className="flex gap-2">
                      <Input
                        value={networkName}
                        className="min-w-0 flex-1"
                        onChange={(event) => {
                          setNetworkName(event.target.value);
                        }}
                        placeholder="Network name"
                      />
                      <Button
                        onPress={() => {
                          updateNameMutation.mutate({ meshName: networkName });
                        }}
                        isDisabled={
                          updateNameMutation.isPending ||
                          !networkName.trim() ||
                          networkName === mesh.meshNetwork?.meshName
                        }
                      >
                        {updateNameMutation.isPending ? (
                          <Spinner color="current" />
                        ) : (
                          <Check size={24} />
                        )}
                      </Button>
                    </div>
                  </TextField>
                  <ButtonGroup variant="secondary">
                    <Button
                      variant="danger-soft"
                      isPending={resetMutation.isPending || exportMutation.isPending}
                      onPress={() => resetMutation.mutate()}
                    >
                      {resetMutation.isPending ? <Spinner color="current" /> : <RefreshCcw />}
                    </Button>
                    <Button
                      variant="secondary"
                      isDisabled={resetMutation.isPending || exportMutation.isPending}
                      onPress={() => exportMutation.mutate()}
                    >
                      {exportMutation.isPending ? <Spinner color="current" /> : <Share />}
                    </Button>
                  </ButtonGroup>
                </div>
              </Surface>
            </Disclosure.Content>
          </Disclosure>
          <Separator className="my-2" />
          <Disclosure id="netKeys">
            <Disclosure.Heading>
              <Button
                slot="trigger"
                variant={expandedSettings.has("netKeys") ? "secondary" : "tertiary"}
                className="w-full bg-transparent"
              >
                Network Keys ({mesh.networkKeys.length})
                <Disclosure.Indicator className="text-muted" />
              </Button>
            </Disclosure.Heading>
            <Disclosure.Content>
              <Surface variant="secondary" className={`rounded-xl p-2.5`}>
                <KeyEditor
                  type="network"
                  title="Network Keys"
                  label="network key"
                  onAddKey={(key) => mesh.addNetworkKey(key)}
                  removeKey={(key) => mesh.removeNetworkKey(key)}
                  values={mesh.networkKeys}
                />
              </Surface>
            </Disclosure.Content>
          </Disclosure>
          <Separator className="my-2" />
          <Disclosure id="appKeys">
            <Disclosure.Heading>
              <Button
                slot="trigger"
                variant={expandedSettings.has("appKeys") ? "secondary" : "tertiary"}
                className="w-full bg-transparent"
              >
                Application Keys ({mesh.applicationKeys.length})
                <Disclosure.Indicator className="text-muted" />
              </Button>
            </Disclosure.Heading>
            <Disclosure.Content>
              <Surface variant="secondary" className={`rounded-xl p-2.5`}>
                <KeyEditor
                  type="application"
                  title="Application Keys"
                  label="app key"
                  values={mesh.applicationKeys}
                  onAddKey={(key) => mesh.addApplicationKey(key)}
                  removeKey={(key) => mesh.removeApplicationKey(key)}
                />
              </Surface>
            </Disclosure.Content>
          </Disclosure>
        </DisclosureGroup>
      </Card.Content>
      <Card.Footer className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onPress={() => window.open("https://github.com", "_blank", "noopener,noreferrer")}
        >
          <Github size={14} />
          GitHub
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onPress={() => window.open("https://www.npmjs.com", "_blank", "noopener,noreferrer")}
        >
          <PackageSearch size={14} />
          NPM
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onPress={() => window.open("https://mesh-link.dev/docs", "_blank", "noopener,noreferrer")}
        >
          <BookOpen size={14} />
          Docs
        </Button>
      </Card.Footer>
    </Card>
  );
});
