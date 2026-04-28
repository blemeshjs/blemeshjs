import { AppText } from "@/components/app-text";
import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaView } from "@/components/my-safe-area-view";
import { useNavigation, useRouter } from "expo-router";
import { Tabs } from "heroui-native/tabs";
import { Button } from "heroui-native/button";
import { CheckIcon } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { useImmer } from "use-immer";
import { withUniwind } from "uniwind";
import { ErrorAlert, ErrorAlertProps } from "@/components/error-alert";

interface TabTriggerProps {
  value: string;
  label: string;
}
const TabTrigger = ({ value, label }: TabTriggerProps) => {
  return (
    <Tabs.Trigger value={value}>
      <Tabs.Label className="text-xs">{label}</Tabs.Label>
    </Tabs.Trigger>
  );
};

export default function Wizard() {
  const navigation = useNavigation();
  const router = useRouter();
  const [errorAlert, setErrorAlert] = useImmer<ErrorAlertProps | null>(null);
  const mesh = useMesh();
  const [activeTab, setActiveTab] = useState("empty");

  const createNewNetwork = useCallback(async () => {
    try {
      // TODO: set keys etc
      const createNewMeshNetwork = mesh.createNewMeshNetwork;
      await createNewMeshNetwork();
      router.back();
    } catch (error) {
      console.error("Error creating new mesh network", error);
      setErrorAlert({
        title: "Error",
        message: "Mesh configuration could not be saved.",
        onCancel: () => {
          setErrorAlert(null);
        },
      });
    }
  }, [mesh, router, setErrorAlert]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return <WizardHeaderRight onCreate={createNewNetwork} />;
      },
    });
  }, [createNewNetwork, navigation]);

  return (
    <MySafeAreaView className="flex-1 px-4 items-center justify-center gap-4">
      {errorAlert && <ErrorAlert {...errorAlert} />}
      <AppText className="text-accent font-bold text-md">Welcome</AppText>
      <AppText className="text-center text-muted">
        BLEMeshJS allows to provision, configure and control Bluetooth mesh
        devices.
      </AppText>
      <AppText className="text-muted">
        Start by creating a new mesh network.
      </AppText>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5">
        <Tabs.List>
          <Tabs.Indicator />
          <TabTrigger value="empty" label="Empty" />
          <TabTrigger value="custom" label="Custom" />
          <TabTrigger value="debug" label="Debug" />
          <TabTrigger value="import" label="Import" />
        </Tabs.List>
        <Tabs.Content value="empty"></Tabs.Content>
        <Tabs.Content value="custom"></Tabs.Content>
        <Tabs.Content value="debug"></Tabs.Content>
        <Tabs.Content value="import"></Tabs.Content>
      </Tabs>
    </MySafeAreaView>
  );
}

const StyledCheckIcon = withUniwind(CheckIcon);
function WizardHeaderRight({ onCreate }: { onCreate: () => void }) {
  return (
    <Button onPress={onCreate} isIconOnly size="sm" variant="ghost">
      <StyledCheckIcon className="text-foreground" />
    </Button>
  );
}
