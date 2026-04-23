import { Stack, useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { PlusIcon, XIcon } from "lucide-react-native";
import { withUniwind } from "uniwind";

const StyledPlusIcon = withUniwind(PlusIcon);
const StyledXIcon = withUniwind(XIcon);

function ProxyAddButton() {
  const router = useRouter();
  return (
    <Button
      onPress={() => router.navigate("/select-proxy")}
      isIconOnly
      size="sm"
      variant="ghost"
      isDisabled
    >
      <StyledPlusIcon className="text-foreground" />
    </Button>
  );
}

function SelectProxyBackButton() {
  const router = useRouter();
  return (
    <Button
      onPress={() => router.back()}
      isIconOnly
      size="sm"
      variant="ghost"
      className="rounded-full"
    >
      <StyledXIcon className="text-foreground" />
    </Button>
  );
}

export default function ProxyLayout() {
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
          title: "Proxy",
          headerTransparent: true,
          headerRight: () => <ProxyAddButton />,
        }}
      />
      <Stack.Screen
        name="select-proxy"
        options={{
          title: "Select Proxy",
          presentation: "modal",
          gestureEnabled: false,
          headerTransparent: true,
          headerLeft: () => <SelectProxyBackButton />,
        }}
      />
    </Stack>
  );
}
