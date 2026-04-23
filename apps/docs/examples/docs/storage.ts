import { BrowserStorage, type Data, Storage } from "@mesh-link-js/utils"

export class InMemoryStorage extends Storage<Data> {
  private blob?: Data
  private readonly values = new Map<string, Data>()

  load() {
    return this.blob
  }

  save(data: Data) {
    this.blob = data
    return true
  }

  get(key: string) {
    return this.values.get(key)
  }

  set(key: string, value: Data) {
    this.values.set(key, value)
  }

  remove(key: string) {
    this.values.delete(key)
  }

  clear() {
    this.blob = undefined
    this.values.clear()
  }
}

export const browserStorage = new BrowserStorage("mesh-link-js-docs")