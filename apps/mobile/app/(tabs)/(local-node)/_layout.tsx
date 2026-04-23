import { ThemeToggle } from "@/components/theme-toggle";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native/hooks";

export default function LocalNodeLayout() {
  const accent = useThemeColor("accent");
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: true,
        headerTintColor: accent,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Local Node",
          headerTransparent: true,
          headerRight: () => <ThemeToggle />,
        }}
      />
    </Stack>
  );
}
