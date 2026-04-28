import { Double, Int64, TimeInterval, UInt8 } from "@blemeshjs/utils";
import Long from "long";
/**
 * The builder allows easy configuration of `NetworkParameters`.
 */
export class NetworkParametersConfig {
  public networkParameters: NetworkParameters = NetworkParameters.default;

  // MARK: - TTL Configuration

  /**
   * Sets the default Time To Live (TTL) which will be used for sending messages if the value has
   * not been set for the Provisioner's Node.
   *
   * In Bluetooth Mesh each message is sent with a TTL value. When a relay
   * Node receives such message, it decrements the TTL value by 1, re-encrypts it
   * using the same Network Key and retransmits further. If the received TTL value is
   * 1 or 0 the message is no longer retransmitted.
   *
   * By default default TTL is set to 5, which is a reasonable value. The TTL shall be in range 2...127.
   *
   * @see `NetworkParameters.defaultTtl`
   */
  public setDefaultTtl(ttl: UInt8) {
    this.networkParameters.defaultTtl = ttl;
  }

  // MARK: - SAR Received Configuration

  /**
   * Sets the time after which an incomplete segmented message is discarded when no new segment
   * is received. The timer is restarted each time a new segment is received.
   *
   * @param timeout The time since last received segment, after which segmented message is discarded. Valid range for the timeout is from 5 seconds to 1 minute and 20 seconds (80 seconds) with 5 second step. Default value is 10 seconds.
   * @see `NetworkParameters.sarDiscardTimeout`
   */
  public discardIncompleteSegmentedMessages(timeout: TimeInterval) {
    this.networkParameters.sarDiscardTimeout = Math.min(5.0, timeout) / 5.0 - 1;
  }

  /**
   * Sets the parameters for calculating the interval between receiving a new segment of a segmented
   * message for a destination that is a Unicast Address and sending a Segment Acknowledgment message.
   *
   * The Segment Acknowledgment message contains information about which segments have been
   * received until the moment of sending the message. Upon receiving, the transmitter should retransmit
   * all missing segments.
   *
   * The initial value of the timer for a given message depends on number of segments and is calculated
   * using the following formula:
   * ```
   * min(number of segment - 0.5, acknowledgment delay increment) * segment reception interval (ms)
   * ```
   *
   * Number of retransmissions of the Segment Acknowledgment message can be set using
   * `retransmitSegmentAcknowledgmentMessages`.
   *
   * @param segmentReceptionInterval A value that indicates the interval between received segments of a segmented message. Available values are in range 10 ms - 160 ms with 10 ms step with default value 60 ms.
   * @param acknowledgmentDelayIncrement The minimum delay increment is a value that controls the interval between the reception of a new segment of a segmented message for a destination that is a Unicast Address and the transmission of the Segment Acknowledgment for that message. Valid values are 1.5, 2.5, ... until 8.5 with the default value being 1.5.
   * @see `NetworkParameters.sarReceiverSegmentIntervalStep`
   * @see `NetworkParameters.sarAcknowledgmentDelayIncrement`
   */
  public transmitSegmentAcknowledgmentMessage(
    segmentReceptionInterval: TimeInterval,
    acknowledgmentDelayIncrement: Double,
  ) {
    // Valid range: 10-160 ms
    this.networkParameters.sarReceiverSegmentIntervalStep =
      Math.max(0.01, Math.min(0.16, segmentReceptionInterval)) * 100 - 1;
    // Valid range: 1.5-8.5 segment transmission interval steps
    this.networkParameters.sarAcknowledgmentDelayIncrement = Math.max(
      0,
      Math.max(1.5, Math.min(8.5, acknowledgmentDelayIncrement)) - 1.5,
    );
  }

