import { AppText } from "@/components/app-text";
import { useMesh } from "@/components/mesh-provider";
import { Alert, AlertDialog } from "@/components/my-alert";
import { MySafeAreaView } from "@/components/my-safe-area-view";
import { DiscoveredUnprovisionedPeripheral } from "@mesh-link-js/sdk-react-native";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { ListGroup, Separator } from "heroui-native";
import { enableMapSet } from "immer";
import { BluetoothOffIcon, ChevronRightIcon } from "lucide-react-native";
import { useCallback, useEffect, useMemo } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { withUniwind } from "uniwind";
import { useImmer } from "use-immer";

enableMapSet();

const StyledChevronRightIcon = withUniwind(ChevronRightIcon);
const StyledBluetoothOffIcon = withUniwind(BluetoothOffIcon);

export default function ScannerScreen() {
  // properties
  const router = useRouter();
  const navigation = useNavigation();
  const [alert, setAlert] = useImmer<Alert | null>(null);
  const mesh = useMesh();

  // state
  const [discoveredPeripherals, setDiscoveredPeripherals] = useImmer<
    Map<string, DiscoveredUnprovisionedPeripheral>
  >(new Map());
  const [scanning, setScanning] = useImmer(false);

  const startScanning = useCallback(() => {
    setScanning(true);
    const scan = mesh.provision.scan;
    scan({ waitForBleReady: true });
  }, [mesh.provision.scan, setScanning]);

  const stopScanning = useCallback(() => {
    setScanning(false);
    const stopScan = mesh.stopScan;
    stopScan();
  }, [mesh.stopScan, setScanning]);

  useFocusEffect(
    useCallback(() => {
      const bindAllEvents = mesh.provision.bindAllEvents;
      const off = bindAllEvents({
        "scan:new-peripheral": (discoveredPeripheral) => {
          setDiscoveredPeripherals((prev) => {
            prev.set(
              discoveredPeripheral.device.uuid.uuidString,
              discoveredPeripheral,
            );
          });
        },
        "ble:error": (error) => {
          setAlert({
            title: "Error",
            message: error.message,
          });
        },
        "provision:status": (status, error) => {
          switch (status) {
            case "connecting":
              setAlert({
                title: "Status",
                message: "Connecting...",
                actions: [
                  {
                    label: "Cancel",
                    variant: "cancel",
                    onPress: () => {
                      setAlert({
                        title: "Aborting",
                        message: "Cancelling connection...",
                        actions: [
                          {
                            label: "Cancel",
                            variant: "cancel",
                            disabled: true,
                          },
                        ],
                        completion: () => {
                          const disconnect = mesh.provision.disconnect;
                          disconnect();
                        },
                      });
                    },
                  },
                ],
              });
              break;
            case "discovering-services":
              setAlert((prev) => {
                if (prev) {
                  prev.message = "Discovering services...";
                }
              });
              break;
            case "connected":
              setAlert(null);
              router.push("/provisioning/provisioning");
            case "initializing":
              setAlert((prev) => {
                if (prev) {
                  prev.message = "Initializing...";
                }
              });
              break;
            case "disconnected":
              setAlert(null);
              setAlert({
                title: "Status",
                message: error?.message ?? "Device disconnected",
              });
              startScanning();
              break;
          }
        },
        "provision:error": (error) => {
          setAlert(null);
          setAlert({ title: "Error", message: error.message });
        },
      });

      return () => {
        off();
      };
    }, [
      mesh.provision.bindAllEvents,
      mesh.provision.disconnect,
      router,
      setAlert,
      setDiscoveredPeripherals,
      startScanning,
    ]),
  );

  useFocusEffect(
    useCallback(() => {
      startScanning();
      return () => {
        stopScanning();
      };
    }, [startScanning, stopScanning]),
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ActivityIndicator className="p-2" animating={scanning} />
      ),
    });
  }, [navigation, scanning]);

  const open = useCallback(
    (discoveredPeripheral: DiscoveredUnprovisionedPeripheral) => {
      const connect = mesh.provision.connect;
      connect(discoveredPeripheral);
    },
    [mesh.provision.connect],
  );

  const devices = useMemo(
    () => Array.from(discoveredPeripherals.values()),
    [discoveredPeripherals],
  );

  return (
    <MySafeAreaView>
      {alert && (
        <AlertDialog open alert={alert} onClose={() => setAlert(null)} />
      )}
      {!!devices.length && (
        <View className="flex flex-1 flex-col">
          <ListGroup variant="secondary" className="mx-2">
            <FlatList
              data={devices}
              keyExtractor={(item) => item.device.uuid.uuidString}
              className="flex-grow-0"
              ItemSeparatorComponent={() => <Separator className="mx-4" />}
              renderItem={({ item }) => {
                const { device, rssi } = item;
                return (
                  <ListGroup.Item onPress={() => open(item)}>
                    <ListGroup.ItemContent>
                      <ListGroup.ItemTitle>
                        {device.name ?? "Unknown Device"}
                      </ListGroup.ItemTitle>
                      <ListGroup.ItemDescription className="text-xs">
                        {device.uuid.uuidString}
                      </ListGroup.ItemDescription>
                    </ListGroup.ItemContent>
                    <ListGroup.ItemSuffix className="flex-row items-center gap-2">
                      <AppText className="text-sm text-muted">{`${rssi[0]} dBm`}</AppText>
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
        <View className="flex max-w-xs flex-1 flex-col items-center justify-center gap-4 self-center">
          <StyledBluetoothOffIcon size={64} className="text-muted" />
          <AppText className="text-center text-accent font-bold text-md">
            Can&apos;t see your device?
          </AppText>
          <AppText className="text-center text-muted">
            1. Make sure the device is turned on and connected to a power
            source.
          </AppText>
          <AppText className="text-center text-muted">
            2. Make sure the relevant firmware and SoftDevices are flashed.
          </AppText>
        </View>
      )}
    </MySafeAreaView>
  );
}
