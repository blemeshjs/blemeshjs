import { createMesh, Crypto, GenericOnOff, MeshNetworkManager } from "@blemeshjs/sdk-web";

let manager: MeshNetworkManager | undefined;

try {
  // create a mesh network manager object
  manager = await createMesh();

  // create a mesh network within your mesh network manager
  await manager.createNewMeshNetwork();

  // an application key is what models are bound to, so add one up front
  manager.addApplicationKey({
    name: "App Key 1",
    index: manager.nextAvailableApplicationKeyIndex,
    key: Crypto.generateKey(),
  });

  // scan for un-provisioned devices
  const unProvisionedNode = await manager.provision.scan();

  // provision the scanned device in one step
  await manager.provision.quick(unProvisionedNode);

  // scan for provisioned devices, then connect over the GATT proxy
  const provisionedNode = await manager.connection.scan();
  await manager.connection.connect(provisionedNode);

  // the freshly provisioned node is now in the network
  const node = manager.allNodes.find((n) => !n.isProvisioner);
  if (!node) throw new Error("no node exists in network");

  // get composition data (which includes: elements, models and other config of the node)
  await node.discover();

  // give the node the application key before binding any model to it
  await node.addApplicationKey(manager.applicationKeys[0]);

  // get the first element from the node
  const element = node.elements[0];
  if (!element) throw new Error("no elements on node");

  // get the generic on off server model of the element
  const model = element.models.find((m) => m.isGenericOnOffServer);
  if (!model) throw new Error("no models on element");

  // a model only answers messages encrypted with a key it is bound to
  await model.bindApplicationKey(node.applicationKeys[0]);

  // add on/off methods to the model
  const light = model.use(GenericOnOff);

  const lightState = () => {
    if (typeof light.state === "undefined") return "UNKNOWN";
    return "light is " + (light.state ? "ON" : "OFF");
  };

  console.log(lightState());

  // get current state
  await light.get();
  console.log(lightState());

  // toggle current state
  await light.set(!light.state);

  // get the state again
  await light.get();
  console.log(lightState());

  // reset the node so you can run the script again :)
  await node.reset();
} catch (error) {
  console.error("an error occurred", error);
  if (manager) {
    manager.reset().catch(console.error);
  }
}