  /**
   * Sets the parameters controlling retransmission of Segment Acknowledgment messages
   * for incomplete messages.
   *
   * When a receiver receives a segment of a segmented message composed of 2 or more
   * segments it starts the SAR Acknowledgment timer. The initial value of this timer
   * is controller by `transmitSegmentAcknowledgmentMessage`
   * and depends on the number of segments. Each time a new segment is received, the timer
   * is restarted. When the timer expires, a Segment Acknowledgment message is sent to the
   * transmitter indicating which segments were received until that point.
   *
   * When the number of segments of the message is greater than the `threshold` and
   * the `count` parameter is greater than 0 the Segment Acknowledgment message is
   * retransmitted `count` times.
   *
   * By default retransmissions of Segment Acknowledgment messages are disabled.
   *
   * @param count Number of retransmissions of Segment Acknowledgment.
   *            Valid values are 0-3, where 0 disables retransmissions.
   *            By default retransmissions are disabled.
   * @param threshold The number of segments above which the retransmissions of
   *                Segment Acknowledgment messages are enabled.
   *                By default, the threshold is set to 3 segments.
   * @see `NetworkParameters.sarAcknowledgmentRetransmissionsCount`
   * @see `NetworkParameters.sarSegmentsThreshold`
   */
  public retransmitSegmentAcknowledgmentMessages(count: UInt8, threshold: UInt8) {
    this.networkParameters.sarAcknowledgmentRetransmissionsCount = count;
    this.networkParameters.sarSegmentsThreshold = threshold;
  }

  // MARK: - SAR Transmitter Configuration

  /**
   * Sets the interval between transmissions of segments of a segmented message.
   *
   * @param interval The interval in seconds, in range 10 - 160 ms with 10 ms step.
   *                       The default interval is 60 ms.
   * @see `NetworkParameters.sarSegmentIntervalStep`
   */
  public transmitSegments(interval: TimeInterval) {
    this.networkParameters.sarSegmentIntervalStep = Math.max(0.01, interval) / 0.01 - 1;
  }

  /**
   * Sets the parameters of retransmissions of segments of a segmented message
   * for a destination that is a Unicast Address.
   *
   * The number of retransmissions and number of retransmissions without progress  indicate the
   * maximum number of retransmissions before sending the message is cancelled.
   * The count without progress is reset each time a Segment Acknowledgment message indicating
   * a progress in transfer is received.
   *
   * The `interval` and `increment`define the interval between retransmissions in case no
   * Segment Acknowledgment message is received. When an acknowledgment is received, the
   * missing segments are transmitted immediately.
   *
   * The `interval` indicates the fixed interval added to a product of the `increment` and a value
   * calculated using the formula: `TTL - 1`, where the TTL is the Time To Live value with which the
   * message is sent.
   *
   * - parameters:
   *   - retransmissionsCount: Maximum number of retransmissions of segments of a segmented
   *            message. Default value is 2 retransmissions (3 transmissions, including the initial one).
   *   - retransmissionsWithoutProgressCount: Maximum number of retransmissions of segments
   *            of a segmented message in case no new segments were acknowledged.
   *            Default value is 2 retransmissions (3 transmissions, including the initial one).
   *   - interval: The constant component of the interval between retransmissions.
   *               Default interval is 200 ms. Valid range is from 25 ms to 400 ms with 25 ms interval.
   *   - increment: The increment component the the interval, which is multiplied by `TTL - 1`.
   *                Default increment is 50 ms. Valid range is from 25 ms to 400 ms with 25 ms interval.
   * @see `NetworkParameters.sarUnicastRetransmissionsCount`
   * @see `NetworkParameters.sarUnicastRetransmissionsWithoutProgressCount`
   * @see `NetworkParameters.sarUnicastRetransmissionsIntervalStep`
   * @see `NetworkParameters.sarUnicastRetransmissionsIntervalIncrement`
   */
  public retransmitUnacknowledgedSegmentsToUnicastAddress(
    retransmissionsCount: UInt8,
    retransmissionsWithoutProgressCount: UInt8,
    interval: TimeInterval,
    increment: TimeInterval,
  ) {
    this.networkParameters.sarUnicastRetransmissionsCount = retransmissionsCount;
    this.networkParameters.sarUnicastRetransmissionsWithoutProgressCount =
      retransmissionsWithoutProgressCount;
    this.networkParameters.sarUnicastRetransmissionsIntervalStep =
      Math.min(0.4, Math.max(interval, 0.025)) * 40 - 1;
    this.networkParameters.sarUnicastRetransmissionsIntervalIncrement =
      Math.min(0.4, Math.max(increment, 0.025)) * 40 - 1;
  }

