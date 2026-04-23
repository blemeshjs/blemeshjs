import type { ComponentPropsWithoutRef } from "react"
import type { LucideIcon } from "lucide-react"
import {
  BookOpenText,
  Cable,
  Cpu,
  Flag,
  LifeBuoy,
  House,
  Layers3,
  RadioTower,
  Rocket,
  Route,
  Settings2,
  Smartphone,
  ToyBrick,
  Waypoints,
  Wrench,
} from "lucide-react"

const hrefIconMap: Record<string, LucideIcon> = {
  "/docs": House,
  "/docs/quick-start": Rocket,
  "/docs/concepts": Layers3,
  "/docs/guides": Route,
  "/docs/guides/react-native": Smartphone,
  "/docs/guides/web": RadioTower,
  "/docs/guides/node": Cpu,
  "/docs/guides/light-on-off": Settings2,
  "/docs/guides/provisioning": Flag,
  "/docs/guides/groups": Route,
  "/docs/guides/scenes": Waypoints,
  "/docs/guides/retry-provisioning": Wrench,
  "/docs/guides/state-updates": RadioTower,
  "/docs/api": BookOpenText,
  "/docs/api/mesh": BookOpenText,
  "/docs/api/device": Settings2,
  "/docs/api/models": Layers3,
  "/docs/simulator": ToyBrick,
  "/docs/gateway-cloud": Cpu,
  "/docs/examples": Waypoints,
  "/docs/advanced/transport-storage": Cable,
  "/docs/architecture": Layers3,
  "/docs/troubleshooting": LifeBuoy,
  "/docs/glossary": BookOpenText,
}

const sectionIconMap: Record<string, LucideIcon> = {
  Introduction: House,
  Setup: Layers3,
  Guides: Route,
  Reference: BookOpenText,
  Tools: ToyBrick,
  Advanced: Wrench,
  Support: LifeBuoy,
}

export function getDocIcon(href: string) {
  return hrefIconMap[href] ?? Waypoints
}

export function getSectionIcon(section: string) {
  return sectionIconMap[section] ?? Waypoints
}

export function DocIcon({ href, ...props }: { href: string } & ComponentPropsWithoutRef<"svg">) {
  const Icon = getDocIcon(href)

  return <Icon {...props} />
}

export function SectionIcon({ section, ...props }: { section: string } & ComponentPropsWithoutRef<"svg">) {
  const Icon = getSectionIcon(section)

  return <Icon {...props} />
}