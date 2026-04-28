import {
  Surface,
  ListBox,
  Label,
  Button,
  TextField,
  Input,
  Header,
  Text,
  toast,
} from "@heroui/react";
import { Crypto, NewKey } from "@blemeshjs/sdk-web";
import { KeyIcon, Trash2, Plus } from "lucide-react";
import { useMemo, useEffect } from "react";
import { uint8ArrayToHex, hexToUint8Array } from "uint8array-extras";
import { useImmer } from "use-immer";
import { useMesh } from "./mesh-provider";
import { Key } from "@blemeshjs/utils";
import { useMutation } from "@tanstack/react-query";
import { toastError } from "../helpers/error";

type KeyEditorProps = {
  title: string;
  label: string;
  type: "application" | "network";
  values: Key[];
  onAddKey: (key: NewKey) => Promise<void>;
  removeKey: (key: Key) => Promise<void>;
};

export function KeyEditor({ type, title, label, values, removeKey, onAddKey }: KeyEditorProps) {
  const mesh = useMesh();
  const keyIndex = useMemo(() => {
    if (type === "network") return mesh.nextAvailableNetworkKeyIndex.valueOf();
    return mesh.nextAvailableApplicationKeyIndex.valueOf();
  }, [mesh.nextAvailableApplicationKeyIndex, mesh.nextAvailableNetworkKeyIndex, type]);
  const keyPrefix = type === "network" ? "Network Key" : "App Key";
  const [name, setName] = useImmer(`${keyPrefix} ${keyIndex + 1}`);
  const [key, setKey] = useImmer(uint8ArrayToHex(Crypto.generateKey()));
  const addMutation = useMutation({
    mutationFn: onAddKey,
    onSuccess: () => {
      toast("Key added", { variant: "success" });
    },
    onError: (error) => {
      console.error(error);
      toastError(error);
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeKey,
    onSuccess: () => {
      toast("Key removed", { variant: "success" });
    },
    onError: (error) => {
      console.error(error);
      toastError(error);
    },
  });

  useEffect(() => {
    setName(`${keyPrefix} ${keyIndex + 1}`);
  }, [keyIndex, keyPrefix, setName]);

  return (
    <Surface variant="secondary" className={`rounded-xl p-2.5 space-y-3`}>
      {values.length === 0 ? (
        <p className="text-sm text-muted">No items yet.</p>
      ) : (
        <ListBox aria-label={title} selectionMode="none">
          {values.map((item, index) => (
            <ListBox.Item
              key={`${label}-${index}`}
              id={`${label}-${index}`}
              textValue={item.name}
              className="flex items-center gap-2"
            >
              <KeyIcon size={14} className="text-accent" />
              <div className="flex flex-col flex-1 overflow-hidden">
                <Label>{item.name}</Label>
                <span className="text-xs text-muted truncate">{uint8ArrayToHex(item.key)}</span>
              </div>
              <Button
                variant="danger-soft"
                size="sm"
                onPress={() => {
                  removeMutation.mutate(item);
                }}
              >
                <Trash2 size={14} />
              </Button>
            </ListBox.Item>
          ))}
        </ListBox>
      )}

      <div className="flex flex-col min-w-0 gap-2">
        <TextField>
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            className="min-w-0 flex-1"
            placeholder="Name"
          />
        </TextField>
        <TextField>
          <Label>Key</Label>
          <Input
            value={key}
            onChange={(event) => {
              setKey(event.target.value);
            }}
            className="min-w-0 flex-1"
            placeholder="Key"
          />
        </TextField>
        <TextField>
          <Label>Old Key</Label>
          <Input className="min-w-0 flex-1" disabled placeholder="N/A" />
        </TextField>
        <TextField>
          <Label>Key Index</Label>
          <Input className="min-w-0 flex-1" disabled value={keyIndex.valueOf()} />
        </TextField>
        {type === "application" && (
          <ListBox selectionMode="single" aria-label="key-list">
            <ListBox.Section>
              <Header>Bound Network Key</Header>
              {mesh.networkKeys.map((netKey) => (
                <ListBox.Item
                  key={uint8ArrayToHex(netKey.key)}
                  id={uint8ArrayToHex(netKey.key)}
                  textValue={uint8ArrayToHex(netKey.key)}
                >
                  <Text className="flex-1" size="sm">
                    {netKey.name}
                  </Text>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox.Section>
          </ListBox>
        )}
        <Button
          onClick={() => {
            addMutation.mutate({
              index:
                type === "application"
                  ? mesh.nextAvailableApplicationKeyIndex
                  : mesh.nextAvailableNetworkKeyIndex,
              key: hexToUint8Array(key),
              name,
            });
            setKey(uint8ArrayToHex(Crypto.generateKey()));
          }}
          variant="primary"
          size="sm"
        >
          <Plus size={14} />
          Add
        </Button>
      </div>
    </Surface>
  );
}
