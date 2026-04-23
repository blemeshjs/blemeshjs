import { GenericOnOffGet, GenericOnOffSet } from "@mesh-link-js/core"
import { BrowserStorage } from "@mesh-link-js/utils"

export function createQuickStartArtifacts() {
  const storage = new BrowserStorage("mesh-link-js-docs")

  const getMessage = new GenericOnOffGet()
  const setMessage = new GenericOnOffSet(true)
  setMessage.tid = 1

  return {
    storage,
    messages: {
      getMessage,
      setMessage,
    },
  }
}