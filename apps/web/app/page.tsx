"use client";

import { ControlFlow } from "@/app/components/control-flow";
import { SetupModal } from "@/app/components/setup-modal";
import { Surface } from "@heroui/react";
import { ApplicationSettings } from "./components/application-settings";

export default function Home() {
  return (
    <Surface variant="secondary" className="min-h-screen p-4 sm:p-6">
      <SetupModal />
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
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
