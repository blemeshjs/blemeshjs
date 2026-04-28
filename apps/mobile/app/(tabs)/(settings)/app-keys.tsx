import { useMesh } from "@/components/mesh-provider";
import { Alert, AlertDialog } from "@/components/my-alert";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { useRouter } from "expo-router";
import { Input } from "heroui-native/input";
import { Dialog } from "heroui-native/dialog";
import { observer } from "mobx-react-lite";
import { Fragment, useCallback, useEffect, useMemo } from "react";
import { useImmer } from "use-immer";
import { Button } from "heroui-native/button";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { KeyIcon, TrashIcon } from "lucide-react-native";
import { AppText } from "@/components/app-text";
import { DialogBlurBackdrop } from "@/components/dialog-blur-view";
import { ListGroup } from "heroui-native/list-group";
import { uint8ArrayToHex } from "uint8array-extras";
import { Separator } from "heroui-native/separator";
import { ApplicationKey } from "@blemeshjs/core";

const StyledKeyIcon = withUniwind(KeyIcon);
const StyledTrashIcon = withUniwind(TrashIcon);

const GenerateAppKeyDialog = ({
  onClose,
  isOpen,
  onOk,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOk: (numberOfKeys: number) => void;
}) => {
  const [value, setValue] = useImmer("");
  const isValid = useMemo(
    () =>
      Number.isSafeInteger(parseInt(value))
        ? parseInt(value) > 0 && parseInt(value) <= 5
        : false,
    [value],
  );
  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <Dialog.Portal>
        <DialogBlurBackdrop />
        <Dialog.Content className="gap-4">
          <Dialog.Title>Generate keys</Dialog.Title>
          <Dialog.Description>
            Specify number of application keys to generate (max 5):
          </Dialog.Description>
          <Input
            value={value}
            onChangeText={(val) => setValue(val)}
            keyboardType="decimal-pad"
            variant="secondary"
            placeholder="E.g. 3"
          />
          <View className="flex flex-row gap-2">
            <Button variant="danger" className="w-1/2" onPress={onClose}>
              Cancel
            </Button>
            <Button
              isDisabled={!isValid}
              onPress={() => onOk(parseInt(value))}
              className="w-1/2"
            >
              Ok
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

export default observer(function AppKeysScreen() {
  // properties
  const mesh = useMesh();
  const router = useRouter();
  const hasAppKeys = useMemo(
    () => mesh.applicationKeys.length > 0,
    [mesh.applicationKeys.length],
  );

  // state
  const [alert, setAlert] = useImmer<null | Alert>(null);
  const [showGenerateAppKeyDialog, setShowGenerateAppKeyDialog] =
    useImmer(false);

  // actions
  const onAddTapped = useCallback(() => {
    if (mesh.networkKeyExists) {
    } else {
      setAlert({
        title: "Error",
        message: `No Network Key found.\n\nCreate a Network Key prior to creating an Application Key.`,
        actions: [
          {
            label: "Create",
            variant: "default",
            onPress: () => router.push("/(tabs)/(settings)/network-keys"),
          },
          {
            label: "Cancel",
            variant: "destructive",
            onPress: () => setAlert(null),
          },
        ],
      });
    }
  }, [mesh.networkKeyExists, router, setAlert]);

  const generate = useCallback(
    (numberOfKeys: number) => {
      setShowGenerateAppKeyDialog(false);
      const addApplicationKeys = mesh.addApplicationKeys;
      const error = addApplicationKeys(numberOfKeys);
      if (error) {
        setAlert({
          title: "Error",
          message: error.message,
        });
      }
    },
    [mesh.addApplicationKeys, setAlert, setShowGenerateAppKeyDialog],
  );

  const deleteKey = useCallback(
    (key: ApplicationKey) => {
      const deleteApplicationKey = mesh.removeApplicationKeyAt;
      deleteApplicationKey(key.index).catch((err) => {
        setAlert({
          title: "Error",
          message: err.message,
        });
      });
    },
    [mesh.removeApplicationKeyAt, setAlert],
  );

  // effects
  useEffect(() => {}, []);

  return (
    <MySafeAreaScrollView contentContainerClassName="gap-4 flex-1">
      <GenerateAppKeyDialog
        isOpen={showGenerateAppKeyDialog}
        onClose={() => setShowGenerateAppKeyDialog(false)}
        onOk={generate}
      />
      {alert && (
        <AlertDialog open alert={alert} onClose={() => setAlert(null)} />
      )}
      {!!mesh.applicationKeys.length && (
        <>
          <AppText className="text-muted font-bold mx-4 mt-2 text-md">
            Configured Keys
          </AppText>
          <ListGroup variant="secondary" className="mx-2">
            {mesh.applicationKeys.map((appKey, idx, arr) => (
              <Fragment key={uint8ArrayToHex(appKey.key)}>
                <ListGroup.Item key={uint8ArrayToHex(appKey.key)}>
                  <ListGroup.ItemPrefix>
                    <StyledKeyIcon size={20} className="text-muted" />
                  </ListGroup.ItemPrefix>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle>{appKey.name}</ListGroup.ItemTitle>
                    <ListGroup.ItemDescription>
                      {appKey.boundNetworkKey.name}
                    </ListGroup.ItemDescription>
                  </ListGroup.ItemContent>
                  <ListGroup.ItemSuffix>
                    <Button
                      onPress={() => deleteKey(appKey)}
                      isIconOnly
                      size="sm"
                      variant="ghost"
                    >
                      <StyledTrashIcon className="text-danger" />
                    </Button>
                  </ListGroup.ItemSuffix>
                </ListGroup.Item>
                {idx < arr.length - 1 && <Separator className="mx-2" />}
              </Fragment>
            ))}
          </ListGroup>
        </>
      )}
      {!hasAppKeys && (
        <View className="flex flex-1 flex-col items-center justify-center gap-4">
          <StyledKeyIcon size={64} className="text-muted" />
          <AppText className="text-center text-accent font-bold text-md">
            No keys
          </AppText>
          <AppText className="text-center text-muted">
            Click + to add a new key.
          </AppText>
          <Button onPress={() => setShowGenerateAppKeyDialog(true)}>
            Generate
          </Button>
        </View>
      )}
    </MySafeAreaScrollView>
  );
});
