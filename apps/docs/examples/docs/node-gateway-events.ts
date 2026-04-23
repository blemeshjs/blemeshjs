import { createMesh } from "@mesh-link-js/sdk"

type EventPublisher = {
  publish: (topic: string, payload: string) => Promise<void>
}

export async function runGateway(publisher: EventPublisher) {
  const mesh = await createMesh({ platform: "node" })

  mesh.on("state", async (event) => {
    await publisher.publish("mesh/events", JSON.stringify(event))
  })

  return mesh
}
