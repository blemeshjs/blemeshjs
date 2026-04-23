import {
  PublicNetworkIdentity,
  PrivateNetworkIdentity,
  PrivateNodeIdentity,
  PublicNodeIdentity,
} from "@mesh-link-js/core";

/**
 * Attempts to create a node identity from advertisement data.
 * Tries to parse the data as a PublicNodeIdentity first, then as a PrivateNodeIdentity if unsuccessful.
 *
 * @param advertisementData - The advertisement data to parse.
 * @returns A PublicNodeIdentity or PrivateNodeIdentity instance, or undefined if parsing fails.
 */
export const nodeIdentity = (advertisementData: Record<string, unknown>) => {
  return (
    PublicNodeIdentity.fromAdvertisementData(advertisementData) ??
    PrivateNodeIdentity.fromAdvertisementData(advertisementData)
  );
};

export const networkIdentity = (advertisementData: Record<string, unknown>) => {
  return (
    PublicNetworkIdentity.fromAdvertisementData(advertisementData) ??
    PrivateNetworkIdentity.fromAdvertisementData(advertisementData)
  );
};
