import { AppText } from "@/components/app-text";
import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { uint8ArrayToHex } from "uint8array-extras";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { Button } from "heroui-native/button";
import { ListGroup } from "heroui-native/list-group";
import { Popover } from "heroui-native/popover";
import { Separator } from "heroui-native/separator";
import { Switch } from "heroui-native/switch";
import { ChevronRightIcon } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import { Fragment, useCallback, useMemo } from "react";
import { withUniwind } from "uniwind";
import { useImmer } from "use-immer";
import { Alert, AlertDialog } from "@/components/my-alert";
import { cn } from "heroui-native";
import { CompanyIdentifier } from "@blemeshjs/utils";

const StyledChevronRightIcon = withUniwind(ChevronRightIcon);

export default observer(function NodeScreen() {
  // properties
  const mesh = useMesh();
  const local = useLocalSearchParams<{ node: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const node = useMemo(() => {
    const getNode = mesh.getNode;
    return getNode(local.node);
  }, [local.node, mesh.getNode]);

  // state
  const [showResetPopover, setShowResetPopover] = useImmer(false);
  const [alert, setAlert] = useImmer<null | Alert>(null);

  // effects
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: node?.name ?? "Node Details",
      });
    }, [navigation, node?.name]),
  );
  useFocusEffect(
    useCallback(() => {
      if (node?.isCompositionDataReceived && node?.defaultTtl !== undefined)
        return;
      setAlert({ title: "Status", message: "Discovering node information..." });
      const discover = node?.discover;
      discover?.()
        .then(() => setAlert(null))
        .catch((err) => {
          setAlert({ title: "Error", message: err.message });
        });
    }, [
      node?.defaultTtl,
      node?.discover,
      node?.isCompositionDataReceived,
      setAlert,
    ]),
  );

  const resetNode = useCallback(() => {
    setShowResetPopover(false);
    setAlert({
      title: "Status",
      message: "Resetting node...",
    });
    node
      ?.reset()
      .then(() => {
        router.dismissTo("/(tabs)/(network)");
        setAlert(null);
      })
      .catch((error) => {
        setAlert({
          title: "Error",
          message: error.message,
        });
      });
  }, [node, router, setAlert, setShowResetPopover]);

  return (
    <MySafeAreaScrollView contentContainerClassName="gap-4">
      {alert && (
        <AlertDialog open alert={alert} onClose={() => setAlert(null)} />
      )}
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Name</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">{node?.name ?? "No Name"}</AppText>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Unicast Address</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">
              0x{node?.primaryUnicastAddress.hex}
            </AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Default TTL</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">{`${node?.defaultTtl ?? "Unknown"}`}</AppText>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Device Key</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-1 flex-row items-center">
            <AppText className="text-muted" numberOfLines={1}>
              {node?.deviceKey
                ? uint8ArrayToHex(node?.deviceKey)
                : "Unknown Device Key"}
            </AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item
          onPress={() =>
            router.push(
              `/(tabs)/(network)/configuration/${local.node}/node-network-keys`,
            )
          }
        >
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Network Keys</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">{node?.networkKeys.length}</AppText>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item
          onPress={() =>
            router.push(
              `/(tabs)/(network)/configuration/${local.node}/node-app-keys`,
            )
          }
        >
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Application Keys</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">
              {node?.applicationKeys.length}
            </AppText>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Scenes</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">0</AppText>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">
        Elements
      </AppText>
      <ListGroup variant="secondary" className="mx-2">
        {node?.elements.map((element, idx, arr) => (
          <Fragment key={element.index}>
            <ListGroup.Item
              onPress={() =>
                router.push(
                  `/(tabs)/(network)/configuration/${local.node}/${element.index}/element`,
                )
              }
              disabled={!node.isCompositionDataReceived}
            >
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle
                  className={cn({
                    "text-muted": !node.isCompositionDataReceived,
                  })}
                >
                  {node.isCompositionDataReceived
                    ? (element.name ?? `Element ${element.index + 1}`)
                    : "Composition Data not received"}
                </ListGroup.ItemTitle>
              </ListGroup.ItemContent>
              {node.isCompositionDataReceived && (
                <ListGroup.ItemSuffix className="flex flex-row items-center">
                  <AppText className="text-muted">
                    {element.models.length} models
                  </AppText>
                  <StyledChevronRightIcon className="text-muted" />
                </ListGroup.ItemSuffix>
              )}
            </ListGroup.Item>
            {idx !== arr.length - 1 && <Separator className="mx-2" />}
          </Fragment>
        ))}
      </ListGroup>
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">
        Node information
      </AppText>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Company Identifier</ListGroup.ItemTitle>
            <ListGroup.ItemDescription className="text-muted">
              {CompanyIdentifier.nameForId(node?.companyIdentifier)}
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Product Identifier</ListGroup.ItemTitle>
            <ListGroup.ItemDescription className="text-muted">
              Unknown
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Product Version</ListGroup.ItemTitle>
            <ListGroup.ItemDescription className="text-muted">
              Unknown
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Replay Protection Count</ListGroup.ItemTitle>
            <ListGroup.ItemDescription className="text-muted">
              32767
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Features</ListGroup.ItemTitle>
            <ListGroup.ItemDescription className="text-muted">
              {`Relay: Not Supported\nProxy: Not Supported\nFriend: Not Supported\nLow Power: Not Supported`}
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Security</ListGroup.ItemTitle>
            <ListGroup.ItemDescription className="text-muted">
              Secure
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="text-muted"></ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Configured</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Switch />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Excluded</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Switch />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <ListGroup variant="secondary" className="mx-2 mb-10">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Reset Node</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Popover
              isOpen={showResetPopover}
              onOpenChange={setShowResetPopover}
            >
              <Popover.Trigger asChild>
                <Button variant="ghost" size="sm">
                  <AppText className="text-danger">Reset</AppText>
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
                  <Popover.Title>Reset Node</Popover.Title>
                  <Popover.Description>
                    Resetting the node will change its state back to
                    unprovisioned state and remove it from the local database.
                  </Popover.Description>
                  <Button variant="danger" onPress={resetNode}>
                    Reset
                  </Button>
                </Popover.Content>
              </Popover.Portal>
            </Popover>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Remove Node</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix>
            <Button variant="ghost" size="sm">
              <AppText className="text-sm text-danger">Remove</AppText>
            </Button>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
    </MySafeAreaScrollView>
  );
});
