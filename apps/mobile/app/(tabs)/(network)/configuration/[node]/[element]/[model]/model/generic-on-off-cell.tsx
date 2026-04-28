import { AppText } from "@/components/app-text";
import { Alert } from "@/components/my-alert";
import { GenericOnOff } from "@blemeshjs/sdk-react-native";
import { RNModel } from "@blemeshjs/sdk-react-native/dist/src/model";
import { Button } from "heroui-native/button";
import { ListGroup } from "heroui-native/list-group";
import { Separator } from "heroui-native/separator";
import { Switch } from "heroui-native/switch";
import { useMemo, useState } from "react";
import { View } from "react-native";

type Props = {
  model?: RNModel;
  setAlert: (alert: null | Alert) => void;
};
export function GenericOnOffCell({ model, setAlert }: Props) {
  // properties
  const light = useMemo(() => model?.use(GenericOnOff), [model]);

  // state
  const [acknowledged, setAcknowledged] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [targetStatus, setTargetStatus] = useState<string>("N/A");

  // actions
  const readGenericOnOffState = () => {
    setAlert({
      title: "Status",
      message: "Reading  state...",
    });
    light
      ?.get()
      .then((value) => {
        setStatus(value.isOn ? "ON" : "OFF");
        setAlert(null);
      })
      .catch((error) => {
        setAlert({
          title: "Error",
          message: error.message,
        });
      });
  };

  const setGenericOnOffState = (on: boolean) => {
    setAlert({
      title: "Status",
      message: "Sending...",
    });
    setStatus("");
    light
      ?.set(on, {
        acknowledged,
      })
      .then(() => setAlert(null))
      .catch((error) => {
        setAlert({ title: "Error", message: error.message });
      });
  };

  return (
    <>
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">
        Control
      </AppText>
      <ListGroup variant="secondary" className="mx-2">
        <ListGroup.Item>
          <ListGroup.ItemContent className="gap-4">
            <View className="flex-row items-center gap-2">
              <AppText className="flex-1">
                Default Transition Time and Delay
              </AppText>
              <Switch />
            </View>
            <View className="flex-row items-center gap-2">
              <AppText className="flex-1">Acknowledged</AppText>
              <Switch
                isSelected={acknowledged}
                onSelectedChange={(val) => setAcknowledged(val)}
              />
            </View>
            <View className="flex-row items-center justify-end gap-2">
              <Button
                onPress={() => setGenericOnOffState(true)}
                variant="secondary"
                className="bg-transparent"
              >
                ON
              </Button>
              <Button
                onPress={() => setGenericOnOffState(false)}
                variant="secondary"
                className="bg-transparent"
              >
                OFF
              </Button>
            </View>
          </ListGroup.ItemContent>
        </ListGroup.Item>
      </ListGroup>
      <AppText className="text-muted font-bold mx-4 mt-2 text-md">
        Status
      </AppText>
      <ListGroup variant="secondary" className="mx-2 mb-10">
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Current</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">{status}</AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Target</ListGroup.ItemTitle>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix className="flex flex-row items-center">
            <AppText className="text-muted">{targetStatus}</AppText>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
        <Separator className="mx-2" />
        <ListGroup.Item>
          <ListGroup.ItemContent />
          <ListGroup.ItemSuffix className="items-end">
            <Button
              onPress={readGenericOnOffState}
              variant="secondary"
              className="bg-transparent"
            >
              Read
            </Button>
          </ListGroup.ItemSuffix>
        </ListGroup.Item>
      </ListGroup>
    </>
  );
}
