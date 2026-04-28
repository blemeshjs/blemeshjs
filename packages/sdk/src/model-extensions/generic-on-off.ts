import { GenericOnOffGet, GenericOnOffSet, GenericOnOffStatus, Model } from "@blemeshjs/core";
import { sendMessageToModel } from "./helper";
import { AccessError, TransitionTime, MeshMessage, StepResolution } from "@blemeshjs/utils";
import { action, makeObservable, observable } from "mobx";
import { CoreMeshNetworkManager } from "../mesh-network/core-mesh-network-manager";

export const GenericOnOff = Object.assign(
  (model: Model, coreMeshNetworkManager: CoreMeshNetworkManager) => {
    return makeObservable(
      {
        state: undefined as boolean | undefined,
        targetState: undefined as boolean | undefined,
        remainingTime: undefined as TransitionTime | undefined,
        /**
         * Converts a delay value from the Bluetooth Mesh Model Specification into a human-readable format in milliseconds.
         *
         * @param value The delay value (0-255) as defined in the Bluetooth Mesh Model Specification.
         * returns An object containing the human-readable text and the delay in milliseconds.
         */
        toDelay(value: number) {
          return {
            text: `Delay ${value * 5} ms`,
            delay: value,
          };
        },
        /**
         * Converts a transition time value from the Bluetooth Mesh Model Specification into a human-readable format with steps and step resolution.
         *
         * @param value The transition time value (0-235) as defined in the Bluetooth Mesh Model Specification.
         * returns An object containing the human-readable text, the number of steps, and the step resolution.
         */
        toTransitionTime(value: number) {
          switch (true) {
            case value < 1.0:
              return {
                text: "Immediate",
                steps: 0,
                stepResolution: StepResolution.hundredsOfMilliseconds,
              };
            case value >= 1 && value < 10:
              return {
                text: `${value * 100} ms`,
                steps: value,
                stepResolution: StepResolution.hundredsOfMilliseconds,
              };
            case value >= 10 && value < 63:
              return {
                text: `${(value / 10).toFixed(1)} sec`,
                steps: value,
                stepResolution: StepResolution.hundredsOfMilliseconds,
              };
            case value >= 63 && value < 116:
              return {
                text: `${value - 56} sec`,
                steps: value - 56,
                stepResolution: StepResolution.seconds,
              };
            case value >= 116 && value < 119:
              return {
                text: `${Math.round((value + 4) / 60) - 1} min 0${(value + 4) % 60} sec`,
                steps: value - 56,
                stepResolution: StepResolution.seconds,
              };
            case value >= 119 && value < 175:
              const sec = ((value + 2) % 6) * 10;
              const secString = sec == 0 ? "00" : `${sec}`;
              return {
                text: `${Math.round((value + 2) / 6) - 19} min ${secString} sec`,
                steps: value - 112,
                stepResolution: StepResolution.tensOfSeconds,
              };
            case value >= 175 && value < 179:
              return {
                text: `${(value - 173) * 10} min`,
                steps: value - 173,
                stepResolution: StepResolution.tensOfMinutes,
              };
            case value >= 179:
              const min = ((value - 173) % 6) * 10;
              const minString = min == 0 ? "00" : `${min}`;
              return {
                text: `${Math.round((value + 1) / 6) - 29} h ${minString} min`,
                steps: value - 173,
                stepResolution: StepResolution.tensOfMinutes,
              };
            default:
              break;
          }
        },
        async get() {
          if (!model.boundApplicationKeys.length) throw AccessError.modelNotBoundToAppKey;
          const message = new GenericOnOffGet();
          const status = await sendMessageToModel<GenericOnOffStatus>(
            model,
            coreMeshNetworkManager,
            message,
          );
          this.state = status.isOn;
          this.targetState = status.targetState;
          this.remainingTime = status.remainingTime;
        },
        async set(
          turnOn: boolean,
          options?: {
            acknowledged?: boolean;
            transitionTime?:
              | { type: "default" }
              | {
                  type: "custom";
                  steps: number;
                  stepResolution: StepResolution;
                  delay?: number;
                };
          },
        ) {
          if (!model.boundApplicationKeys.length) throw AccessError.modelNotBoundToAppKey;

          let message: MeshMessage;
          if (options?.acknowledged) {
            if (!options.transitionTime || options.transitionTime?.type === "default") {
              message = new GenericOnOffSet(turnOn);
            } else {
              const transitionTime = new TransitionTime(
                options.transitionTime.steps,
                options.transitionTime.stepResolution,
              );
              message = new GenericOnOffSet(turnOn, transitionTime, options.transitionTime.delay);
            }
          } else {
            if (!options?.transitionTime || options?.transitionTime?.type === "default") {
              message = new GenericOnOffSet(turnOn);
            } else {
              const transitionTime = new TransitionTime(
                options.transitionTime.steps,
                options.transitionTime.stepResolution,
              );
              message = new GenericOnOffSet(turnOn, transitionTime, options.transitionTime.delay);
            }
          }
          const status = await sendMessageToModel<GenericOnOffStatus>(
            model,
            coreMeshNetworkManager,
            message,
          );
          this.state = status.isOn;
          this.targetState = status.targetState;
          this.remainingTime = status.remainingTime;
        },
      },
      {
        state: observable,
        targetState: observable,
        remainingTime: observable,
        set: action,
        get: action,
      },
    );
  },
  { key: "genericOnOff" },
);
