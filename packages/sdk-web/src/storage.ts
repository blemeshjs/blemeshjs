import { Data, Storage } from "@mesh-link-js/sdk";
import { stringToUint8Array, uint8ArrayToString } from "uint8array-extras";

export class BrowserStorage extends Storage<string> {
  private readonly namespace: string;

  constructor(namespace: string = "mesh-link-js") {
    super();
    this.namespace = namespace;
  }

  private getData(): Record<string, string> | undefined {
    const raw = localStorage.getItem(this.namespace);
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      return undefined;
    }
  }

  load(): Data | undefined {
    const raw = localStorage.getItem(this.namespace);
    if (!raw) return undefined;
    try {
      return stringToUint8Array(raw);
    } catch {
      return undefined;
    }
  }

  save(data: Data): boolean {
    localStorage.setItem(this.namespace, uint8ArrayToString(data));
    return true;
  }

  get(key: string): string | undefined {
    const data = this.getData();
    return data && key in data ? data[key] : undefined;
  }

  set(key: string, value: string): void {
    const data = this.getData() ?? {};
    data[key] = value;
    this.save(stringToUint8Array(JSON.stringify(data)));
  }

  remove(key: string): void {
    const data = this.getData() ?? {};
    delete data[key];
    this.save(stringToUint8Array(JSON.stringify(data)));
  }

  clear() {
    localStorage.removeItem(this.namespace);
  }
}
