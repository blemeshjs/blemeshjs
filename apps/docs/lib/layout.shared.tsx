import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { BLEMeshJSLogo } from "@/components/blemeshjs-logo";
import { gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: <BLEMeshJSLogo />,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
