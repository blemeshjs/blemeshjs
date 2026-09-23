import { AppText } from "@/components/app-text";
import { ListItemProps } from "@/components/list-item";
import { useMesh } from "@/components/mesh-provider";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { useRouter } from "expo-router";
import {
  cn,
  ListGroup,
  PressableFeedback,
  Separator,
  Switch,
} from "heroui-native";
import { ChevronRightIcon } from "lucide-react-native";
import { observer } from "mobx-react-lite";
import { Fragment, useCallback, useMemo } from "react";
import { withUniwind } from "uniwind";

const StyledChevronRightIcon = withUniwind(ChevronRightIcon);

export default observer(function ProxyScreen() {
  const router = useRouter();
  const mesh = useMesh();
  const connectedTo = useMemo(() => {
    return mesh.connection.isOpen
      ? (mesh.connection.name ?? "UnknownDevice")
      : mesh.connection.isConnectionAutomatic
        ? "Connecting..."
        : "Not selected";
  }, [
    mesh.connection.isConnectionAutomatic,
    mesh.connection.isOpen,
    mesh.connection.name,
  ]);
  const setAutoConnect = useCallback(
    (checked: boolean) => {
      mesh.connection.isConnectionAutomatic = checked;
    },
    [mesh.connection],
  );

  const sections = useMemo<{ title: string; data: ListItemProps[] }[]>(
    () => [
      {
        title: "",
        data: [
          {
            title: "Automatic Connection",
            hideArrow: true,
            disabled: true,
            renderRight: () => (
              <Switch
                isSelected={mesh.connection.isConnectionAutomatic}
                onSelectedChange={setAutoConnect}
              />
            ),
          },
          {
            title: "Proxy",
            rightText: connectedTo,
            disabled: mesh.connection.isConnectionAutomatic,
            onPress: () => {
              const navigate = router.navigate;
              navigate("./select-proxy");
            },
          },
          {
            title: "",
            hideArrow: true,
            disabled: true,
            renderRight: () => (
              <PressableFeedback
                isDisabled={
                  !mesh.connection.isOpen ||
                  mesh.connection.isConnectionAutomatic
                }
                onPress={() => {
                  void mesh.connection.close();
                }}
              >
                <AppText
                  className={cn("text-danger", {
                    "text-muted":
                      !mesh.connection.isOpen ||
                      mesh.connection.isConnectionAutomatic,
                  })}
                >
                  Disconnect
                </AppText>
              </PressableFeedback>
            ),
          },
        ],
      },
      {
        title: "Proxy Filter",
        data: [
          {
            title: "Filter Type",
            hideArrow: true,
          },
        ],
      },
    ],
    [
      setAutoConnect,
      connectedTo,
      mesh.connection,
      mesh.connection.isConnectionAutomatic,
      mesh.connection.isOpen,
      router.navigate,
    ],
  );

  return (
    <MySafeAreaScrollView className="flex-1">
      {sections.map((section, idx) => (
        <Fragment key={"section" + idx}>
          {section.title && (
            <AppText className="text-muted font-bold p-2 text-md">
              {section.title}
            </AppText>
          )}
          <ListGroup key={"section" + idx} variant="secondary" className="mx-2">
            {section.data.map((item, index) => (
              <Fragment key={"item" + index}>
                <ListGroup.Item onPress={item.onPress}>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle>{item.title}</ListGroup.ItemTitle>
                    {item.subtitle && (
                      <ListGroup.ItemDescription className="text-xs">
                        {item.subtitle}
                      </ListGroup.ItemDescription>
                    )}
                  </ListGroup.ItemContent>
                  {(item.rightText || !item.hideArrow || item.renderRight) && (
                    <ListGroup.ItemSuffix className="flex-row items-center gap-1">
                      {item.renderRight ? (
                        item.renderRight()
                      ) : (
                        <>
                          {item.rightText && (
                            <AppText className="text-sm text-muted">
                              {item.rightText}
                            </AppText>
                          )}
                          {!item.hideArrow && (
                            <StyledChevronRightIcon className="text-muted" />
                          )}
                        </>
                      )}
                    </ListGroup.ItemSuffix>
                  )}
                </ListGroup.Item>
                {index !== section.data.length - 1 && (
                  <Separator className="mx-4" />
                )}
              </Fragment>
            ))}
          </ListGroup>
        </Fragment>
      ))}
    </MySafeAreaScrollView>
  );
});
