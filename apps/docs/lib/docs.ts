type DocDefinition = {
  slug: string[]
  href: string
  title: string
  description: string
  section: string
  keywords?: string[]
  headings?: Array<{
    title: string
    level: 2 | 3
  }>
  loader: () => Promise<{ default: React.ComponentType }>
}

export const docs: DocDefinition[] = [
  {
    slug: [],
    href: "/docs",
    title: "Mesh Link JS",
    description: "Build Bluetooth Mesh apps across React Native, Node.js, and Web with a fast path from scan to light control.",
    section: "Introduction",
    keywords: ["Mesh Link JS", "bluetooth mesh", "react native", "node", "web", "quick start", "sdk"],
    headings: [
      { title: "Turn on a light fast", level: 2 },
      { title: "Why teams pick Mesh Link JS", level: 2 },
      { title: "Install", level: 2 },
      { title: "Minimal example", level: 2 },
      { title: "Go next", level: 2 },
    ],
    loader: () => import("@/docs/index.mdx"),
  },
  {
    slug: ["quick-start"],
    href: "/docs/quick-start",
    title: "Quick Start",
    description: "Scan, connect, provision, and turn on a light in the shortest practical path.",
    section: "Introduction",
    keywords: ["quick start", "scan", "connect", "provision", "light", "createMesh"],
    headings: [
      { title: "Install", level: 2 },
      { title: "Create a mesh client", level: 2 },
      { title: "Scan for devices", level: 2 },
      { title: "Connect and provision", level: 2 },
      { title: "Turn the light on", level: 2 },
      { title: "Expected output", level: 2 },
    ],
    loader: () => import("@/docs/quick-start.mdx"),
  },
  {
    slug: ["concepts"],
    href: "/docs/concepts",
    title: "Core Concepts",
    description: "Learn the Bluetooth Mesh building blocks you need before you automate or debug anything.",
    section: "Introduction",
    keywords: ["node", "element", "model", "provisioning", "publish", "subscribe"],
    headings: [
      { title: "The mental model", level: 2 },
      { title: "Node", level: 2 },
      { title: "Element", level: 2 },
      { title: "Model", level: 2 },
      { title: "Provisioning", level: 2 },
      { title: "Publish and subscribe", level: 2 },
    ],
    loader: () => import("@/docs/concepts.mdx"),
  },
  {
    slug: ["guides", "react-native"],
    href: "/docs/guides/react-native",
    title: "React Native Setup",
    description: "Prepare iOS and Android for BLE Mesh scanning, connections, and provisioning.",
    section: "Setup",
    keywords: ["react native", "setup", "permissions", "ble", "ios", "android"],
    headings: [
      { title: "Install", level: 2 },
      { title: "Permissions", level: 2 },
      { title: "BLE setup", level: 2 },
      { title: "Create the client", level: 2 },
    ],
    loader: () => import("@/docs/guides/react-native.mdx"),
  },
  {
    slug: ["guides", "node"],
    href: "/docs/guides/node",
    title: "Node.js Setup",
    description: "Run a gateway, service, or automation worker that talks to a mesh network from Node.js.",
    section: "Setup",
    keywords: ["node", "gateway", "usb dongle", "service", "automation"],
    headings: [
      { title: "Install", level: 2 },
      { title: "Connect a dongle", level: 2 },
      { title: "Gateway runtime", level: 2 },
      { title: "Create the client", level: 2 },
    ],
    loader: () => import("@/docs/guides/node.mdx"),
  },
  {
    slug: ["guides", "web"],
    href: "/docs/guides/web",
    title: "Web Setup",
    description: "Use Web Bluetooth intentionally, with the right expectations about browser support and background limitations.",
    section: "Setup",
    keywords: ["web", "web bluetooth", "browser", "permissions", "limitations"],
    headings: [
      { title: "Install", level: 2 },
      { title: "Browser support", level: 2 },
      { title: "User gesture requirements", level: 2 },
      { title: "Create the client", level: 2 },
    ],
    loader: () => import("@/docs/guides/web.mdx"),
  },
  {
    slug: ["guides"],
    href: "/docs/guides",
    title: "Guides",
    description: "Practical recipes for provisioning, lighting, groups, scenes, and event-driven updates.",
    section: "Guides",
    keywords: ["guides", "recipes", "lighting", "groups", "scenes", "events"],
    headings: [
      { title: "Recipes", level: 2 },
      { title: "Pick the next workflow", level: 2 },
    ],
    loader: () => import("@/docs/guides/index.mdx"),
  },
  {
    slug: ["guides", "light-on-off"],
    href: "/docs/guides/light-on-off",
    title: "Turn a Light On Or Off",
    description: "The shortest useful lighting control flow with a connected, provisioned device.",
    section: "Guides",
    keywords: ["light", "on", "off", "GenericOnOff", "device.light.on"],
    headings: [
      { title: "1. Create a mesh client", level: 2 },
      { title: "2. Find the target device", level: 2 },
      { title: "3. Turn it on", level: 2 },
      { title: "4. Turn it off", level: 2 },
      { title: "Expected behavior", level: 2 },
    ],
    loader: () => import("@/docs/guides/light-on-off.mdx"),
  },
  {
    slug: ["guides", "provisioning"],
    href: "/docs/guides/provisioning",
    title: "Provision a New Device",
    description: "Bring an unprovisioned node into the network with a repeatable step-by-step flow.",
    section: "Guides",
    keywords: ["provision", "new device", "attention", "identify"],
    headings: [
      { title: "1. Create a mesh client", level: 2 },
      { title: "2. Scan for unprovisioned devices", level: 2 },
      { title: "3. Connect and identify", level: 2 },
      { title: "4. Provision", level: 2 },
      { title: "Expected behavior", level: 2 },
    ],
    loader: () => import("@/docs/guides/provisioning.mdx"),
  },
  {
    slug: ["guides", "groups"],
    href: "/docs/guides/groups",
    title: "Control Multiple Devices",
    description: "Use groups to address many nodes with one publish and keep room-level control simple.",
    section: "Guides",
    keywords: ["groups", "multiple devices", "publish", "room"],
    headings: [
      { title: "1. Create a group", level: 2 },
      { title: "2. Add devices", level: 2 },
      { title: "3. Publish a command", level: 2 },
      { title: "Expected behavior", level: 2 },
    ],
    loader: () => import("@/docs/guides/groups.mdx"),
  },
  {
    slug: ["guides", "scenes"],
    href: "/docs/guides/scenes",
    title: "Create a Scene",
    description: "Capture a known multi-device state and recall it later with one command.",
    section: "Guides",
    keywords: ["scene", "recall", "lighting preset"],
    headings: [
      { title: "1. Choose devices", level: 2 },
      { title: "2. Capture the scene", level: 2 },
      { title: "3. Recall the scene", level: 2 },
      { title: "Expected behavior", level: 2 },
    ],
    loader: () => import("@/docs/guides/scenes.mdx"),
  },
  {
    slug: ["guides", "retry-provisioning"],
    href: "/docs/guides/retry-provisioning",
    title: "Retry Failed Provisioning",
    description: "Recover from timeouts, reconnect cleanly, and avoid leaving devices in an unknown state.",
    section: "Guides",
    keywords: ["retry", "failed provisioning", "timeout", "recovery"],
    headings: [
      { title: "1. Detect the failure", level: 2 },
      { title: "2. Reset local state", level: 2 },
      { title: "3. Retry with backoff", level: 2 },
      { title: "Expected behavior", level: 2 },
    ],
    loader: () => import("@/docs/guides/retry-provisioning.mdx"),
  },
  {
    slug: ["guides", "state-updates"],
    href: "/docs/guides/state-updates",
    title: "Listen to State Updates",
    description: "Subscribe to model state changes and keep your UI or service layer synchronized.",
    section: "Guides",
    keywords: ["events", "state updates", "subscribe", "telemetry"],
    headings: [
      { title: "1. Connect to a device", level: 2 },
      { title: "2. Subscribe to updates", level: 2 },
      { title: "3. Handle state changes", level: 2 },
      { title: "Expected behavior", level: 2 },
    ],
    loader: () => import("@/docs/guides/state-updates.mdx"),
  },
  {
    slug: ["api"],
    href: "/docs/api",
    title: "API Reference",
    description: "Start from the high-level objects you use every day: mesh, device, and models.",
    section: "Reference",
    keywords: ["api", "reference", "mesh", "device", "models"],
    headings: [
      { title: "Reference map", level: 2 },
      { title: "Object model", level: 2 },
      { title: "Example flow", level: 2 },
    ],
    loader: () => import("@/docs/api/index.mdx"),
  },
  {
    slug: ["api", "mesh"],
    href: "/docs/api/mesh",
    title: "Mesh API",
    description: "Create a client, scan, discover, and connect to mesh devices.",
    section: "Reference",
    keywords: ["mesh api", "createMesh", "scan", "connect"],
    headings: [
      { title: "createMesh", level: 2 },
      { title: "mesh.scan", level: 2 },
      { title: "mesh.connect", level: 2 },
    ],
    loader: () => import("@/docs/api/mesh.mdx"),
  },
  {
    slug: ["api", "device"],
    href: "/docs/api/device",
    title: "Device API",
    description: "Provision, disconnect, and work with device-level helpers after connecting.",
    section: "Reference",
    keywords: ["device api", "provision", "disconnect", "device.light"],
    headings: [
      { title: "device.provision", level: 2 },
      { title: "device.disconnect", level: 2 },
      { title: "device.light", level: 2 },
    ],
    loader: () => import("@/docs/api/device.mdx"),
  },
  {
    slug: ["api", "models"],
    href: "/docs/api/models",
    title: "Models API",
    description: "Attach typed behaviors to a model and work with common SIG models.",
    section: "Reference",
    keywords: ["models api", "GenericOnOff", "LightLightness", "model.use"],
    headings: [
      { title: "model.use", level: 2 },
      { title: "GenericOnOff", level: 2 },
      { title: "LightLightness", level: 2 },
    ],
    loader: () => import("@/docs/api/models.mdx"),
  },
  {
    slug: ["simulator"],
    href: "/docs/simulator",
    title: "Simulator",
    description: "Develop and demo mesh workflows without physical hardware.",
    section: "Tools",
    keywords: ["simulator", "createSimulatorMesh", "testing", "demo"],
    headings: [
      { title: "Why use the simulator", level: 2 },
      { title: "Create a simulator mesh", level: 2 },
      { title: "Example workflow", level: 2 },
    ],
    loader: () => import("@/docs/simulator.mdx"),
  },
  {
    slug: ["gateway-cloud"],
    href: "/docs/gateway-cloud",
    title: "Gateway And Cloud",
    description: "Run Node.js as a gateway and bridge local mesh events to cloud systems.",
    section: "Tools",
    keywords: ["gateway", "cloud", "mqtt", "websocket", "node"],
    headings: [
      { title: "Node.js gateway setup", level: 2 },
      { title: "Forwarding events to the cloud", level: 2 },
      { title: "WebSocket and MQTT patterns", level: 2 },
    ],
    loader: () => import("@/docs/gateway-cloud.mdx"),
  },
  {
    slug: ["examples"],
    href: "/docs/examples",
    title: "Examples",
    description: "Reference app patterns for React Native, Web dashboards, and Node gateways.",
    section: "Tools",
    keywords: ["examples", "react native", "dashboard", "gateway"],
    headings: [
      { title: "React Native app", level: 2 },
      { title: "Web dashboard", level: 2 },
      { title: "Node gateway", level: 2 },
    ],
    loader: () => import("@/docs/examples.mdx"),
  },
  {
    slug: ["architecture"],
    href: "/docs/architecture",
    title: "Architecture",
    description: "Understand how transport, storage, models, and runtime adapters fit together.",
    section: "Advanced",
    keywords: ["architecture", "transport", "storage", "vendor models", "logging"],
    headings: [
      { title: "Layered architecture", level: 2 },
      { title: "Extending models", level: 2 },
      { title: "Vendor models", level: 2 },
      { title: "Logging and debugging", level: 2 },
    ],
    loader: () => import("@/docs/architecture.mdx"),
  },
  {
    slug: ["advanced", "transport-storage"],
    href: "/docs/advanced/transport-storage",
    title: "Transport And Storage",
    description: "Dig into bearer abstraction, persistence, and state portability across runtimes.",
    section: "Advanced",
    keywords: ["transport", "storage", "bearer", "keys", "state"],
    headings: [
      { title: "Transport abstraction", level: 2 },
      { title: "Storage design", level: 2 },
      { title: "Operational implications", level: 2 },
    ],
    loader: () => import("@/docs/advanced/transport-storage.mdx"),
  },
  {
    slug: ["troubleshooting"],
    href: "/docs/troubleshooting",
    title: "Troubleshooting",
    description: "Fix the most common BLE Mesh connection, provisioning, and platform issues quickly.",
    section: "Support",
    keywords: ["troubleshooting", "connection", "provisioning", "ios", "android", "web"],
    headings: [
      { title: "Device not showing up", level: 2 },
      { title: "Device not connecting", level: 2 },
      { title: "Provisioning failure", level: 2 },
      { title: "Platform-specific issues", level: 2 },
    ],
    loader: () => import("@/docs/troubleshooting.mdx"),
  },
  {
    slug: ["glossary"],
    href: "/docs/glossary",
    title: "Glossary",
    description: "Plain-language definitions for the Bluetooth Mesh terms you see throughout the docs.",
    section: "Support",
    keywords: ["glossary", "terms", "bluetooth mesh", "definitions"],
    headings: [
      { title: "A", level: 2 },
      { title: "E", level: 2 },
      { title: "M", level: 2 },
      { title: "P", level: 2 },
      { title: "S", level: 2 },
    ],
    loader: () => import("@/docs/glossary.mdx"),
  },
]

export function getDoc(slug: string[] = []) {
  const key = slug.join("/")
  return docs.find((doc) => doc.slug.join("/") === key)
}

export function getDocNeighbors(href: string) {
  const index = docs.findIndex((doc) => doc.href === href)
  return {
    previous: index > 0 ? docs[index - 1] : undefined,
    next: index >= 0 && index < docs.length - 1 ? docs[index + 1] : undefined,
  }
}

export function getSections() {
  return docs.reduce<Record<string, DocDefinition[]>>((acc, doc) => {
    acc[doc.section] ??= []
    acc[doc.section].push(doc)
    return acc
  }, {})
}

export function getStaticDocParams() {
  return docs.filter((doc) => doc.slug.length > 0).map((doc) => ({ slug: doc.slug }))
}

export function getSearchableDocs() {
  return docs.map((doc) => ({
    href: doc.href,
    title: doc.title,
    description: doc.description,
    section: doc.section,
    keywords: doc.keywords ?? [],
    headings: doc.headings ?? [],
  }))
}