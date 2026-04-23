import { Stack } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { FolderIcon } from "lucide-react-native";
import { withUniwind } from "uniwind";

const StyledFolderIcon = withUniwind(FolderIcon);
function SettingsHeaderRight() {
  return (
    <Button isIconOnly size="sm" variant="ghost">
      <StyledFolderIcon className="text-foreground" />
    </Button>
  );
}

export default function SettingsLayout() {
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
          title: "Settings",
          headerTransparent: true,
          headerRight: () => <SettingsHeaderRight />,
        }}
      />
      <Stack.Screen
        name="wizard"
        options={{
          title: "Mesh Link JS",
          presentation: "modal",
          gestureEnabled: false,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="network-keys"
        options={{
          title: "Network Keys",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="app-keys"
        options={{
          title: "Application Keys",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="edit-key"
        options={{
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
