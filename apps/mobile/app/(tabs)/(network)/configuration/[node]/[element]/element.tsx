import { AppText } from "@/components/app-text";
import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { Location } from "@blemeshjs/utils";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ListGroup } from "heroui-native/list-group";
import { Separator } from "heroui-native/separator";
import { ChevronRightIcon } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import { Fragment, useEffect, useMemo } from "react";
import { withUniwind } from "uniwind";

const StyledChevronRightIcon = withUniwind(ChevronRightIcon);

export default observer(function ElementScreen() {
  // properties
  const mesh = useMesh();
  const local = useLocalSearchParams<{ element: string; node: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const element = mesh.getElement(local.node, parseInt(local.element));
  const name = useMemo(
    () => element?.name ?? `Element ${parseInt(local.element) + 1}`,
    [element?.name, local.element],
  );

  // effects
  useEffect(() => {
    navigation.setOptions({
      title: name,
    });
  }, [name, navigation]);

  return (
    <MySafeAreaScrollView contentContainerClassName="gap-4 flex-1">
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Name</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">{name}</AppText>
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
              0x{element?.unicastAddress.hex}
            </AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Location</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">
              {element?.location ? Location.toString(element?.location) : ""}
            </AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
      {element?.models.length ? (
        <>
          <AppText className="text-muted font-bold mx-4 mt-2 text-md">
            Models
          </AppText>
          <ListGroup variant="secondary" className="mx-2">
            {element.models.map((model, idx, arr) => (
              <Fragment key={model.modelId}>
                <ListGroup.Item
                  onPress={() =>
                    router.push(
                      `/(tabs)/(network)/configuration/${local.node}/${element.index}/${model.modelId}/model`,
                    )
                  }
                >
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle>{model.name}</ListGroup.ItemTitle>
                    <ListGroup.ItemDescription>
                      {model.companyName}
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix className="flex flex-row items-center">
                    <StyledChevronRightIcon className="text-muted" />
                  </ListGroup.ItemSuffix>
                </ListGroup.Item>
                {idx < arr.length - 1 && <Separator className="mx-2" />}
              </Fragment>
            ))}
          </ListGroup>
        </>
      ) : null}
    </MySafeAreaScrollView>
  );
});