  /**
   * Sets number and interval of retransmissions of segments of a segmented message for
   * a destination that is a Group Address or a Virtual Address.
   *
   *   @param total Number of retransmissions of segments of a segmented message
   *            for a multicast destination. The default value is 3.
   *   @param interval The interval between retransmissions of segments.
   *               The default interval is 250 ms.
   * @see `NetworkParameters.sarMulticastRetransmissionsCount`
   * @see `NetworkParameters.sarMulticastRetransmissionsIntervalStep`
   */
  public retransmitAllSegmentsToGroupAddress(total: Long, interval: TimeInterval) {
    this.networkParameters.sarMulticastRetransmissionsCount = total.toNumber();
    this.networkParameters.sarMulticastRetransmissionsIntervalStep =
      Math.min(0.4, Math.max(interval, 0.025)) * 40 - 1;
  }

  // MARK: - Access Layer

  /**
   * Sets the timeout for receiving a response to an acknowledged access message.
   *
   * The ``MeshNetworkDelegate/meshNetworkManager(_:failedToSendMessage:from:to:error:)-9gepm``
   * callback will be called when the response is not received before the timeout expires..
   *
   * @param timeout The timeout after which the `AccessError.timeout`
   *                      is reported. This shall be set to a minimum of 30 seconds,
   *                      which is also the default value.
   * @see `NetworkParameters.acknowledgmentMessageTimeout`
   */
  public discardAcknowledgedMessages(timeout: TimeInterval) {
    this.networkParameters.acknowledgmentMessageTimeout = timeout;
  }

  /**
   * Sets the base time after which the acknowledged message is repeated.
   *
   * The repeat timer will be set using the following formula:
   * ```
   * acknowledgment message interval + 50 ms * TTL + 50 ms * number of segments
   * ```
   * TTL and the component dependent on number of segments are added
   * automatically. This method adjusts only the constant component.
   *
   * The interval is doubled each time the request is retransmitted until the
   * response is received or the timeout set using `discardAcknowledgedMessages()`
   * expires.
   * @see `NetworkParameters.acknowledgmentMessageInterval`
   */
  public retransmitAcknowledgedMessage(interval: TimeInterval) {
    this.networkParameters.acknowledgmentMessageInterval = interval;
  }

  /**
   * Builds the `NetworkParameters` structure.
   */
  public build(): NetworkParameters {
    return this.networkParameters;
  }
}

export class NetworkParameters {
  /**
   * A set of default network parameters.
   *
   * Example:
   * ```ts
   * meshNetworkManager.networkParameters = NetworkParameters.default
   * ```
   */
  public static readonly default = new NetworkParameters();

  public static basic(builder: (config: NetworkParametersConfig) => void): NetworkParameters {
    const config = new NetworkParametersConfig();
    builder(config);
    return config.build();
  }

  private $acknowledgmentMessageInterval: TimeInterval = 2;

  private $acknowledgmentMessageTimeout: TimeInterval = 30;
  /**
   * If the Element does not receive a response within a period of time known
   * as the acknowledged message timeout, then the Element may consider the
   * message has not been delivered, without sending any additional messages.
   *
   * The `MeshNetworkHandler.meshNetworkManagerFailedToSendMessage()`
   * callback will be called on timeout.
   *
   * The acknowledged message timeout should be set to a minimum of 30 seconds,
   * which is the default value.
   */
  public get acknowledgmentMessageTimeout(): TimeInterval {
    return this.$acknowledgmentMessageTimeout;
  }
  public set acknowledgmentMessageTimeout(value: TimeInterval) {
    this.$acknowledgmentMessageTimeout = Math.max(30, value);
  }

