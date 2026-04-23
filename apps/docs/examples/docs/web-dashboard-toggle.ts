import { createMesh } from "@mesh-link-js/sdk"

export async function scanAndToggleFirstDevice() {
  const mesh = await createMesh({ platform: "web" })
  const devices = await mesh.scan({ timeout: 10_000 })

  if (devices.length === 0) {
    throw new Error("No mesh devices found")
  }

  const device = await mesh.connect(devices[0].uuid)
  await device.light.on()

  return device
}
