import { createMesh, GenericOnOff, MeshNetworkManager } from "@blemeshjs/sdk-web";

let manager: MeshNetworkManager | undefined;

try {
  // create a mesh network manager object
  manager = await createMesh();

  // create a mesh network within your mesh network manager
  await manager.createNewMeshNetwork();

  // scan for un-provisioned devices
  const unProvisionedNode = await manager.provision.scan();

  // provision the scanned device in one step
  await manager.provision.quick(unProvisionedNode);

  // scan for provisioned devices
  const provisionedNode = await manager.connection.scan();

  // connect to first provisioned device
  const node = await manager.connection.connect(provisionedNode);
  if (!node) throw new Error("no node exists in network");

  // get composition data (which includes: elements, models and other config of the node) and default TTL
  await node.discover();

  // get the first element from the node
  const element = node.elements[0];
  if (!element) throw new Error("no elements on node");

  // get the generic on off server model of the element
  const model = element.models.find((model) => model.isGenericOnOffServer);
  if (!model) throw new Error("no models on element");

  // add on/off methods to the model
  const light = model.use(GenericOnOff);

  const lightState = () => {
    if (typeof light.state === "undefined") return "UNKNOWN";
    return "light is " + light.state ? "ON" : "OFF";
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
