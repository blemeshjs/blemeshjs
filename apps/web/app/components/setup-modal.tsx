import { Button, Modal } from "@heroui/react";
import { Cpu, Network } from "lucide-react";
import { useMesh } from "./mesh-provider";
import { useState } from "react";
import { observer } from "mobx-react-lite";

export const SetupModal = observer(() => {
  const mesh = useMesh();
  const [isCreatingNetwork, setIsCreatingNetwork] = useState(false);

  if (mesh.isNetworkCreated) return null;

  return (
    <Modal defaultOpen>
      <Modal.Backdrop variant="blur" isDismissable={false}>
        <Modal.Container size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>
                <Cpu size={16} />
                Initialize Mesh Runtime
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-3">
              <p className="text-sm text-muted">
                Local setup data was unavailable. Create a fresh network runtime.
              </p>
              <Button
                variant="primary"
                onPress={() => {
                  setIsCreatingNetwork(true);
                  mesh.createNewMeshNetwork().finally(() => setIsCreatingNetwork(false));
                }}
                isPending={isCreatingNetwork}
              >
                <Network size={16} />
                Create Mesh Network
              </Button>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
});