  /**
   * The base time after which the acknowledged message will be repeated.
   *
   * The repeat timer will be set using the following formula:
   * ```
   * acknowledgment message interval + 50 ms * TTL + 50 ms * number of segments
   * ```
   * The TTL and segment count dependent parts are added
   * automatically, and this value shall specify only the constant part.
   *
   * The interval is doubled each time a request is retransmitted.
   *
   * The default value is 2 seconds.
   */
  public get acknowledgmentMessageInterval(): TimeInterval {
    return this.$acknowledgmentMessageInterval;
  }
  public set acknowledgmentMessageInterval(value: TimeInterval) {
    this.$acknowledgmentMessageInterval = Math.max(2.0, value);
  }

  private readonly $defaultTtl: UInt8 = 5;
  /**
   * The default value of Time To Live (TTL), which is used for sending messages if the
   * value is not set for the Provisioner's Node.
   *
   * In Bluetooth Mesh each message is sent with a given TTL value. When a relay
   * Node receives such message it decrements the TTL value by 1, re-encrypts it
   * using the same Network Key and retransmits further. If the received TTL value is
   * 1 or 0 the message is no longer retransmitted.
   *
   * By default TTL is set to 5, which is a reasonable value. The TTL shall be in range 2...127.
   */
  public get defaultTtl(): UInt8 {
    return this.$defaultTtl;
  }
  public set defaultTtl(value: UInt8) {
    // @ts-expect-error readonly but we change it in the setter
    this.$defaultTtl = Math.max(2, Math.min(value, 127));
  }

  /**
   * According to Bluetooth Mesh Profile 1.0.1, section 3.10.5, if the IV Index
   * of the mesh network increased by more than 42 since the last connection
   * (which can take at least 48 weeks), the Node should be re-provisioned.
   * However, as this library can be used to provision other Nodes, it should not
   * be blocked from sending messages to the network only because the phone wasn't
   * connected to the network for that time. This flag can disable this check,
   * effectively allowing such connection.
   *
   * The same can be achieved by clearing the app data (uninstalling and reinstalling
   * the app) and importing the mesh network. With no "previous" IV Index, the
   * library will accept any IV Index received in the Secure Network beacon upon
   * connection to the GATT Proxy Node.
   */
  public allowIvIndexRecoveryOver42: boolean = false;

  /**
   * IV Update Test Mode enables efficient testing of the IV Update procedure.
   * The IV Update test mode removes the 96-hour limit; all other behavior of the device
   * are unchanged.
   *
   * @see Bluetooth Mesh Profile 1.0.1, section 3.10.5.1.
   */
  public ivUpdateTestMode: boolean = false;

  private $sarSegmentIntervalStep: UInt8 = 0b0101; // (n+1)*10 ms = 60 ms
  /**
   * The **SAR Segment Interval Step state** is a 4-bit value that controls
   * the interval between transmissions of segments of a segmented message.
   *
   * The segment transmission interval is the number of milliseconds calculated
   * using the following formula:
   * ```
   * (SAR Segment Interval Step + 1) * 10 ms
   * ```
   * The default value of the **SAR Segment Interval Step state** is `0b0101`
   * (60 milliseconds).
   */
  public get sarSegmentIntervalStep() {
    return this.$sarSegmentIntervalStep;
  }
  public set sarSegmentIntervalStep(newValue: UInt8) {
    this.$sarSegmentIntervalStep = Math.min(newValue, 0b1111); // Valid range: 0-15
  }

  /**
   * The interval between transmissions of segments of a segmented message.
   *
   * The value of this interval is indicated by **SAR Segment Interval Step state**.
   *
   * @see `sarSegmentIntervalStep`
   */
  public get segmentTransmissionInterval(): TimeInterval {
    return (this.$sarSegmentIntervalStep + 1) * 0.01;
  }

