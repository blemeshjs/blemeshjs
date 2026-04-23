"use client";

import { toast } from "@heroui/react";

export const toastError = (error: unknown) => {
  if (!(error instanceof Error)) error = new Error(String(error));
  toast("Error", { variant: "danger", description: (error as Error).message });
};
