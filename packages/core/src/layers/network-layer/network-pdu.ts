import { Address, Data, IvIndex, packUInt32BE, UInt16, UInt32, UInt8 } from "@blemeshjs/utils";
import { PduType } from "../../bearer/bearer.js";
import { MeshNetwork } from "../../mesh-models/index.js";
import { NetworkKey, NetworkKeyDerivatives } from "../../mesh-models/index.js";
import {
  LowerTransportPdu,
  LowerTransportPduType,
} from "../lower-transport-layer/lower-transport-pdu.js";
import { Crypto } from "@blemeshjs/crypto";
import { concatUint8Arrays, uint8ArrayToHex } from "uint8array-extras";
import Long from "long";

export class NetworkPdu {
  /**
   * Whether the Network PDU contains a segmented Lower Transport PDU.
   */
  public get isSegmented(): boolean {
    return (this.transportPdu[0] & 0x80) !== 0x00 && this.transportPdu.length > 4;
  }

  /**
   * Whether the Network PDU contains a Segment Acknowledgment message.
   */
  public get isSegmentAcknowledgmentMessage(): boolean {
    return this.transportPdu[0] === 0x00 && this.transportPdu.length === 7;
  }

  /**
   * The SeqZero field of the message.
   *
   * The message must be either a Segment Access message, Segmented Control message
   * or Segment Acknowledgment message, otherwise this is `undefined`.
   */
  public get sequenceZero(): UInt16 | undefined {
    if (!this.isSegmented && !this.isSegmentAcknowledgmentMessage) {
      return undefined;
    }
    return ((this.transportPdu[1] & 0x7f) << 6) | (this.transportPdu[2] >> 2);
  }

  private constructor(
    /**
     * Raw PDU data.
     */
    public pdu: Data,
    /**
     * The Network Key used to decode/encode the PDU.
     */
    public networkKey: NetworkKey,
    /**
     * The IV Index used to decode/encode the PDU.
     */
    public ivIndex: UInt32,
    /**
     * Least significant bit of IV Index.
     */
    public ivi: UInt8,
    /**
     * Value derived from the NetKey used to identify the Encryption Key
     * and Privacy Key used to secure this PDU.
     */
    public nid: UInt8,
    /**
     * PDU type.
     */
    public type: LowerTransportPduType,
    /**
     * Time To Live.
     */
    public ttl: UInt8,
    /**
     * Sequence Number.
     */
    public sequence: UInt32,
    /**
     * Source Address.
     */
    public source: Address,
    /**
     * Destination Address.
     */
    public destination: Address,
    /**
     * Transport Protocol Data Unit. It is guaranteed to have 1 to 16 bytes.
     */
    public transportPdu: Data,
  ) {}

