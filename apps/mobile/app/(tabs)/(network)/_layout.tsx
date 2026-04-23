import { useMesh } from "@/components/mesh-provider";
import { Stack, useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { PlusIcon, XIcon } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { withUniwind } from "uniwind";

const StyledXIcon = withUniwind(XIcon);
const SytylePlusIcon = withUniwind(PlusIcon);

function CloseModalRoute() {
  const router = useRouter();
  return (
    <Button onPress={() => router.back()} isIconOnly size="sm" variant="ghost">
      <StyledXIcon className="text-foreground" />
    </Button>
  );
}

function NetworkIndexHeaderRight() {
  const router = useRouter();
  return (
    <>
      <Button
        onPress={() => router.navigate("/provisioning/scanner")}
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <SytylePlusIcon className="text-foreground" />
      </Button>
      <Button size="sm" variant="ghost" onPress={() => {}}>
        Update
      </Button>
    </>
  );
}

export default function NetworkLayout() {
  const router = useRouter();
  const mesh = useMesh();
  const presentNewNetworkWizard = useCallback(() => {
    router.navigate("/(tabs)/(settings)");
  }, [router]);

  useEffect(() => {
    // If the network has not been loaded (first run), open the New Network Wizard.
    if (!mesh.isNetworkCreated) {
      presentNewNetworkWizard();
    }
  }, [mesh.isNetworkCreated, presentNewNetworkWizard]);

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
          title: "Network",
          headerTransparent: true,
          headerRight: () => <NetworkIndexHeaderRight />,
        }}
      />
      <Stack.Screen
        name="configuration/[node]/node"
        options={{
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="configuration/[node]/node-network-keys"
        options={{
          title: "Network Keys",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="configuration/[node]/node-add-network-key"
        options={{
          title: "Add Network Key",
          headerTransparent: true,
          presentation: "modal",
          headerLeft: () => <CloseModalRoute />,
        }}
      />
      <Stack.Screen
        name="configuration/[node]/node-app-keys"
        options={{
          title: "Application Keys",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="configuration/[node]/node-add-app-key"
        options={{
          title: "Add Application Key",
          headerTransparent: true,
          presentation: "modal",
          headerLeft: () => <CloseModalRoute />,
        }}
      />
      <Stack.Screen
        name="configuration/[node]/[element]/element"
        options={{
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="configuration/[node]/[element]/[model]/model"
        options={{
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="configuration/[node]/[element]/[model]/model-bind-app-key"
        options={{
          title: "Bind Application Key",
          headerTransparent: true,
          gestureEnabled: false,
          presentation: "modal",
          headerLeft: () => <CloseModalRoute />,
        }}
      />
      <Stack.Screen
        name="provisioning"
        options={{
          presentation: "modal",
          gestureEnabled: false,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