  private $sarMulticastRetransmissionsIntervalStep: UInt8 = 0b1001; // (n+1)*25 ms = 250 ms
  /**
   *The SAR Multicast Retransmissions Interval Step state** is a 4-bit
   * value that controls the interval between retransmissions of segments of a
   * segmented message for a destination that is a group address or a virtual address.
   *
   * The multicast retransmissions interval is the number of milliseconds
   * calculated using the following formula:
   * ```
   * SAR Multicast Retransmissions Interval Step + 1
   * ```
   * The default value of the **SAR Multicast Retransmissions Interval Step state** is
   * `0b1001` (250 milliseconds).
   */
  public get sarMulticastRetransmissionsIntervalStep() {
    return this.$sarMulticastRetransmissionsIntervalStep;
  }
  public set sarMulticastRetransmissionsIntervalStep(newValue: UInt8) {
    this.$sarMulticastRetransmissionsIntervalStep = Math.min(newValue, 0b1111); // Valid range: 0-15
  }
  /**
   * The interval between retransmissions of segments of a segmented message for
   * a destination that is a Group Address or a Virtual Address.
   *
   * Valid range is from 25 ms to 400 ms with 25 ms interval.
   *
   * @see `sarMulticastRetransmissionsIntervalStep`
   */
  public get multicastRetransmissionsInterval(): TimeInterval {
    return (this.$sarMulticastRetransmissionsIntervalStep + 1) * 0.025;
  }

  private $sarUnicastRetransmissionsIntervalStep: UInt8 = 0b0111; // (n+1)*25 ms = 200 ms
  /**
   * The **SAR Unicast Retransmissions Interval Step state** is a 4-bit value
   * that controls the interval between retransmissions of segments of a segmented
   * message for a destination that is a Unicast Address.
   *
   * The unicast retransmissions interval step is the number of milliseconds calculated
   * using the following formula:
   * ```
   * (SAR Unicast Retransmissions Interval Step + 1) * 25 (ms)
   * ```
   * The default value of the **SAR Unicast Retransmissions Interval Step**
   * is `0b0111` (200 milliseconds).
   *
   * @see `sarUnicastRetransmissionsIntervalIncrement`
   */
  public get sarUnicastRetransmissionsIntervalStep() {
    return this.$sarUnicastRetransmissionsIntervalStep;
  }
  public set sarUnicastRetransmissionsIntervalStep(newValue: UInt8) {
    this.$sarUnicastRetransmissionsIntervalStep = Math.min(newValue, 0b1111); // Valid range: 0-15
  }
  /**
   * The interval between retransmissions of segments of a segmented
   * message for a destination that is a Unicast Address.
   *
   * Valid range is from 25 ms to 400 ms with 25 ms interval.
   * @see `sarUnicastRetransmissionsIntervalStep`
   */
  private get unicastRetransmissionsIntervalStep(): TimeInterval {
    return (this.$sarUnicastRetransmissionsIntervalStep + 1) * 0.025;
  }

  private $sarUnicastRetransmissionsIntervalIncrement: UInt8 = 0b0001; // (n+1)*25 ms = 50 ms
  /**
   * The **SAR Unicast Retransmissions Interval Increment state** is a 4-bit
   * value that controls the incremental component of the interval between
   * retransmissions of segments of a segmented message for a destination
   * that is a Unicast Address.
   *
   * The unicast retransmissions interval increment is the number of milliseconds
   * calculated using the following formula:
   * ```
   * (SAR Unicast Retransmissions Interval Increment + 1) * 25 (ms)
   * ```
   * The default value of the **SAR Unicast Retransmissions Interval Increment state**
   * is `0b0001` (50 milliseconds).
   *
   * @see `sarUnicastRetransmissionsIntervalStep`
   */
  public get sarUnicastRetransmissionsIntervalIncrement() {
    return this.$sarUnicastRetransmissionsIntervalIncrement;
  }
  public set sarUnicastRetransmissionsIntervalIncrement(newValue: UInt8) {
    this.$sarUnicastRetransmissionsIntervalIncrement = Math.min(newValue, 0b1111); // Valid range: 0-15
  }
  /**
   * The incremental component of the interval between retransmissions of segments
   * of a segmented message for a destination that is a Unicast Address.
   *
   * The increment component is multiplied by `TTL - 1` when calculating the
   * initial value of the SAR Unicast Retransmissions timer.
   *
   * Valid range is from 25 ms to 400 ms with 25 ms interval.
   * @see `sarUnicastRetransmissionsIntervalIncrement`
   */
  private get unicastRetransmissionsIntervalIncrement(): TimeInterval {
    return (this.$sarUnicastRetransmissionsIntervalIncrement + 1) * 0.025;
  }

