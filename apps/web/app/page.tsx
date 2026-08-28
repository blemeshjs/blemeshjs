"use client";

import { ControlFlow } from "@/app/components/control-flow";
import { SetupModal } from "@/app/components/setup-modal";
import { Alert, Button, Surface } from "@heroui/react";
import { ApplicationSettings } from "./components/application-settings";
import {
  createMesh,
  Crypto,
  DiscoveredProxyPeripheral,
  GenericOnOff,
  MeshNetworkManager,
} from "@blemeshjs/sdk-web";

// export default function Home() {
//   return (
//     <Surface variant="secondary" className="min-h-screen p-4 sm:p-6">
//       <SetupModal />
//       <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
//         <Alert status="warning">
//           <Alert.Indicator />
//           <Alert.Content>
//             <Alert.Title>IMPORTANT</Alert.Title>
//             <Alert.Description>
//               This playground requires experimental web bluetooth new permissions backend{" "}
//               <span className="text-warning">
//                 chrome://flags/#enable-web-bluetooth-new-permissions-backend
//               </span>{" "}
//               to be enabled to work properly.
//             </Alert.Description>
//           </Alert.Content>
//         </Alert>
//         <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
//           <div className="lg:w-[320px] lg:shrink-0 xl:w-[340px]">
//             <ApplicationSettings />
//           </div>
//           <div className="flex min-w-0 flex-1 flex-col gap-4">
//             <ControlFlow />
//           </div>
//         </div>
//       </div>
//     </Surface>
//   );
// }

export default function Home() {
  let manager: MeshNetworkManager | undefined;
  const provision = async () => {
    try {
      console.log("creating mesh network manager...");
      manager = await createMesh();
      console.log("creating mesh network...");
      await manager.createNewMeshNetwork();
      manager.addApplicationKey({
        name: "App Key 1",
        index: manager.nextAvailableApplicationKeyIndex,
        key: Crypto.generateKey(),
      });

      console.log("scanning for un-provisioned device...");
      const unProvisionedNode = await manager.provision.scan();

      console.log("provisioning...");
      await manager.provision.quick(unProvisionedNode);
    } catch (error) {
      console.error("an error occurred", error);
      if (manager) {
        manager.reset().catch(console.error);
      }
    }
  };
  const control = async () => {
    if (!manager) return console.error("please provision first");
    try {
      const provisionedNode = await manager.connection.scan();
      console.log("connecting to provisioned device...");
      await manager.connection.connect(provisionedNode);

      await new Promise((resolve) => {
        setTimeout(resolve, 10000);
      });

      const node = manager.allNodes.find((node) => !node.isProvisioner);
      if (!node) throw new Error("no node exists in network");

      console.log(
        "retrieving composition data (which includes: elements, models and other config of the node) and default TTL...",
      );
      await node.discover();

      await node.addApplicationKey(manager.applicationKeys[0]);

      // get the first element from the node
      const element = node.elements[0];
      if (!element) throw new Error("no elements on node");

      // get the generic on off server model of the element
      const model = element.models.find((model) => model.isGenericOnOffServer);
      if (!model) throw new Error("no models on element");

      await model.bindApplicationKey(node.applicationKeys[0]);

      // add on/off methods to the model
      const light = model.use(GenericOnOff);

      const lightState = () => {
        if (typeof light.state === "undefined") return "UNKNOWN";
        return "light is " + (light.state ? "ON" : "OFF");
      };

      console.log(lightState());

      console.log("retrieving device state...");
      await light.get();
      console.log(lightState());

      console.log("toggling device state...");
      await light.set(!light.state);

      console.log("retrieving device state again...");
      await light.get();
      console.log(lightState());

      console.log("resetting node...");
      await node.reset();

      console.log("resetting mesh network manager...");
      await manager.reset();
    } catch (error) {
      console.error("an error occurred", error);
      if (manager) {
        manager.reset().catch(console.error);
      }
    }
  };
  return (
    <>
      <Button onPress={provision}>Provision</Button>
      <Button onPress={control}>Control</Button>
    </>
  );
}
