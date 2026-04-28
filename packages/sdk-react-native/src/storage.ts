import { Data, Storage } from "@blemeshjs/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { stringToUint8Array, uint8ArrayToString } from "uint8array-extras";

const MESH_LINK_STORAGE_KEY = "BLEMeshJS";
export class RNAsyncStorage implements Storage {
  load = async (): Promise<Data | undefined> => {
    return AsyncStorage.getItem(MESH_LINK_STORAGE_KEY).then((data) => {
      if (data === null) throw new Error("No data found");
      return stringToUint8Array(data);
    });
  };
  save = async (data: Data): Promise<boolean> => {
    return AsyncStorage.setItem(MESH_LINK_STORAGE_KEY, uint8ArrayToString(data)).then(() => true);
  };
  get = (key: string): Promise<unknown> => {
    return AsyncStorage.getItem(key);
  };
  set = (key: string, value: unknown): Promise<void> => {
    return AsyncStorage.setItem(key, value as string);
  };
  remove = (key: string): Promise<void> => {
    return AsyncStorage.removeItem(key);
  };
  clear = (): Promise<void> => {
    return AsyncStorage.clear();
  };
}
