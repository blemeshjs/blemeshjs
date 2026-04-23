import { AppText } from "@/components/app-text";
import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { useRouter } from "expo-router";
import { Switch } from "heroui-native/switch";
import { ListGroup } from "heroui-native/list-group";
import { ChevronRightIcon } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { withUniwind } from "uniwind";
import { Button } from "heroui-native/button";
import { useImmer } from "use-immer";
import { ErrorAlert, ErrorAlertProps } from "@/components/error-alert";
import { Popover } from "heroui-native/popover";
import { observer } from "mobx-react-lite";
import { Separator } from "heroui-native/separator";

const StyledChevronRightIcon = withUniwind(ChevronRightIcon);

export default observer(function SettingsScreen() {
  // properties
  const router = useRouter();
  const mesh = useMesh();

  // state
  const [errorAlert, setErrorAlert] = useImmer<ErrorAlertProps | null>(null);
  const [showResetPopover, setShowResetPopover] = useImmer(false);

  useEffect(() => {
    if (!mesh.isNetworkCreated) {
      router.navigate("/wizard");
    }
  }, [mesh.isNetworkCreated, router]);

  const resetNetwork = useCallback(() => {
    const resetNetwork = mesh.reset;
    setShowResetPopover(false);
    resetNetwork().catch((error) => {
      setErrorAlert({
        message: "Failed to reset mesh network: " + error.message,
        title: "Error",
      });
    });
  }, [mesh.reset, setErrorAlert, setShowResetPopover]);

  return (
    <MySafeAreaScrollView contentContainerClassName="gap-4">
      {errorAlert && <ErrorAlert {...errorAlert} />}
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Name</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">
        Network Settings
      </AppText>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Provisioners</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item onPress={() => router.push("/network-keys")}>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Network Keys</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item onPress={() => router.push("/app-keys")}>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Application Keys</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Scenes</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>IV Index</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>IV Update Test Mode</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Switch />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Last Modified</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <AppText className="text-sm text-muted">
              16. Apr 2025 at 17:45:21
            </AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Reset Mesh Network</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Popover
              isOpen={showResetPopover}
              onOpenChange={setShowResetPopover}
            >
              <Popover.Trigger asChild>
                <Button variant="ghost" size="sm">
                  <AppText className="text-danger">Forget Network</AppText>
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Overlay />
                <Popover.Content
                  width="trigger"
                  className="gap-2 min-w-[240px]"
                  presentation="popover"
                  placement="left"
                >
                  <Popover.Arrow />
                  <Popover.Close />
                  <Popover.Title>Reset Network</Popover.Title>
                  <Popover.Description>
                    Resetting the network will erase all network data. Make sure
                    you exported it first.
                  </Popover.Description>
                  <Button variant="danger" onPress={resetNetwork}>
                    Reset
                  </Button>
                </Popover.Content>
              </Popover.Portal>
            </Popover>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">
        Developer Settings
      </AppText>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Quick Provisioning</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Switch />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Always Reconfigure</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Switch />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">
        About
      </AppText>
      <ListGroup variant="secondary" className="mx-2 mb-10">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Application Version</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <AppText className="text-sm text-muted">1.0.0</AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Build Number</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <AppText className="text-sm text-muted">3</AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Report an Issue</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
    </MySafeAreaScrollView>
  );
});
