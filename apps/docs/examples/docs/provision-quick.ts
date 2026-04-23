type DiscoveredPeripheral = {
  uuid: string
  name?: string
}

type ProvisioningAdapter = {
  scanForUnprovisioned: (options?: { timeout?: number }) => Promise<DiscoveredPeripheral>
  connect: (peripheral: DiscoveredPeripheral) => Promise<void>
  identify: (attentionTimer?: number) => Promise<{ numberOfElements: number }>
  start: (options?: { algorithm?: "no-oob" | "static-oob" }) => Promise<void>
}

export async function quickProvision(adapter: ProvisioningAdapter) {
  const peripheral = await adapter.scanForUnprovisioned({ timeout: 15_000 })
  await adapter.connect(peripheral)

  const capabilities = await adapter.identify(5)
  if (capabilities.numberOfElements < 1) {
    throw new Error("Peripheral did not report any elements during provisioning")
  }

  await adapter.start({ algorithm: "no-oob" })

  return peripheral
}