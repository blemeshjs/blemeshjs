import { Int64, MeshMessage, UInt16, UInt8 } from "@mesh-link-js/utils";
import { LowerTransportPdu } from "./lower-transport-pdu.js";
import Long from "long";

export abstract class SegmentedMessage extends LowerTransportPdu {
  protected abstract $message: MeshMessage | undefined;
  /**
   * The Mesh Message that is being sent, or `undefined`, when the message
   * was received.
   */
  public get message(): MeshMessage | undefined {
    return this.$message;
  }
  protected abstract $userInitiated: boolean;
  /**
   * Whether sending this message has been initiated by the user.
   */
  public get userInitiated(): boolean {
    return this.$userInitiated;
  }
  protected abstract $sequenceZero: UInt16;
  /**
   * 13 least significant bits of SeqAuth (SeqZero).
   */
  public get sequenceZero(): UInt16 {
    return this.$sequenceZero;
  }
  protected abstract $segmentOffset: UInt8;
  /**
   * This field is set to the segment number (zero-based)
   * of the segment m of this Upper Transport PDU (SegO).
   */
  public get segmentOffset(): UInt8 {
    return this.$segmentOffset;
  }
  protected abstract $lastSegmentNumber: UInt8;
  /**
   * This field is set to the last segment number (zero-based)
   * of this Upper Transport PDU (SegN).
   */
  public get lastSegmentNumber(): UInt8 {
    return this.$lastSegmentNumber;
  }

  /**
   * Returns whether the message is composed of only a single
   * segment. Single segment messages are used to send short,
   * acknowledged messages. The maximum size of payload of upper
   * transport control PDU is 8 bytes.
   */
  public get isSingleSegment(): boolean {
    return this.lastSegmentNumber === 0;
  }

  /**
   * Returns the `segmentOffset` as `Int64`.
   */
  public get index(): Int64 {
    return Long.fromNumber(this.segmentOffset);
  }

  /**
   * Returns the expected number of segments for this message.
   */
  public get count(): Int64 {
    return Long.fromNumber(this.lastSegmentNumber + 1);
  }
}