  private $sarUnicastRetransmissionsCount: UInt8 = 0b0010; // 3
  /**
   * The **SAR Unicast Retransmissions Count state** is a 4-bit value that
   * controls the maximum number of transmissions of segments of segmented
   * messages to a Unicast Address destination.
   *
   * The maximum number of transmissions of a segment is given with the formula:
   * ```
   * SAR Unicast Retransmissions Count + 1
   * ```
   * For example, `0b0000` represents a single transmission, and `0b0111`
   * represents 8 transmissions.
   *
   * The default value of the **SAR Unicast Retransmissions Count state** is
   * `0b0010` (3 transmissions).
   *
   * @see `sarUnicastRetransmissionsWithoutProgressCount`
   */
  public get sarUnicastRetransmissionsCount(): UInt8 {
    return this.$sarUnicastRetransmissionsCount;
  }
  public set sarUnicastRetransmissionsCount(newValue: UInt8) {
    this.$sarUnicastRetransmissionsCount = Math.min(newValue, 0b1111); // Valid range: 0-15
  }

  private $sarUnicastRetransmissionsWithoutProgressCount: UInt8 = 0b0010; // 3
  /**
   * The **SAR Unicast Retransmissions Without Progress Count state**
   * is a 4-bit value that controls the maximum number of transmissions of segments
   * of segmented messages to a Unicast destination without progress
   * (i.e., without newly marking any segment as acknowledged).
   *
   * The maximum number of transmissions of a segment without progress is
   * calculated using the formula:
   * ```
   * SAR Unicast Retransmissions Without Progress Count + 1
   * ```
   * For example, `0b0000` represents a single transmission, and `0b0111`
   * represents 8 transmissions.
   *
   * The default value of the **SAR Unicast Retransmissions Without Progress
   * Count state** is `0b0010` (3 transmissions).
   *
   * NOTE: The value of this state should be set to a value greater than the
   *         value of the **SAR Acknowledgement Retransmissions Count**
   *         on a peer node. This helps prevent the SAR transmitter from
   *         abandoning the SAR prematurely.
   *
   * @see `sarUnicastRetransmissionsCount`
   */
  public get sarUnicastRetransmissionsWithoutProgressCount(): UInt8 {
    return this.$sarUnicastRetransmissionsWithoutProgressCount;
  }
  public set sarUnicastRetransmissionsWithoutProgressCount(newValue: UInt8) {
    this.$sarUnicastRetransmissionsWithoutProgressCount = Math.min(newValue, 0b1111); // Valid range: 0-15
  }

  private $sarMulticastRetransmissionsCount: UInt8 = 0b0010; // 3
  /**
   * The **SAR Multicast Retransmissions Count state** is a 4-bit value that
   * controls the maximum number of transmissions of segments of segmented
   * messages to a group address or a virtual address.
   *
   * The maximum number of transmissions of a segment is calculated with the
   * following formula:
   * ```
   * SAR Multicast Retransmissions Count + 1
   * ```
   * For example, `0b0000` represents a single transmission, and `0b0111`
   * represents 8 transmissions.
   *
   * The default value of the **SAR Multicast Retransmissions Count state** is
   * `0b0010` (3 transmissions).
   */
  public get sarMulticastRetransmissionsCount(): UInt8 {
    return this.$sarMulticastRetransmissionsCount;
  }
  public set sarMulticastRetransmissionsCount(value: UInt8) {
    this.$sarMulticastRetransmissionsCount = Math.min(value, 0b1111); // Valid range: 0-15
  }

  private $sarAcknowledgmentDelayIncrement: UInt8 = 0b001; // n+1.5 = 2.5

  /**
   * The **SAR Acknowledgment Delay Increment state** is a 3-bit value that controls
   * the interval between the reception of a new segment of a segmented message
   * for a destination that is a Unicast Address and the transmission of the
   * Segment Acknowledgment for that message.
   *
   * The default value of the **SAR Acknowledgment Delay Increment state** is `0b001`
   * (2.5 segment transmission interval steps).
   *
   * @see`sarReceiverSegmentIntervalStep`
   */
  public get sarAcknowledgmentDelayIncrement() {
    return this.$sarAcknowledgmentDelayIncrement;
  }
  public set sarAcknowledgmentDelayIncrement(newValue: UInt8) {
    this.$sarAcknowledgmentDelayIncrement = Math.min(newValue, 0b111); // Valid range: 0-7
  }