  /**
   * Creates Network PDU object from received PDU. The initiator tries
   * to deobfuscate and decrypt the data using given Network Key and IV Index.
   *
   * @param pdu The data received from mesh network.
   * @param pduType The type of the PDU: `PduType.networkPdu` or `PduType.proxyConfiguration`.
   * @param networkKey The Network Key to decrypt the PDU.
   * @param ivIndex The current IV Index.
   * @returns The deobfuscated and decoded Network PDU object, or `undefined`, if the key or IV Index don't match.
   */
  public static decode(
    pdu: Data,
    pduType: PduType,
    networkKey: NetworkKey,
    ivIndex: IvIndex,
  ): NetworkPdu | undefined {
    if (pduType !== PduType.networkPdu && pduType !== PduType.proxyConfiguration) {
      return undefined;
    }

    // Valid message must have at least 14 octets.
    if (pdu.length < 14) {
      return undefined;
    }

    // The first byte is not obfuscated
    const ivi = pdu[0] >> 7;
    const nid = pdu[0] & 0x7f;

    // The NID must match.
    // If the Key Refresh procedure is in place, the received packet might have been
    // encrypted using an old key. We have to try both.
    const keySets: Array<NetworkKeyDerivatives> = [];
    if (networkKey.keys.nid === nid) {
      keySets.push(networkKey.keys);
    }

    const oldNid = networkKey.oldKeys?.nid;
    if (typeof oldNid !== "undefined" && oldNid === nid) {
      keySets.push(networkKey.oldKeys!);
    }

    if (!keySets.length) {
      return undefined;
    }

    // IVI should match the LSB bit of current IV Index.
    // If it doesn't, the PDU will be deobfuscated and decoded with IV Index
    // decremented by 1.
    // See: Bluetooth Mesh Profile 1.0.1 Specification, chapter: 3.10.5.
    const $ivIndex = ivIndex.indexFor(ivi);

    for (const keys of keySets) {
      // Deobfuscate CTL, TTL, SEQ and SRC.
      const obfuscatedData = pdu.slice(1, 7); // 6 bytes following IVI
      const random = pdu.slice(7, 14); // 7 bytes of encrypted data
      const deobfuscatedData = Crypto.obfuscate(obfuscatedData, random, $ivIndex, keys.privacyKey);
      // First validation: Control Messages have NetMIC of size 64 bits.
      const ctl = deobfuscatedData[0] >> 7;
      if (!(ctl == 0 || pdu.length >= 18)) {
        continue;
      }

      const type = ctl;
      const ttl = deobfuscatedData[0] & 0x7f;
      // Multiple octet values use Big Endian.
      const sequence =
        (deobfuscatedData[1] << 16) | (deobfuscatedData[2] << 8) | deobfuscatedData[3];
      const source = new Address((deobfuscatedData[4] << 8) | deobfuscatedData[5]);

      const micOffset = Long.fromNumber(pdu.length).sub(LowerTransportPduType.netMicSize(type));
      const destAndTransportPdu = pdu.slice(7, micOffset.toNumber());
      const mic = pdu.slice(micOffset.toNumber(), pdu.length);

      const nonce = concatUint8Arrays([
        new Uint8Array([PduType.nonceId(pduType)]),
        deobfuscatedData,
        new Uint8Array([0x00, 0x00]),
        packUInt32BE($ivIndex),
      ]);
      if (PduType.proxyConfiguration === pduType) {
        nonce[1] = 0x00; // Pad
      }
      const decryptedData = Crypto.decrypt(
        destAndTransportPdu,
        keys.encryptionKey,
        nonce,
        mic,
        undefined,
      );
      if (typeof decryptedData === "undefined") continue;

      const destination = new Address((decryptedData[0] << 8) | decryptedData[1]);
      const transportPdu = decryptedData.slice(2, decryptedData.length);

      return new NetworkPdu(
        pdu,
        networkKey,
        $ivIndex,
        ivi,
        nid,
        type,
        ttl,
        sequence,
        source,
        destination,
        transportPdu,
      );
    }
  }
  /**
   * Creates the Network PDU. This method encrypts and obfuscates data
   * that are to be send to the mesh network.
   *
   * @param lowerTransportPdu The data received from higher layer.
   * @param pduType The type of the PDU: `PduType.networkPdu` or `PduType.proxyConfiguration`.
   * @param sequence The SEQ number of the PDU. Each PDU between the source and destination must have strictly increasing sequence number.
   * @param ttl Time To Live.
   * @returns The Network PDU object.
   */
  public static encode(
    lowerTransportPdu: LowerTransportPdu,
    pduType: PduType,
    sequence: UInt32,
    ttl: UInt8,
  ): NetworkPdu | Error {
    if (pduType !== PduType.networkPdu && pduType !== PduType.proxyConfiguration) {
      return new Error(
        "Only PduType.networkPdu and PduType.configurationPdu may be encoded into a NetworkPdu",
      );
    }
    // The key set used for encryption depends on the Key Refresh Phase.
    const networkKey = lowerTransportPdu.networkKey;
    const keys = networkKey.transmitKeys;
    const destination = lowerTransportPdu.destination;
    const transportPdu = lowerTransportPdu.transportPdu;
    const source = lowerTransportPdu.source;
    const type = lowerTransportPdu.type;
    const nid = keys.nid;
    const ivIndex = lowerTransportPdu.ivIndex;
    const ivi: UInt8 = ivIndex & 0x1;

    const iviNid = (ivi << 7) | (nid & 0x7f);
    const ctlTtl = (type << 7) | (ttl & 0x7f);

    // Data to be obfuscated: CTL/TTL, Sequence Number, Source Address.
    const seq = packUInt32BE(sequence).slice(1);
    const deobfuscatedData = concatUint8Arrays([new Uint8Array([ctlTtl]), seq, source.bytesBE]);

    // Data to be encrypted: Destination Address, Transport PDU.
    const decryptedData = concatUint8Arrays([destination.bytesBE, transportPdu]);

    const nonce = concatUint8Arrays([
      new Uint8Array([PduType.nonceId(pduType)]),
      deobfuscatedData,
      new Uint8Array([0x00, 0x00]),
      packUInt32BE(ivIndex),
    ]);
    if (pduType === PduType.proxyConfiguration) {
      nonce[1] = 0x00; // Pad
    }
    const encryptedData = Crypto.encrypt(
      decryptedData,
      keys.encryptionKey,
      nonce,
      LowerTransportPduType.netMicSize(type),
      undefined,
    );
    const obfuscatedData = Crypto.obfuscate(
      deobfuscatedData,
      encryptedData,
      ivIndex,
      keys.privacyKey,
    );

    const pdu = concatUint8Arrays([new Uint8Array([iviNid]), obfuscatedData, encryptedData]);

    return new NetworkPdu(
      pdu,
      networkKey,
      ivIndex,
      ivi,
      nid,
      type,
      ttl,
      sequence,
      source,
      destination,
      transportPdu,
    );
  }

  toString(): string {
    const micSize = LowerTransportPduType.netMicSize(this.type);
    const encryptedDataSize = this.pdu.length - (micSize - 9);
    const encryptedData = this.pdu.slice(9, 9 + encryptedDataSize);
    const mic = this.pdu.slice(9 + encryptedDataSize);
    return `Network PDU (ivi: ${this.ivi}, nid: 0x${this.nid.toString(16)}, ctl: ${this.type}, ttl: ${this.ttl}, seq: ${this.sequence}, src: ${this.source.hex}, dst: ${this.destination.hex}, transportPdu: 0x${uint8ArrayToHex(encryptedData)}, netMic: 0x${uint8ArrayToHex(mic)})`;
  }
}

export class NetworkPduDecoder {
  private constructor() {}

  /**
   * This method goes over all Network Keys in the mesh network and tries
   * to deobfuscate and decode the network PDU.
   *
   * @param pdu The received PDU.
   * @param type The type of the PDU: `PduType.networkPdu` or `PduType.proxyConfiguration`.
   * @param meshNetwork The mesh network for which the PDU should be decoded.
   * @returns The deobfuscated and decoded Network PDU, or `undefined` if the PDU was not signed with any of the Network Keys, the IV Index was not valid, or the PDU was invalid.
   */
  public static decode(pdu: Data, type: PduType, meshNetwork: MeshNetwork): NetworkPdu | undefined {
    for (const networkKey of meshNetwork.networkKeys) {
      const networkPdu = NetworkPdu.decode(pdu, type, networkKey, meshNetwork.ivIndex);
      if (typeof networkPdu !== "undefined") return networkPdu;
    }
    return undefined;
  }
}
