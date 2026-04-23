import { GenericOnOffGet, GenericOnOffSet } from "@mesh-link-js/core"

export function buildGenericOnOffMessages() {
  const getMessage = new GenericOnOffGet()
  const setMessage = new GenericOnOffSet(true)
  setMessage.tid = 1

  return {
    getMessage,
    setMessage,
  }
}