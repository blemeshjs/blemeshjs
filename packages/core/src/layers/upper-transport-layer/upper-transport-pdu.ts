import {
  Address,
  Data,
  IvIndex,
  KeySet,
  MeshMessage,
  MeshMessageSecurity,
  packUInt32BE,
  UInt32,
  UInt8,
} from "@mesh-link-js/utils";
import { AccessPdu } from "../access-layer/access-pdu.js";
import { concatUint8Arrays, uint8ArrayToHex } from "uint8array-extras";
import { Crypto } from "@mesh-link-js/crypto";
import { AccessMessage } from "../lower-transport-layer/access-message.js";
import { Group, MeshAddress, MeshNetwork } from "../../mesh-models/index.js";
import Long from "long";
import { ApplicationKeys } from "../../mesh-models-array/index.js";
import { AccessKeySet, DeviceKeySet } from "../../mesh-models/key-set.js";

export class UpperTransportPdu {
  private constructor(
    /**
     * The Mesh Message that is being sent, or `undefined`, when the message
     * was received.
     */
    public message: MeshMessage | undefined,
    /**
     * Whether sending this message has been initiated by the user.
     */
    public userInitiated: boolean,
    /**
     * Source Address.
     */
    public source: Address,
    /**
     * Destination Address.
     */
    public destination: MeshAddress,
    /**
     * 6-bit Application Key identifier. This field is set to `undefined`
     * if the message is signed with a Device Key instead.
     */
    public aid: UInt8 | undefined,
    /**
     * The sequence number used to encode this message.
     */
    public sequence: UInt32,
    /**
     * The IV Index used to encode this message.
     */
    public ivIndex: UInt32,
    /**
     * The size of Transport MIC: 4 or 8 bytes.
     */
    public transportMicSize: UInt8,
    /**
     * The Access Layer data.
     */
    public accessPdu: Data,
    /**
     * The raw data of Upper Transport Layer PDU.
     */
    public transportPdu: Data,
  ) {}

  public static fromLowerTransportAccessMessage(
    accessMessage: AccessMessage,
    key: Data,
    virtualGroup: Group | undefined = undefined,
  ): UpperTransportPdu | undefined {
    const micSize = Long.fromNumber(accessMessage.transportMicSize);
    const encryptedDataSize = Long.fromNumber(accessMessage.upperTransportPdu.length).sub(micSize);
    const encryptedData = accessMessage.upperTransportPdu.slice(0, encryptedDataSize.toNumber());
    const mic = accessMessage.upperTransportPdu.slice(encryptedDataSize.toNumber());

    // The nonce type is 0x01 for messages signed with Application Key and
    // 0x02 for messages signed using Device Key (Configuration Messages).
    const type: UInt8 = typeof accessMessage.aid !== "undefined" ? 0x01 : 0x02;
    // ASZMIC is set to 1 for messages sent with high security
    // (64-bit TransMIC). This is possible only for Segmented Access Messages.
    const aszmic: UInt8 = micSize.eq(4) ? 0 : 1;
    const seq = packUInt32BE(accessMessage.sequence).slice(1);

    const nonce = concatUint8Arrays([
      new Uint8Array([type, aszmic << 7]),
      seq,
      accessMessage.source.bytesBE,
      accessMessage.destination.bytesBE,
      packUInt32BE(accessMessage.ivIndex),
    ]);
    const decryptedData = Crypto.decrypt(
      encryptedData,
      key,
      nonce,
      mic,
      virtualGroup?.address.virtualLabel?.bytes,
    );
    if (typeof decryptedData === "undefined") {
      return undefined;
    }
    return new UpperTransportPdu(
      undefined,
      false,
      accessMessage.source,
      virtualGroup?.address ?? MeshAddress.fromAddress(accessMessage.destination),
      accessMessage.aid,
      accessMessage.sequence,
      accessMessage.ivIndex,
      accessMessage.transportMicSize,
      decryptedData,
      accessMessage.upperTransportPdu,
    );
  }

  public static fromAccessPdu(
    pdu: AccessPdu,
    keySet: KeySet,
    sequence: UInt32,
    ivIndex: IvIndex,
  ): UpperTransportPdu {
    const security = pdu.message!.security;
    // The nonce type is 0x01 for messages signed with Application Key and
    // 0x02 for messages signed using Device Key (Configuration Messages).
    const type: UInt8 = typeof keySet.aid !== "undefined" ? 0x01 : 0x02;
    // ASZMIC is set to 1 for messages that shall be sent with high security
    // (64-bit TransMIC). This is possible only for Segmented Access Messages.
    const aszmic: UInt8 =
      security === MeshMessageSecurity.high && (pdu.accessPdu.length > 11 || pdu.isSegmented)
        ? 1
        : 0;
    // SEQ is 24-bit value, in Big Endian.
    const seq = packUInt32BE(sequence).slice(1);

    const nonce = concatUint8Arrays([
      new Uint8Array([type, aszmic << 7]),
      seq,
      pdu.source.bytesBE,
      pdu.destination.address.bytesBE,
      packUInt32BE(ivIndex.transmitIndex),
    ]);

    const accessPdu = pdu.accessPdu;
    const transportMicSize = aszmic === 0 ? 4 : 8;
    return new UpperTransportPdu(
      pdu.message,
      pdu.userInitiated,
      pdu.source,
      pdu.destination,
      keySet.aid,
      sequence,
      ivIndex.transmitIndex,
      transportMicSize,
      accessPdu,
      Crypto.encrypt(
        accessPdu,
        keySet.accessKey,
        nonce,
        transportMicSize,
        pdu.destination.virtualLabel?.bytes,
      ),
    );
  }

