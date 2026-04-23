import { GenericOnOffSet } from "@mesh-link-js/core"

export function buildTurnOnCommand() {
  const message = new GenericOnOffSet(true)
  message.tid = 1

  return message
}