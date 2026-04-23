import { toastError } from "@/app/helpers/error";
import { Select, ListBox, Button, Label, Surface, Spinner } from "@heroui/react";
import { Key } from "@mesh-link-js/utils";
import { useMutation } from "@tanstack/react-query";
import { RefreshCcw, Plus, KeyIcon, Trash2 } from "lucide-react";
import { uint8ArrayToHex } from "uint8array-extras";
import { useImmer } from "use-immer";

type KeyListEditorProps<T extends Key = Key> = {
  keys: T[];
  options: T[];
  onRefresh: () => void;
  onAdd: (value: T) => Promise<unknown>;
  onRemove: (value: T) => Promise<unknown>;
  emptyText?: string;
};

export function KeyListEditor<T extends Key>({
  keys,
  options,
  emptyText,
  onAdd,
  onRefresh,
  onRemove,
}: KeyListEditorProps<T>) {
  const [selected, setSelected] = useImmer<number | null>(null);
  const addMutation = useMutation({
    mutationFn: onAdd,
    onSettled: () => {
      setSelected(null);
    },
    onError: toastError,
  });
  const removeMutation = useMutation({
    mutationFn: onRemove,
    onError: toastError,
  });
  return (
    <Surface variant="tertiary" className=" rounded-xl p-2">
      <div className="flex flex-row items-end gap-2">
        <Select
          selectionMode="multiple"
          placeholder="Select one"
          onChange={(value) => {
            setSelected(Number(value[0]));
          }}
          className="w-[200px]"
          aria-label="select key to add"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox aria-label="key options">
              {options.map((option) => (
                <ListBox.Item
                  key={option.index.valueOf()}
                  id={option.index.valueOf()}
                  textValue={option.name}
                >
                  {option.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <Button onPress={onRefresh} size="sm" variant="ghost">
          <RefreshCcw size={14} />
        </Button>
        <Button
          isDisabled={selected === null}
          isPending={addMutation.isPending}
          onPress={() => {
            const option = options.find((o) => o.index.valueOf() === selected);
            if (!option) return;
            addMutation.mutate(option);
          }}
          size="sm"
          variant="primary"
        >
          {addMutation.isPending ? <Spinner color="current" /> : <Plus size={14} />}
        </Button>
      </div>

      {keys.length === 0 ? (
        <p className="text-center text-sm text-muted">{emptyText ?? "No keys added."}</p>
      ) : (
        <ListBox aria-label="key list">
          {keys.map((key) => (
            <ListBox.Item
              className="flex items-center gap-2"
              key={key.index.valueOf()}
              id={key.index.valueOf()}
              textValue={key.name}
            >
              <KeyIcon size={14} className="text-accent" />

              <div className="flex flex-col flex-1 overflow-hidden">
                <Label className="truncate">{key.name}</Label>
                <span className="text-xs text-muted truncate">{uint8ArrayToHex(key.key)}</span>
              </div>
              <Button
                onPress={() => removeMutation.mutate(key)}
                isPending={removeMutation.isPending}
                size="sm"
                variant="danger-soft"
              >
                {removeMutation.isPending ? <Spinner color="current" /> : <Trash2 size={14} />}
              </Button>
            </ListBox.Item>
          ))}
        </ListBox>
      )}
    </Surface>
  );
}
