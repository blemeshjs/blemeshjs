import { createMesh } from "@mesh-link-js/sdk"

export async function connectAndToggle(uuid: string) {
  const mesh = await createMesh({ platform: "react-native" })
  const device = await mesh.connect(uuid)

  await device.provision({ appKey: "home-app" })
  await device.light.on()

  return device
}
