import { AppText } from "@/components/app-text";
import { useMesh } from "@/components/mesh-provider";
import { Alert, AlertDialog } from "@/components/my-alert";
import { MySafeAreaScrollView } from "@/components/my-safe-area-scroll-view";
import { ProvisioningCapabilities } from "@blemeshjs/core";
import { DispatchQueue, MeshNetworkError } from "@blemeshjs/utils";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { Button, ListGroup, Separator } from "heroui-native";
import { enableMapSet } from "immer";
import { Fragment, useCallback, useEffect, useMemo } from "react";
import { useImmer } from "use-immer";

enableMapSet();

type InfoItem = {
  title: string;
  showArrow?: boolean;
  rightText?: string;
  subtitle?: string;
};

export default function ProvisioningScreen() {
  // properties
  const attentionTimer = 5;
  const navigation = useNavigation();
  const router = useRouter();
  const mesh = useMesh();

  // state
  const [isProvisioningComplete, setIsProvisioningComplete] = useImmer(false);
  const [provisioningEnabled, setProvisioningEnabled] = useImmer(false);
  const [alert, setAlert] = useImmer<Alert | null>(null);
  const [unicastAddress, setUnicastAddress] = useImmer("");
  const [networkKey, setNetworkKey] = useImmer("");
  const [deviceName, setDeviceName] = useImmer("Unknown");
  const [capabilities, setCapabilities] = useImmer<{
    [K in keyof ProvisioningCapabilities]: string;
  }>({
    algorithms: "",
    inputOobActions: "",
    inputOobSize: "",
    numberOfElements: "",
    oobType: "",
    outputOobActions: "",
    outputOobSize: "",
    publicKeyType: "",
  });

  const sections = useMemo<{ title?: string; data: InfoItem[] }[]>(
    () => [
      {
        title: "",
        data: [
          {
            title: "Name",
            showArrow: true,
            rightText: deviceName,
          },
        ],
      },
      {
        title: "Provisioning data",
        data: [
          {
            title: "Unicast Address",
            showArrow: true,
            rightText: unicastAddress,
          },
          {
            title: "Network Key",
            showArrow: true,
            rightText: networkKey,
          },
        ],
      },
      {
        title: "Device Capabilities",
        data: [
          {
            title: "Elements Count",
            subtitle: capabilities.numberOfElements,
          },
          {
            title: "Supported Algorigthms",
            subtitle: capabilities.algorithms,
          },
          {
            title: "Public Key Type",
            subtitle: capabilities.publicKeyType,
          },
          {
            title: "OOB Types",
            subtitle: capabilities.oobType,
          },
          {
            title: "Output OOB Size",
            subtitle: capabilities.outputOobSize,
          },
          {
            title: "Supported Output OOB Actions",
            subtitle: capabilities.outputOobActions,
          },
          {
            title: "Input OOB Size",
            subtitle: capabilities.inputOobSize,
          },
          {
            title: "Supported Input OOB Actions",
            subtitle: capabilities.inputOobActions,
          },
        ],
      },
    ],
    [
      capabilities.algorithms,
      capabilities.inputOobActions,
      capabilities.inputOobSize,
      capabilities.numberOfElements,
      capabilities.oobType,
      capabilities.outputOobActions,
      capabilities.outputOobSize,
      capabilities.publicKeyType,
      deviceName,
      networkKey,
      unicastAddress,
    ],
  );

  const dismissStatusDialog = useCallback(
    (completion?: () => void) => {
      DispatchQueue.main.async(async () => {
        setAlert(null);
        completion?.();
      });
    },
    [setAlert],
  );

  const abort = useCallback(() => {
    const disconnect = mesh.provision.disconnect;
    disconnect();
  }, [mesh.provision.disconnect]);

  const presentStatusDialog = useCallback(
    (message: string, completion?: () => void) => {
      DispatchQueue.main.async(async () => {
        setAlert((prev) => {
          if (prev) {
            prev.message = message;
            completion?.();
          } else {
            return {
              title: "Status",
              message,
              actions: [
                {
                  label: "Cancel",
                  variant: "cancel" as const,
                  disabled: true,
                  onPress: () => {
                    setAlert({
                      title: "Aborting",
                      message: "Cancelling connection...",
                    });
                    abort();
                  },
                },
              ],
              completion,
            };
          }
        });
      });
    },
    [abort, setAlert],
  );

  const startProvisioning = useCallback(() => {
    const start = mesh.provision.start;
    start();
  }, [mesh.provision.start]);

  useFocusEffect(
    useCallback(() => {
      return () => abort();
    }, [abort]),
  );

  useFocusEffect(
    useCallback(() => {
      const bindAllEvents = mesh.provision.bindAllEvents;
      const off = bindAllEvents({
        "provision:error": (error) => {
          switch (true) {
            case error instanceof MeshNetworkError:
              switch (error) {
                case MeshNetworkError.nodeAlreadyExist:
                  setAlert({
                    title: "Node already exist",
                    message:
                      "A node with the same UUID already exist in the network. Remove it before reprovisioning.",
                    completion: () => {
                      setAlert(null);
                    },
                  });
                  return;
                default:
                  setAlert({
                    title: "Error",
                    message: error.message,
                    completion: () => setAlert(null),
                  });
                  return;
              }
          }
        },

        "provision:status": (status) => {
          switch (status) {
            case "identifying":
              presentStatusDialog("Identifying...");
              break;
            case "provisioning":
              presentStatusDialog("Provisioning...");
              break;
            case "complete":
              setIsProvisioningComplete(true);
              dismissStatusDialog(() => {
                setAlert({
                  title: "Success",
                  message: "Provisioning complete.",
                  actions: [
                    {
                      label: "Done",
                      onPress: () => {
                        router.dismissTo("/(tabs)/(network)");
                      },
                    },
                  ],
                });
              });
              break;
            case "discovering-services":
              presentStatusDialog("Discovering services...");
              break;
            case "initializing":
              presentStatusDialog("Initializing...");
              break;
          }
        },

        "provision:capabilities-received": (capabilities) => {
          setCapabilities({
            numberOfElements: `${capabilities.numberOfElements}`,
            algorithms: `${capabilities.algorithms}`,
            publicKeyType: `${capabilities.publicKeyType}`,
            inputOobActions: `${capabilities.inputOobActions}`,
            outputOobActions: `${capabilities.outputOobActions}`,
            inputOobSize: `${capabilities.inputOobSize}`,
            outputOobSize: `${capabilities.outputOobSize}`,
            oobType: `${capabilities.oobType}`,
          });
          setUnicastAddress(
            mesh.provision.unicastAddress?.toString() ?? "No address available",
          );
          const addressValid = mesh.provision.isAddressValid;
          const deviceSupported = mesh.provision.isDeviceSupported;

          setProvisioningEnabled(mesh.provision.isAddressValid);

          dismissStatusDialog(() => {
            if (!deviceSupported) {
              setAlert({
                title: "Error",
                message: "Selected device is not supported.",
              });
              setProvisioningEnabled(false);
            } else if (!addressValid) {
              setAlert({
                title: "Error",
                message: "No available Unicast Address in Provisioner's range.",
              });
            }
          });
        },
      });

      return () => {
        off();
      };
    }, [
      dismissStatusDialog,
      mesh.provision.bindAllEvents,
      mesh.provision.isAddressValid,
      mesh.provision.isDeviceSupported,
      mesh.provision.unicastAddress,
      presentStatusDialog,
      router,
      setAlert,
      setCapabilities,
      setIsProvisioningComplete,
      setProvisioningEnabled,
      setUnicastAddress,
    ]),
  );

  useFocusEffect(
    useCallback(() => {
      setUnicastAddress("Automatic");
      setNetworkKey(mesh.provision.networkKey?.name ?? "New Network Key");
      setDeviceName(mesh.provision.device?.name ?? "Unknown");
      setProvisioningEnabled(mesh.provision.provisionerAvailable);

      if (!mesh.provision.capabilitiesReceived && !isProvisioningComplete) {
        // We are now connected. Proceed by sending Provisioning Invite request.
        presentStatusDialog("Identifying...", () => {
          const identify = mesh.provision.identify;
          identify(attentionTimer);
        });
      }
    }, [
      mesh.provision.capabilitiesReceived,
      mesh.provision.device?.name,
      mesh.provision.identify,
      isProvisioningComplete,
      mesh.provision.networkKey?.name,
      mesh.provision.provisionerAvailable,
      presentStatusDialog,
      setDeviceName,
      setNetworkKey,
      setProvisioningEnabled,
      setUnicastAddress,
    ]),
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={startProvisioning}
          variant="ghost"
          size="sm"
          isDisabled={!provisioningEnabled}
        >
          Provision
        </Button>
      ),
    });
  }, [navigation, provisioningEnabled, startProvisioning]);

  return (
    <MySafeAreaScrollView contentContainerClassName="pb-10">
      {alert && (
        <AlertDialog open alert={alert} onClose={() => setAlert(null)} />
      )}
      {sections.map((section, idx) => (
        <Fragment key={"section" + idx}>
          {section.title && (
            <AppText className="text-muted font-bold p-2 text-md">
              {section.title}
            </AppText>
          )}
          <ListGroup variant="secondary" className="mx-2">
            {section.data.map((item, index) => (
              <Fragment key={item.title + index}>
                <ListGroup.Item>
                  <ListGroup.ItemContent>
                    <ListGroup.ItemTitle>{item.title}</ListGroup.ItemTitle>
                    {item.subtitle && (
                      <ListGroup.ItemDescription className="text-xs">
                        {item.subtitle}
                      </ListGroup.ItemDescription>
                    )}
                  </ListGroup.ItemContent>
                  {item.rightText && (
                    <ListGroup.ItemSuffix className="flex-row items-center gap-2">
                      <AppText className="text-sm text-muted">
                        {item.rightText}
                      </AppText>
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
}
