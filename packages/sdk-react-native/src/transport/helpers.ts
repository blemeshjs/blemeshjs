import { DeviceId } from "react-native-ble-plx";

export const getHexDeviceId = (deviceId: DeviceId) => {
  if (!deviceId) return "";
  return deviceId.replace(/[: -]/g, "").toUpperCase();
};
