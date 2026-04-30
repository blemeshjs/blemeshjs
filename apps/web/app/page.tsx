"use client";

import { ControlFlow } from "@/app/components/control-flow";
import { SetupModal } from "@/app/components/setup-modal";
import { Alert, Surface } from "@heroui/react";
import { ApplicationSettings } from "./components/application-settings";

export default function Home() {
  return (
    <Surface variant="secondary" className="min-h-screen p-4 sm:p-6">
      <SetupModal />
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>IMPORTANT</Alert.Title>
            <Alert.Description>
              This playground requires experimental web bluetooth new permissions backend{" "}
              <span className="text-warning">
                chrome://flags/#enable-web-bluetooth-new-permissions-backend
              </span>{" "}
              to be enabled to work properly.
            </Alert.Description>
          </Alert.Content>
        </Alert>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="lg:w-[320px] lg:shrink-0 xl:w-[340px]">
            <ApplicationSettings />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <ControlFlow />
          </div>
        </div>
      </div>
    </Surface>
  );
}
