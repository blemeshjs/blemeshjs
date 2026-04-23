import { toastError } from "@/app/helpers/error";
import { useControlStore } from "@/app/hooks/useControl";
import { Button, ButtonGroup, Label, Slider, Surface, Switch } from "@heroui/react";
import { GenericOnOff } from "@mesh-link-js/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";

export const GenericOnOffController = observer(() => {
  const { selectedModel } = useControlStore();
  const [defaultTransition, setDefaultTransition] = useState(true);
  const [delay, setDelay] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const light = useMemo(() => selectedModel?.use(GenericOnOff), [selectedModel]);
  const [transitionTime, setTransitionTime] = useState(light?.toTransitionTime(0));
  const lightMutation = useMutation({
    mutationFn: (args: { type: "set"; value: boolean } | { type: "get" }): Promise<unknown> => {
      if (typeof light === "undefined") throw new Error("Light model not available");
      switch (args.type) {
        case "set":
          return light.set(args.value, {
            acknowledged,
            transitionTime: defaultTransition
              ? { type: "default" }
              : {
                  type: "custom",
                  delay,
                  stepResolution: transitionTime!.stepResolution,
                  steps: transitionTime!.steps,
                },
          });
        case "get":
          return light.get();
        default:
          throw new Error("Invalid mutation type");
      }
    },

    onError: (error) => {
      console.error(error);
      toastError(error);
    },
  });

  if (!selectedModel) return null;

  return (
    <Surface variant="tertiary" className="flex flex-col gap-2 p-6 rounded-lg">
      <Switch isSelected={defaultTransition} onChange={setDefaultTransition}>
        <Switch.Content className="flex-1">
          <Label className="text-sm">Default Transition Time and Delay</Label>
        </Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch>
      <Slider
        isDisabled={defaultTransition}
        className="w-full"
        minValue={0}
        maxValue={235}
        onChange={(value) => setTransitionTime(light?.toTransitionTime((value as number[])[0]))}
      >
        <Label>Transition Time</Label>
        <Slider.Output>{transitionTime?.text}</Slider.Output>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>
      <Slider
        onChange={(value) => setDelay((value as number[])[0])}
        isDisabled={defaultTransition}
        className="w-full"
        minValue={0}
        maxValue={255}
      >
        <Label>Delay</Label>
        <Slider.Output>
          {({ state }) => state.values.map((value) => `Delay ${value * 5} ms`).join("")}
        </Slider.Output>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb />
        </Slider.Track>
      </Slider>

      <Switch isSelected={acknowledged} onChange={setAcknowledged}>
        <Switch.Content className="flex-1">
          <Label className="text-sm">Acknowledged</Label>
        </Switch.Content>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch>
      <Switch />
      <div className="flex items-center gap-1">
        <Label className="text-sm flex-1">Current State: </Label>
        <span className="text-sm text-muted">
          {light?.state === undefined ? "Unknown" : light.state ? "ON" : "OFF"}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Label className="text-sm flex-1">Target State: </Label>
        <span className="text-muted text-sm">
          {light?.targetState === undefined
            ? "N/A"
            : `${light.targetState ? "ON" : "OFF"} in ${light.remainingTime?.interval} sec`}
        </span>
      </div>
      <ButtonGroup>
        <Button onPress={() => lightMutation.mutate({ type: "set", value: true })}>ON</Button>
        <Button variant="secondary" onPress={() => lightMutation.mutate({ type: "get" })}>
          READ
        </Button>
        <Button
          variant="danger-soft"
          onPress={() => lightMutation.mutate({ type: "set", value: false })}
        >
          OFF
        </Button>
      </ButtonGroup>
    </Surface>
  );
});
