import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { KeyIcon, PlusIcon } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import { Fragment, useEffect, useMemo } from "react";
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
const StyledPlusIcon = withUniwind(PlusIcon);

export default observer(function NodeNetworkKeysScreen() {
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
  const [alert, setAlert] = useImmer<null | Alert>(null);

  // effects
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={() =>
            router.push(
              `/(tabs)/(network)/configuration/${local.node}/node-add-network-key`,
            )
          }
        >
          <StyledPlusIcon className="text-foreground" />
        </Button>
      ),
    });
  }, [local.node, navigation, router]);

  return (
    <MySafeAreaScrollView contentContainerClassName="gap-4 flex-1">
      {alert && (
        <AlertDialog open alert={alert} onClose={() => setAlert(null)} />
      )}
      {(node?.networkKeys.length ?? 0 > 0) && (
        <ListGroup variant="secondary" className="mx-2">
          {node?.networkKeys.map((netKey, idx, arr) => (
            <Fragment key={uint8ArrayToHex(netKey.key)}>
              <ListGroup.Item key={uint8ArrayToHex(netKey.key)}>
                <ListGroup.ItemPrefix>
                  <StyledKeyIcon size={20} className="text-muted" />
                </ListGroup.ItemPrefix>
                <ListGroup.ItemContent>
                  <AppText className="text-md">{netKey.name}</AppText>
                </ListGroup.ItemContent>
              </ListGroup.Item>
              {idx < arr.length - 1 && <Separator className="mx-2" />}
            </Fragment>
          ))}
        </ListGroup>
      )}
      {!node?.networkKeys.length && (
        <View className="flex flex-1 flex-col items-center justify-center gap-4">
          <StyledKeyIcon size={64} className="text-muted" />
          <AppText className="text-center text-accent font-bold text-md">
            No keys
          </AppText>
          <AppText className="text-center text-muted">
            Click + to add a new key.
          </AppText>
        </View>
      )}
    </MySafeAreaScrollView>
  );
});
