import { ApplicationKey } from "@blemeshjs/core";
import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { CheckIcon, KeyIcon } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import { Fragment, useCallback, useEffect } from "react";
import { withUniwind } from "uniwind";
import { useImmer } from "use-immer";
import { Alert, AlertDialog } from "@/components/my-alert";
import { View } from "react-native";
import { AppText } from "@/components/app-text";
import { Separator } from "heroui-native/separator";
import { Button } from "heroui-native/button";
import { ListGroup } from "heroui-native/list-group";
import { uint8ArrayToHex } from "uint8array-extras";

const StyledKeyIcon = withUniwind(KeyIcon);
const StyledCheckIcon = withUniwind(CheckIcon);

export default observer(function ModelBindAppKey() {
  // properties
  const navigation = useNavigation();
  const mesh = useMesh();
  const local = useLocalSearchParams<{
    element: string;
    node: string;
    model: string;
  }>();
  const model = mesh.getModel(
    local.node,
    parseInt(local.element),
    parseInt(local.model),
  );
  const router = useRouter();

  // state
  const [alert, setAlert] = useImmer<null | Alert>(null);
  const [selectedAppKey, setSelectedAppKey] = useImmer<ApplicationKey | null>(null);

  // actions
  const bindKey = useCallback(() => {
    if (!selectedAppKey) return;
    setAlert({
      title: "Status",
      message: "Binding application key...",
    });
    if (!model) return;
    model
      .bindApplicationKey(selectedAppKey)
      .then(() => {
        setAlert(null);
        router.dismiss();
      })
      .catch((err) => {
        setAlert({
          title: "Error",
          message: err.message,
        });
      });
  }, [router, selectedAppKey, setAlert, model]);

  // effects
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          isDisabled={!selectedAppKey}
          onPress={bindKey}
          isIconOnly
          size="sm"
          variant="ghost"
        >
          <StyledCheckIcon className="text-foreground" />
        </Button>
      ),
    });
  }, [bindKey, navigation, selectedAppKey]);

  return (
    <MySafeAreaScrollView contentContainerClassName="gap-4 flex-1">
      {alert && (
        <AlertDialog open alert={alert} onClose={() => setAlert(null)} />
      )}
      {!!model?.applicationKeys.length && (
        <ListGroup variant="secondary" className="mx-2">
          {model?.applicationKeys.map((appKey, idx, arr) => (
            <Fragment key={uint8ArrayToHex(appKey.key)}>
              <ListGroup.Item onPress={() => setSelectedAppKey(appKey)}>
                <ListGroup.ItemPrefix>
                  <StyledKeyIcon size={20} className="text-muted" />
                </ListGroup.ItemPrefix>
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle>{appKey.name}</ListGroup.ItemTitle>
                  <ListGroup.ItemDescription>
                    {appKey.boundNetworkKey.name}
                  </ListGroup.ItemDescription>
                </ListGroup.ItemContent>
                {selectedAppKey?.index === appKey.index && (
                  <ListGroup.ItemSuffix>
                    <StyledCheckIcon className="text-accent" />
                  </ListGroup.ItemSuffix>
                )}
              </ListGroup.Item>
              {idx < arr.length - 1 && <Separator className="mx-2" />}
            </Fragment>
          ))}
        </ListGroup>
      )}
      {!model?.applicationKeys.length && (
        <View className="flex flex-1 flex-col items-center justify-center gap-4">
          <StyledKeyIcon size={64} className="text-muted" />
          <AppText className="text-center text-accent font-bold text-md">
            No keys available
          </AppText>
          <AppText className="text-center text-muted">
            Add a new key to the node first.
          </AppText>
        </View>
      )}
    </MySafeAreaScrollView>
  );
});
