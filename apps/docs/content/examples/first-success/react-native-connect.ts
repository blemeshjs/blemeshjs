import { MeshNetworkManager, createMesh } from '@blemeshjs/sdk-react-native';

export async function createMeshRuntime() {
  const mesh = await createMesh({
    meshNetworkManager: MeshNetworkManager.instance,
  });

  if (!mesh.isNetworkCreated) {
    await mesh.createNewMeshNetwork();
  }

  return mesh;
}
