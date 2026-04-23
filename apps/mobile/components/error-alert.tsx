import { Button } from "heroui-native/button";
import { Dialog } from "heroui-native/dialog";
import { View } from "react-native";

export type ErrorAlertProps = {
  message: string;
  title: string;
  onCancel?: () => void;
  disableCancel?: boolean;
};

export function ErrorAlert({
  message,
  title,
  onCancel,
  disableCancel,
}: ErrorAlertProps) {
  return (
    <Dialog
      isOpen
      onOpenChange={(v) => (!v && onCancel ? onCancel() : undefined)}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="mt-1">{message}</Dialog.Description>
          <View className="flex-row justify-end mt-4">
            <Button
              variant="ghost"
              size="sm"
              isDisabled={disableCancel}
              onPress={onCancel}
            >
              Cancel
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