  /**
   * A value indicated by the **SAR Acknowledgment Delay Increment state**.
   *
   * @see `sarAcknowledgmentDelayIncrement`
   * @see `setAcknowledgmentTimerInterval()`
   */
  private get acknowledgmentDelayIncrement(): Double {
    return this.$sarAcknowledgmentDelayIncrement + 1.5;
  }

  private $sarReceiverSegmentIntervalStep: UInt8 = 0b0101; // (n+1)*10 ms = 60 ms
  /**
   * The **SAR Receiver Segment Interval Step state** is a 4-bit value that indicates
   * the interval between received segments of a segmented message.
   * This is used to control rate of transmission of Segment Acknowledgment messages.
   *
   * The default value of the **SAR Receiver Segment Interval Step state** is `0b0101`
   * (60 milliseconds).
   *
   * @see`sarAcknowledgmentDelayIncrement`
   */
  public get sarReceiverSegmentIntervalStep() {
    return this.$sarReceiverSegmentIntervalStep;
  }
  public set sarReceiverSegmentIntervalStep(newValue: UInt8) {
    this.$sarReceiverSegmentIntervalStep = Math.min(newValue, 0b1111); // Valid range: 0-15
  }

  /**
   * A value indicated by the **SAR Receiver Segment Interval Step state**.
   *
   * @see `sarReceiverSegmentIntervalStep`
   * @see `setAcknowledgmentTimerInterval()`
   */
  public get segmentReceptionInterval(): TimeInterval {
    return (this.$sarReceiverSegmentIntervalStep + 1) * 0.01;
  }

  private $sarAcknowledgmentRetransmissionsCount: UInt8 = 0b00; // 0
  /**
   * The **SAR Acknowledgment Retransmissions Count** state is a 2-bit value
   * that controls the number of retransmissions of Segment Acknowledgment messages
   * sent by the lower transport layer.
   *
   * Retransmission of Segment Acknowledgment messages is only enabled for messages
   * composed of more segments then the value of `sarSegmentsThreshold`.
   *
   * The maximum number of transmissions of a Segment Acknowledgment message is
   * ```
   * SAR Acknowledgment Retransmissions Count + 1
   * ```
   * For example, `0b00` represents a limit of 1 transmission, and `0b11` represents a limit of 4 transmissions.
   *
   * The default value of the **SAR Acknowledgment Retransmissions Count state** is `0b00`
   * (1 transmission, retransmissions disabled).
   *
   * NOTE: Retransmission of Segment Acknowledgment messages is controlled by `sarSegmentsThreshold`.
   *
   * @see `sarSegmentsThreshold`
   */
  public get sarAcknowledgmentRetransmissionsCount(): UInt8 {
    return this.$sarAcknowledgmentRetransmissionsCount;
  }
  public set sarAcknowledgmentRetransmissionsCount(newValue: UInt8) {
    this.$sarAcknowledgmentRetransmissionsCount = Math.min(newValue, 0b11); // Valid range: 0-3
  }

  private $sarSegmentsThreshold: UInt8 = 0b00011; // 3
  /**
   * The **SAR Segments Threshold state** is a 5-bit value that represents
   * the size of a segmented message in number of segments above which the
   * retransmissions of Segment Acknowledgment messages are enabled.
   *
   * Example: When a message is composed of 4 segments retransmissions of
   * Segment Acknowledgment messages is enabled if the **SAR Segments
   * Threshold state** is set to 3 or less.
   *
   * NOTE: Retransmissions of Segment Acknowledgment messages is always
   *         disabled for single-segment segmented messages as they are complete
   *         after receiving just one segment. The value of 0 and 1 are then
   *         equivalent, as the shortest message for which Ack retransmissions
   *         are enabled is 2 segments.
   *
   * The default value for the **SAR Segments Threshold state** is `0b00011` (3 segments).
   *
   * @see `sarAcknowledgmentRetransmissionsCount`
   */
  public get sarSegmentsThreshold(): UInt8 {
    return this.$sarSegmentsThreshold;
  }
  public set sarSegmentsThreshold(newValue: UInt8) {
    this.$sarSegmentsThreshold = Math.min(newValue, 0b11111); // Valid range: 0-31
  }