  /**
   * This method tries to decode the Access Message using a matching Application Key
   * based on the `aid` field value, or the Device Key of the local or source Node.
   *
   * @param accessMessage The Lower Transport Layer Access Message received.
   * @param meshNetwork The mesh network for which the PDU should be decoded.
   * @returns The Upper Transport Layer PDU, of `undefined` if none of the keys worked.
   */
  static decode(
    accessMessage: AccessMessage,
    meshNetwork: MeshNetwork,
  ): { pdu: UpperTransportPdu; keySet: AccessKeySet | DeviceKeySet } | undefined {
    // Was the message signed using Application Key?
    const aid = accessMessage.aid;
    if (typeof aid !== "undefined") {
      // When the message was sent to a Virtual Address, the message must be decoded
      // with the Virtual Label as Additional Data.
      let matchingGroups: Array<Group | undefined>;
      if (accessMessage.destination.isVirtual) {
        // Find all groups with matching Virtual Address.
        matchingGroups = meshNetwork.groups.filter((group) => {
          return group.address.address.equal(accessMessage.destination);
        });
      } else {
        // If the message was not sent to a Virtual Address, just add nil to the
        // matching groups. That way it will be decoded once with group = undefined.
        matchingGroups = [undefined];
      }
      // Go through all the Application Keys bound to the Network Key that the message
      // was decoded with.
      for (const applicationKey of ApplicationKeys.boundToNetworkKey(
        meshNetwork.applicationKeys,
        accessMessage.networkKey,
      )) {
        // The matchingGroups contains either a list of Virtual Groups, or a single nil.
        for (const group of matchingGroups) {
          // Each time try decoding using the new, or the old key (if such exist)
          // when the generated aid matches the one sent in the message.
          const newKeyPdu = UpperTransportPdu.fromLowerTransportAccessMessage(
            accessMessage,
            applicationKey.key,
            group,
          );
          if (aid == applicationKey.aid && typeof newKeyPdu !== "undefined") {
            const keySet = new AccessKeySet(applicationKey);
            return { pdu: newKeyPdu, keySet };
          }
          const oldAid = applicationKey.oldAid;
          const key = applicationKey.oldKey;
          if (typeof oldAid !== "undefined" && aid === oldAid && typeof key !== "undefined") {
            const oldKeyPdu = UpperTransportPdu.fromLowerTransportAccessMessage(
              accessMessage,
              key,
              group,
            );
            if (typeof oldKeyPdu !== "undefined") {
              const keySet = new AccessKeySet(applicationKey);
              return { pdu: oldKeyPdu, keySet };
            }
          }
        }
      }
    } else {
      // Try decoding using source's Node Device Key. This should work if a status
      // message was sent as a response to a Config Message sent by this Provisioner.
      const sourceNode = meshNetwork.nodeWithAddress(accessMessage.source);
      const sourceDeviceKey = sourceNode?.deviceKey;
      if (typeof sourceNode !== "undefined" && typeof sourceDeviceKey !== "undefined") {
        const pdu = UpperTransportPdu.fromLowerTransportAccessMessage(
          accessMessage,
          sourceDeviceKey,
        );
        const keySet = DeviceKeySet.fromNetworkKey(accessMessage.networkKey, sourceNode);
        if (typeof keySet !== "undefined" && typeof pdu !== "undefined") return { pdu, keySet };
      }
      // On the other hand, if another Provisioner is sending Config Messages,
      // they will be signed using the target Node Device Key instead.
      const destinationNode = meshNetwork.nodeWithAddress(accessMessage.destination);
      const destinationDeviceKey = destinationNode?.deviceKey;
      if (typeof destinationNode !== "undefined" && typeof destinationDeviceKey !== "undefined") {
        const pdu = UpperTransportPdu.fromLowerTransportAccessMessage(
          accessMessage,
          destinationDeviceKey,
        );
        const keySet = DeviceKeySet.fromNetworkKey(accessMessage.networkKey, destinationNode);
        if (typeof pdu !== "undefined" && typeof keySet !== "undefined") return { pdu, keySet };
      }
    }
    return undefined;
  }
  public toString(): string {
    const micSize = this.transportMicSize;
    const encryptedDataSize = this.transportPdu.length - micSize;
    const encryptedData = this.transportPdu.slice(0, encryptedDataSize);
    const mic = this.transportPdu.slice(encryptedDataSize);
    return `Upper Transport PDU (encrypted data: 0x${uint8ArrayToHex(encryptedData)}, transMic: 0x${uint8ArrayToHex(mic)}))`;
  }
}
