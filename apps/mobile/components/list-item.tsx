import { PressableFeedback, Surface, useThemeColor } from "heroui-native";
import { ChevronRightIcon, LucideIcon } from "lucide-react-native";
import React from "react";
import { PressableProps, Text, View } from "react-native";

export type ListItemProps = {
  hideArrow?: boolean;
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  rightText?: string;
  renderRight?: () => React.ReactNode;
} & PressableProps;

export const ListItem = ({
  title,
  rightText,
  subtitle,
  icon: IconComponent,
  renderRight,
  hideArrow,
  disabled,
  onPress,
  onLongPress,
  ...rest
}: ListItemProps) => {
  const mutedColor = useThemeColor("muted");
  return (
    <PressableFeedback
      onPress={onPress}
      onLongPress={onLongPress}
      isDisabled={disabled as boolean}
      animation={disabled ? false : undefined}
    >
      <Surface className="flex-row items-center gap-3 px-4 py-3 min-h-[56px] rounded-none">
        {!!IconComponent && (
          <IconComponent size={22} color={mutedColor} />
        )}
        <View className="flex-1 gap-0.5">
          <Text className="text-foreground text-sm font-medium">{title}</Text>
          {!!subtitle && (
            <Text style={{ color: mutedColor, fontSize: 12 }}>{subtitle}</Text>
          )}
        </View>
        {renderRight ? (
          renderRight()
        ) : rightText !== undefined ? (
          <View className="flex-row items-center gap-1">
            <Text style={{ color: mutedColor, fontSize: 14 }}>
              {rightText}
            </Text>
            {!hideArrow && (
              <ChevronRightIcon size={16} color={mutedColor} />
            )}
          </View>
        ) : hideArrow ? null : (
          <ChevronRightIcon size={16} color={mutedColor} />
        )}
      </Surface>
    </PressableFeedback>
  );
};
