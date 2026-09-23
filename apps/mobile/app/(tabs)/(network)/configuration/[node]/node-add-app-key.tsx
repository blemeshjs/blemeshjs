import { ApplicationKey } from "@blemeshjs/core";
import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { CheckIcon, KeyIcon } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import { Fragment, useCallback, useEffect, useMemo } from "react";
import { withUniwind } from "uniwind";
import { useImmer } from "use-immer";
import { Alert, AlertDialog } from "@/components/my-alert";
import { View } from "react-native";
import { AppText } from "@/components/app-text";
import { Button } from "heroui-native/button";
import { ListGroup } from "heroui-native/list-group";
import { uint8ArrayToHex } from "uint8array-extras";
import { Separator } from "heroui-native/separator";

const StyledKeyIcon = withUniwind(KeyIcon);
const StyledCheckIcon = withUniwind(CheckIcon);

export default observer(function NodeAddAppKeyScreen() {
  // properties
  const mesh = useMesh();
  const local = useLocalSearchParams<{ node: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const node = useMemo(() => {
    const getNode = mesh.getNode;
    return getNode(local.node);
  }, [local.node, mesh.getNode]);
  const noKeysAvailable = useMemo(
    () =>
      !node?.applicationKeysWithKnownToNetworkKeys.length &&
      !node?.applicationKeysWithUnknownNetworkKeys.length,
    [
      node?.applicationKeysWithKnownToNetworkKeys.length,
      node?.applicationKeysWithUnknownNetworkKeys.length,
    ],
  );

  // state
  const [alert, setAlert] = useImmer<null | Alert>(null);
  const [selectedAppKey, setSelectedAppKey] = useImmer<ApplicationKey | null>(null);

  // actions
  const addKey = useCallback(() => {
    if (!selectedAppKey) return;
    setAlert({
      title: "Status",
      message: "Adding Application Key...",
    });
    node
      ?.addApplicationKey(selectedAppKey)
      .then(() => setAlert(null))
      .catch((error: Error) => {
        setAlert({ title: "Error", message: error.message });
      });
  }, [node, selectedAppKey, setAlert]);

  // effects
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={addKey}
          isDisabled={!selectedAppKey}
          isIconOnly
          size="sm"
          variant="ghost"
        >
          <StyledCheckIcon className="text-foreground" />
        </Button>
      ),
    });
  }, [addKey, navigation, router, selectedAppKey]);

  return (
    <MySafeAreaScrollView contentContainerClassName="gap-4 flex-1">
      {alert && (
        <AlertDialog open alert={alert} onClose={() => setAlert(null)} />
      )}
      {!!node?.applicationKeysWithKnownToNetworkKeys.length && (
        <>
          <AppText className="text-muted font-bold mx-4 mt-2 text-md">
            Keys bound to known subnets
          </AppText>
          <ListGroup variant="secondary" className="mx-2">
            {node?.applicationKeysWithKnownToNetworkKeys.map(
              (appKey, idx, arr) => (
                <Fragment key={uint8ArrayToHex(appKey.key)}>
                  <ListGroup.Item
                    onPress={() => setSelectedAppKey(appKey)}
                  >
                    <ListGroup.ItemPrefix>
                      <StyledKeyIcon size={20} className="text-muted" />
                    </ListGroup.ItemPrefix>
                    <ListGroup.ItemContent>
                      <AppText className="font-medium">{appKey.name}</AppText>
                    </ListGroup.ItemContent>
                    {selectedAppKey?.index === appKey.index && (
                      <ListGroup.ItemSuffix>
                        <StyledCheckIcon className="text-accent" />
                      </ListGroup.ItemSuffix>
                    )}
                  </ListGroup.Item>
                  {idx < arr.length - 1 && <Separator className="mx-2" />}
                </Fragment>
              ),
            )}
          </ListGroup>
        </>
      )}
      {!!node?.applicationKeysWithUnknownNetworkKeys.length && (
        <>
          <AppText className="text-muted font-bold mx-4 mt-2 text-md">
            Keys bound to other subnets
          </AppText>
          <ListGroup variant="secondary" className="mx-2">
            {node?.applicationKeysWithUnknownNetworkKeys.map(
              (appKey, idx, arr) => (
                <Fragment key={uint8ArrayToHex(appKey.key)}>
                  <ListGroup.Item key={uint8ArrayToHex(appKey.key)}>
                    <ListGroup.ItemPrefix>
                      <StyledKeyIcon size={20} className="text-muted" />
                    </ListGroup.ItemPrefix>
                    <ListGroup.ItemContent>
                      <AppText className="font-medium">{appKey.name}</AppText>
                    </ListGroup.ItemContent>
                  </ListGroup.Item>
                  {idx < arr.length - 1 && <Separator className="mx-2" />}
                </Fragment>
              ),
            )}
          </ListGroup>
        </>
      )}
      {noKeysAvailable && (
        <View className="flex flex-1 flex-col items-center justify-center gap-4">
          <StyledKeyIcon size={64} className="text-muted" />
          <AppText className="text-center text-accent font-bold text-md">
            No keys available
          </AppText>
          <AppText className="text-center text-muted">
            Go to Settings to create a new key, or add a bound Network Key
            first.
          </AppText>
          <Button
            onPress={() => {
              router.dismiss();
              router.push("/(tabs)/(settings)/app-keys");
            }}
          >
            Settings
          </Button>
        </View>
      )}
    </MySafeAreaScrollView>
  );
});
