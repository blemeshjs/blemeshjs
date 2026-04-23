import { AppText } from "@/components/app-text";
import { useMesh } from "@/components/mesh-provider";
import { Alert, AlertDialog } from "@/components/my-alert";
import { MySafeAreaView } from "@/components/my-safe-area-view";
import { DiscoveredProxyPeripheral } from "@mesh-link-js/sdk-react-native";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { ListGroup, Separator } from "heroui-native";
import { enableMapSet } from "immer";
import { BluetoothSearchingIcon, ChevronRightIcon } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { withUniwind } from "uniwind";
import { useImmer } from "use-immer";

enableMapSet();
const StyledBluetoothSearchingIcon = withUniwind(BluetoothSearchingIcon);
const StyledChevronRightIcon = withUniwind(ChevronRightIcon);
export default function SelectProxyScreen() {
  // properties
  const mesh = useMesh();
  const navigation = useNavigation();
  const router = useRouter();

  // state
  const [proxies, setProxies] = useImmer<
    Map<string, DiscoveredProxyPeripheral>
  >(new Map());
  const [alert, setAlert] = useImmer<Alert | null>(null);
  const [scanning, setScanning] = useImmer(false);
  const selectedProxy = useRef<DiscoveredProxyPeripheral | null>(null);

  useFocusEffect(
    useCallback(() => {
      const bindAllEvents = mesh.bindAllEvents;
      const off = bindAllEvents({
        "proxy:status": (status) => {
          switch (status) {
            case "discovering-services":
              setAlert((prev) => {
                if (prev) prev.message = "Discovering services...";
              });
              break;
            case "connecting":
              setAlert({
                title: "Status",
                message: "Connecting...",
                actions: [
                  {
                    label: "Cancel",
                    variant: "destructive",
                    onPress: () => {
                      setAlert({
                        title: "Aborting",
                        message: "Cancelling connection...",
                      });
                      if (selectedProxy.current === null) return;
                      const disconnect = mesh.disconnect;
                      disconnect(selectedProxy.current);
                    },
                  },
                ],
              });
              break;
            case "initializing":
              setAlert((prev) => {
                if (prev) prev.message = "Initializing...";
              });
              break;
            case "connected":
              setAlert({
                title: "Status",
                message: "Connected!",
                actions: [
                  {
                    label: "OK",
                    onPress: () => {
                      const dismiss = router.dismiss;
                      dismiss();
                    },
                  },
                ],
              });
              break;
            case "disconnected":
              setAlert({
                title: "Status",
                message: "Disconnected",
              });
              break;
          }
        },
        "scan:new-proxy": (proxy) => {
          setProxies((prev) => {
            prev.set(proxy.device.identifier.uuidString, proxy);
          });
        },
        "ble:error": (error) => {
          setAlert({
            title: "Error",
            message: error.message,
          });
        },
      });
      return () => {
        off();
      };
    }, [
      mesh.bindAllEvents,
      mesh.disconnect,
      router.dismiss,
      setAlert,
      setProxies,
    ]),
  );

  const stopScanning = useCallback(() => {
    setScanning(false);
    mesh.stopScan();
  }, [mesh, setScanning]);

  useFocusEffect(
    useCallback(() => {
      const scan = mesh.scan;
      setScanning(true);
      scan({
        waitForBleReady: true,
      });
      return () => {
        stopScanning();
      };
    }, [mesh.scan, setScanning, stopScanning]),
  );

  const open = useCallback(
    (proxy: DiscoveredProxyPeripheral) => {
      stopScanning();
      const connect = mesh.connect;
      selectedProxy.current = proxy;
      connect(proxy);
    },
    [mesh.connect, stopScanning],
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ActivityIndicator className="p-2" animating={scanning} />
      ),
    });
  }, [navigation, scanning]);

  const devices = useMemo(() => Array.from(proxies.values()), [proxies]);

  return (
    <MySafeAreaView className="h-full">
      {alert && (
        <AlertDialog open alert={alert} onClose={() => setAlert(null)} />
      )}
      {!!devices.length && (
        <View className="flex flex-1 flex-col">
          <ListGroup variant="secondary" className="mx-2">
            <FlatList
              data={devices}
              ItemSeparatorComponent={Separator}
              renderItem={({ item }) => {
                const { device, rssi } = item;
                return (
                  <ListGroup.Item onPress={() => open(item)}>
                    <ListGroup.ItemContent>
                      <ListGroup.ItemTitle>
                        {device.name ?? "Unknown Device"}
                      </ListGroup.ItemTitle>
                      <ListGroup.ItemDescription className="text-xs">
                        {device.identifier.uuidString}
                      </ListGroup.ItemDescription>
                    </ListGroup.ItemContent>
                    <ListGroup.ItemSuffix className="flex-row items-center gap-1">
                      <AppText className="text-sm text-muted">{`${rssi} dBm`}</AppText>
                      <StyledChevronRightIcon className="text-muted" />
                    </ListGroup.ItemSuffix>
                  </ListGroup.Item>
                );
              }}
            />
          </ListGroup>
        </View>
      )}
      {!devices.length && (
        <View className="flex flex-1 flex-col justify-center items-center gap-4">
          <StyledBluetoothSearchingIcon size={64} className="text-muted" />
          <AppText className="text-center font-bold text-md text-accent">
            Can&apos;t see your proxy?
          </AppText>
          <AppText className="text-center text-muted">
            1. Make sure the device is turned on and connected to a power
            source.
          </AppText>
          <AppText className="text-center text-muted">
            2. Make sure it&apos;s provisioned to this mesh network.
          </AppText>
        </View>
      )}
    </MySafeAreaView>
  );
}
