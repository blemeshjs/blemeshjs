/**
 * The mesh message security enum determines authentication level
 * which shall be used when encrypting a segmented mesh message.
 *
 * This filed is used to determine the TransMIC.
 *
 * The Message Integrity Check for Transport (TransMIC) is a 32-bit or 64-bit
 * field that authenticates that the Access payload has not been changed.
 *
 * For a segmented message, where SEG is set to 1, the size of the TransMIC
 * is determined by the value of the SZMIC field in the Lower Transport PDU.
 * For unsegmented messages, the size of the TransMIC is 32 bits for data messages.
 *
 * Control messages do not have a TransMIC.
 */
export enum MeshMessageSecurity {
  /** Message will be sent with 32-bit Transport MIC. */
  low = 0,
  /** Message will be sent with 64-bit Transport MIC.
   *
   * Unsegmented messages cannot be sent with this option.
   */
  high = 1,
}
