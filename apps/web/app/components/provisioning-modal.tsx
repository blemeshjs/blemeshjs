import {
  AlertDialog,
  Button,
  Description,
  Label,
  ListBox,
  Spinner,
  Surface,
  toast,
} from "@heroui/react";
import { BluetoothConnected, BluetoothSearching, Plus, ScanSearch } from "lucide-react";
import { useProvisioningStore } from "../hooks/useProvisioning";
import { useMesh } from "./mesh-provider";
import { useEffect, useMemo } from "react";
import { toastError } from "../helpers/error";
import { ScanError } from "@mesh-link-js/sdk-web";
import { useMutation } from "@tanstack/react-query";

export function ProvisioningModal() {
  const { isOpen, setIsOpen, status, selectedDevice, setSelectedDevice, setStatus, reset } =
    useProvisioningStore();
  const mesh = useMesh();
  const provisioning = useMemo(() => status === "provisioning", [status]);
  const provisionMutation = useMutation({
    mutationFn: (device: NonNullable<typeof selectedDevice>) => mesh.provision.quick(device),
  });

  const startScan = () => {
    setStatus("provisioning-scan");
    mesh.provision.scan({});
    const off = mesh.provision.on("scan:new-peripheral", (proxy) => {
      mesh.provision.stopScan();
      setSelectedDevice(proxy);
      off();
    });
  };

  useEffect(() => {
    const bindAllEvents = mesh.provision.bindAllEvents;
    const unbindAll = bindAllEvents({
      "ble:error": (error) => {
        switch (true) {
          case error instanceof ScanError:
            toast.warning("Scan error", { description: error.message });
            setStatus("idle");
            break;
          default:
            toastError(error);
        }
      },
      "provision:error": (error) => {
        toastError(error);
      },
      "provision:status": (status) => {
        switch (status) {
          case "connecting":
          case "discovering-services":
          case "connected":
          case "initializing":
          case "provisioning":
          case "identifying":
          case "capabilities-received":
            setStatus("provisioning");
            break;
          case "complete":
            {
              const name = selectedDevice?.device.name || "Unknown device";
              setStatus("provisioning-done");
              reset();
              setIsOpen(false);
              toast("Provisioning complete", {
                variant: "success",
                description: `${name} has been added to the network.`,
              });
            }
            break;
        }
      },
    });
    return unbindAll;
  }, [mesh.provision.bindAllEvents, reset, selectedDevice?.device.name, setIsOpen, setStatus]);

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button>
        <Plus size={14} />
        Add Node
      </Button>
      <AlertDialog.Backdrop variant="blur">
        <AlertDialog.Container size="lg">
          <AlertDialog.Dialog>
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Heading className="flex gap-2">
                <ScanSearch size={24} />
                <div>
                  Provision Devices
                  <p className="text-xs text-muted">
                    Scan unprovisioned devices advertising provisioning service.
                  </p>
                </div>
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="flex flex-col items-center gap-4 py-6">
              <Surface
                variant="secondary"
                className="rounded-xl shadow-surface items-center justify-center p-4 w-full"
              >
                {!selectedDevice && (
                  <p className="text-sm text-muted text-center">No device discovered.</p>
                )}
                {selectedDevice && (
                  <ListBox aria-label="devices" selectionMode="none">
                    <ListBox.Item id="1" textValue="Bob">
                      <BluetoothConnected />
                      <div className="flex flex-1 flex-col">
                        <Label>{selectedDevice.device.name}</Label>
                        <Description>0x{selectedDevice.device.uuid.hex}</Description>
                      </div>
                      <Button
                        isPending={provisionMutation.isPending}
                        onPress={() => provisionMutation.mutate(selectedDevice)}
                      >
                        {provisionMutation.isPending ? <Spinner color="current" /> : "Provision"}
                      </Button>
                    </ListBox.Item>
                  </ListBox>
                )}
              </Surface>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button
                isDisabled={status === "provisioning-scan" || provisioning}
                onPress={startScan}
              >
                <BluetoothSearching /> Scan for devices
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
