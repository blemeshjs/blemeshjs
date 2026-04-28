import { AppText } from "@/components/app-text";
import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ListGroup } from "heroui-native/list-group";
import { Separator } from "heroui-native/separator";
import { ChevronRightIcon, KeyIcon, TrashIcon } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import { Fragment, useEffect } from "react";
import { uint8ArrayToHex } from "uint8array-extras";
import { withUniwind } from "uniwind";
import { GenericOnOffCell } from "./model/generic-on-off-cell";
import { Alert, AlertDialog } from "@/components/my-alert";
import { useImmer } from "use-immer";
import { Button } from "heroui-native/button";
import { ApplicationKey } from "@blemeshjs/core";

const StyledChevronRightIcon = withUniwind(ChevronRightIcon);
const StyledTrashIcon = withUniwind(TrashIcon);
const StyledKeyIcon = withUniwind(KeyIcon);

export default observer(function ModelScreen() {
  // properties
  const navigation = useNavigation();
  const mesh = useMesh();
  const router = useRouter();
  const local = useLocalSearchParams<{
    element: string;
    node: string;
    model: string;
  }>();
  const model = mesh.getModel(local.node, parseInt(local.element), parseInt(local.model));

  // state
  const [alert, setAlert] = useImmer<null | Alert>(null);

  // actions
  const deleteKey = (appKey: ApplicationKey) => {
    setAlert({ title: "Status", message: "Unbinding Application Key..." });
    model
      ?.unbindApplicationKey(appKey.name)
      .then(() => setAlert(null))
      .catch((error) => {
        setAlert({ title: "Error", message: error.message });
      });
  };

  // effects
  useEffect(() => {
    navigation.setOptions({
      title: model?.name,
    });
  }, [model?.name, navigation]);

  return (
    <MySafeAreaScrollView contentContainerClassName="gap-4">
      {alert && <AlertDialog open alert={alert} onClose={() => setAlert(null)} />}
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">Model Information</AppText>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Model ID</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">
              0x{model?.modelId.toString(16).padStart(4, "0")}
            </AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Company</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">{model?.companyName}</AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Related Models</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">{model?.relatedModels.length}</AppText>
            <StyledChevronRightIcon className="text-muted" />
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">Bound Application Keys</AppText>
      <ListGroup variant="secondary" className="mx-2">
        {model?.boundApplicationKeys.map((key) => (
          <Fragment key={uint8ArrayToHex(key.key)}>
            <ListGroup.Item>
              <ListGroup.ItemPrefix>
                <StyledKeyIcon size={20} className="text-muted" />
              </ListGroup.ItemPrefix>
              <ListGroup.ItemContent>
                <ListGroup.ItemTitle>{key.name}</ListGroup.ItemTitle>
                <ListGroup.ItemDescription>{key.boundNetworkKey.name}</ListGroup.ItemDescription>
              </ListGroup.ItemContent>
              <ListGroup.ItemSuffix>
                <Button onPress={() => deleteKey(key)} isIconOnly size="sm" variant="ghost">
                  <StyledTrashIcon className="text-danger" />
                </Button>
              </ListGroup.ItemSuffix>
            </ListGroup.Item>
            <Separator className="mx-2" />
          </Fragment>
        ))}
        <ListGroup.Item
          onPress={() =>
            router.push(
              `/(tabs)/(network)/configuration/${local.node}/${local.element}/${local.model}/model-bind-app-key`,
            )
          }
        >
          <ListGroup.ItemContent>
            <AppText className="text-accent">Bind Application Key</AppText>
          </ListGroup.ItemContent>
        </ListGroup.Item>
      </ListGroup>
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">Publication</AppText>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <AppText className="text-accent">Set Publication</AppText>
          </ListGroup.ItemContent>
        </ListGroup.Item>
      </ListGroup>
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">Subscriptions</AppText>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemContent>
              <AppText className="text-accent">Subscribe</AppText>
            </ListGroup.ItemContent>
          </ListGroup.ItemContent>
        </ListGroup.Item>
      </ListGroup>
      <GenericOnOffCell model={model} setAlert={setAlert} />
    </MySafeAreaScrollView>
  );
});
