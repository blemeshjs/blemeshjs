import { Button, Dialog } from "heroui-native";
import React, { useEffect } from "react";
import { View } from "react-native";
import { DialogBlurBackdrop } from "./dialog-blur-view";

export type AlertAction = {
  label: string;
  onPress?: () => void;
  variant?: "default" | "destructive" | "cancel";
  disabled?: boolean;
};

export type Alert = {
  message: string;
  title: string;
  actions?: AlertAction[];
  cancelable?: boolean;
  completion?: () => void;
};

export const AlertDialog = ({
  open,
  alert,
  onClose,
}: {
  open: boolean;
  alert: Alert | null;
  onClose: () => void;
}) => {
  useEffect(() => {
    const completion = alert?.completion;
    completion?.();
  }, [alert?.completion]);

  if (!alert) return null;

  const handleAction = (action?: () => void) => {
    action?.();
    onClose();
  };

  const actions = alert.actions ?? [
    { label: "OK", variant: "default" as const, onPress: () => onClose() },
  ];

  const getVariant = (variant?: string) => {
    if (variant === "destructive") return "danger" as const;
    return "ghost" as const;
  };

  return (
    <Dialog isOpen={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>{alert.title}</Dialog.Title>
          <Dialog.Description className="mt-1">
            {alert.message}
          </Dialog.Description>
          <View className="flex-row justify-end gap-2 mt-4">
            {actions.map((btn, i) => (
              <Button
                key={i}
                size="sm"
                variant={getVariant(btn.variant)}
                isDisabled={btn.disabled}
                onPress={() => handleAction(btn.onPress)}
              >
                {btn.label}
              </Button>
            ))}
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
