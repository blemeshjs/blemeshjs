import { GenericOnOffGet, GenericOnOffSet } from "@mesh-link-js/core"
import { SigModelId } from "@mesh-link-js/utils"

type MessageTransport = {
  sendAcknowledged: (target: {
    nodeUuid: string
    elementIndex: number
    modelId: number
    message: GenericOnOffGet | GenericOnOffSet
  }) => Promise<unknown>
}

export function createGenericOnOffClient(
  transport: MessageTransport,
  nodeUuid: string,
  elementIndex = 0,
) {
  const modelId = SigModelId.genericOnOffClientModelId

  return {
    async get() {
      return transport.sendAcknowledged({
        nodeUuid,
        elementIndex,
        modelId,
        message: new GenericOnOffGet(),
      })
    },

    async set(value: boolean) {
      const message = new GenericOnOffSet(value)
      message.tid = 1

      return transport.sendAcknowledged({
        nodeUuid,
        elementIndex,
        modelId,
        message,
      })
    },
  }
}