import { NetworkParameters } from "./network-parameters.js";

/**
 * The network parameters provider.
 */
export interface NetworkParametersProvider {
  /**
   * Network parameters.
   */
  readonly networkParameters: NetworkParameters;
}
