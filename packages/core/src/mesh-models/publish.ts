import { Clazz, createModelSchema, custom, object, primitive } from "serializr";
import { MeshAddress } from "./mesh-address.js";
import {
  TimeInterval,
  UInt8,
  StepResolution,
  UInt16,
  KeyIndex,
  Int64,
  toPaddedHex64Signed,
} from "@blemeshjs/utils";

/**
 * The Publishing Period state determines the interval at which status messages
 * are periodically published by a Model.
 */
export abstract class Period {
  /**
   * The interval between subsequent publications in seconds.
   */
  public abstract interval: TimeInterval;
  /**
   * The number of steps, in range 0...63.
   */
  public abstract numberOfSteps: UInt8;
  /**
   * The resolution of the number of steps.
   */
  public abstract resolution: StepResolution;
}

/**
 * The object is used to describe the number of times a message is published and
 * the interval between retransmissions of the published message.
 */
abstract class Retransmit {
  /**
   * Number of retransmissions for network messages.
   * The value is in range from 0 to 7, where 0 means no retransmissions.
   */
  public abstract count: UInt8;
  /**
   * The interval (in milliseconds) between retransmissions (50...1600 with step 50).
   */
  public abstract interval: UInt16;
}

/**
 * The Publishing object defines the publication configuration for a Model.
 *
 * When a Model is configured for publishing, it will sent messages whenever a state
 * of the Model has changed, or periodically. The Publish object defines the destination
 * address and the Application Key to encrypt the messages, together with other settings.
 *
 * To set the publication on a Model, send the `ConfigModelPublicationSet` or
 * `ConfigModelPublicationVirtualAddressSet` messages to the Configuration Server model
 * on the Node. The *Set* messages are confirmed with a `ConfigModelPublicationStatus`.
 */
export abstract class Publish {
  /**
   * The interval between subsequent publications.
   */
  public abstract period: Period;
  /**
   * An Application Key index, indicating which Application Key to
   * use for the publication.
   */
  public abstract index: KeyIndex;
  /**
   * An integer from 0 to 127 that represents the Time To Live (TTL)
   * value for the outgoing publish message. 255 means default TTL value.
   */
  public abstract ttl: UInt8;
  /**
   * The object describes the number of times a message is published and the
   * interval between retransmissions of the published message.
   */
  public abstract retransmit: Retransmit;
  /**
   * Publication address for the Model. It's 4 or 32-character long
   * hexadecimal string.
   */
  public abstract address: string;
  /**
   * An integer 0 o 1 that represents whether master security
   * (0) materials or friendship security material (1) are used.
   */
  public abstract credentials: Int64;
  /**
   * Publication address for the model.
   */
  public abstract get publicationAddress(): MeshAddress;
}

createModelSchema(Period as unknown as Clazz<object>, {
  numberOfSteps: primitive(),
  resolution: custom(
    (v: StepResolution) => v,
    (v: number) => v,
  ),
});

createModelSchema(Retransmit as unknown as Clazz<object>, {
  count: primitive(),
  interval: primitive(),
});

createModelSchema(Publish as unknown as Clazz<object>, {
  period: object(Period as unknown as Clazz<object>),
  index: custom(
    (v: KeyIndex) => v.valueOf(),
    (v: number) => v,
  ),
  ttl: primitive(),
  retransmit: object(Retransmit as unknown as Clazz<object>),
  address: primitive(),
  credentials: custom(
    (v: Int64) => toPaddedHex64Signed(v),
    (v: number) => v,
  ),
});