  /**
   * The initial value of the timer ensuring that no more than one Segment Acknowledgment message
   * is sent for the same SeqAuth value in a period of:
   * ```
   * acknowledgment delay increment * segment reception interval (ms)
   * ```
   */
  public get completeAcknowledgmentTimerInterval(): TimeInterval {
    return this.acknowledgmentDelayIncrement * this.segmentReceptionInterval;
  }

  private $sarDiscardTimeout: UInt8 = 0b0001; // (n+1)*5 sec = 10 seconds
  /**
   * The **SAR Discard Timeout state** is a 4-bit value that controls the time that the
   * Lower Transport layer waits after receiving unique segments of a segmented
   * message before discarding that segmented message.
   *
   * The default value of the **SAR Discard Timeout state** is `0b0001` (10 seconds).
   *
   * The Discard Timeout initial value is set using the following formula:
   * ```
   * (SAR Discard Timeout + 1) * 5 ms
   * ```
   */
  public get sarDiscardTimeout(): UInt8 {
    return this.$sarDiscardTimeout;
  }
  public set sarDiscardTimeout(newValue: UInt8) {
    this.$sarDiscardTimeout = Math.min(newValue, 0b1111); // Valid range: 0-15
  }

  /**
   * The Discard Timeout is the time that the Lower Transport layer waits
   * after receiving a new segment of a segmented message before
   * discarding that segmented message.
   *
   * Valid range for this timeout is from 5 seconds to 1 minute and 20 seconds
   * (80 seconds) with 5 second step. The default value is 10 seconds.
   *
   * The Discard Timeout is reset every time a new segment of a message
   * is received.
   *
   * The value of this timeout is controlled by `sarDiscardTimeout`
   * state and is calculated the following way:
   * ```
   * (SAR Discard Timeout + 1) * 5 ms
   * ```
   */
  public get discardTimeout(): TimeInterval {
    return (this.$sarDiscardTimeout + 1) * 5.0;
  }

  public acknowledgmentMessageIntervalForTtl(ttl: UInt8, segmentCount: Int64): TimeInterval {
    return segmentCount
      .multiply(0.05)
      .add(ttl * 0.05)
      .add(this.$acknowledgmentMessageInterval)
      .toNumber();
  }
  /**
   * The initial value of the SAR Unicast Retransmissions timer.
   *
   * @param ttl The TTL value with the message is being sent.
   * @returns The initial value of the SAR Unicast Retransmissions timer.
   */
  public unicastRetransmissionsInterval(ttl: UInt8): TimeInterval {
    // If the value of the TTL field of the message is 0, the initial value
    // of the timer shall be set to the unicast retransmissions interval step.
    if (ttl === 0) {
      return this.unicastRetransmissionsIntervalStep;
    }
    return (
      this.unicastRetransmissionsIntervalStep +
      this.unicastRetransmissionsIntervalIncrement * (ttl - 1)
    );
  }

  /**
   * The initial value of the SAR Acknowledgment timer for a given `segN`.
   *
   * The value depends on the number of segments in a segmented message.
   *
   * The initial value of the SAR Acknowledgment timer is calculated using the following
   * formula:
   * ```
   * min(SegN + 0.5 , acknowledgment delay increment) * segment reception interval (ms)
   * ```
   * where
   * ```
   * acknowledgment delay increment = SAR Acknowledgment Delay Increment + 1.5
   *
   * segment reception interval = (SAR Receiver Segment Interval Step + 1) × 10 ms
   * ```
   */
  public acknowledgmentTimerInterval(segN: UInt8): TimeInterval {
    return Math.min(segN + 0.5, this.acknowledgmentDelayIncrement) * this.segmentReceptionInterval;
  }
}
