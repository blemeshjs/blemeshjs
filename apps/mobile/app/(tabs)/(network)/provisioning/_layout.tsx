import { Stack, useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { ChevronLeftIcon, XIcon } from "lucide-react-native";
import { withUniwind } from "uniwind";

const StyledXIcon = withUniwind(XIcon);
const StyledChevronLeftIcon = withUniwind(ChevronLeftIcon);
function ScannerHeaderLeft() {
  const router = useRouter();
  return (
    <Button onPress={() => router.back()} isIconOnly size="sm" variant="ghost">
      <StyledXIcon className="text-foreground" />
    </Button>
  );
}

function ProvisioningHeaderLeft() {
  const router = useRouter();
  return (
    <Button onPress={() => router.back()} isIconOnly size="sm" variant="ghost">
      <StyledChevronLeftIcon className="text-foreground" />
    </Button>
  );
}

export default function ProvisioningLayout() {
  const accent = useThemeColor("accent");
  return (
    <Stack
      screenOptions={{
        headerLargeTitleEnabled: true,
        headerTintColor: accent,
      }}
    >
      <Stack.Screen
        name="scanner"
        options={{
          title: "Provision Device",
          headerTransparent: true,
          headerLeft: () => <ScannerHeaderLeft />,
        }}
      />
      <Stack.Screen
        name="provisioning"
        options={{
          title: "Device Capabilities",
          headerTransparent: true,
          headerLeft: () => <ProvisioningHeaderLeft />,
        }}
      />
    </Stack>
  );
}
