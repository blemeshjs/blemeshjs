const layers = [
  {
    title: "Application",
    description: "Your JavaScript or TypeScript application calls mesh operations and subscribes to SDK events.",
  },
  {
    title: "Platform SDK",
    description: "Runtime adapters expose transport wiring, provisioning helpers, and convenience APIs on top of the shared packages.",
  },
  {
    title: "Core",
    description: "The shared core owns mesh models, messages, provisioning state, and network orchestration.",
  },
  {
    title: "Transport + Storage",
    description: "Bearers move PDUs over BLE, while Storage persists the mesh configuration database across runtimes.",
  },
]

export function ArchitectureDiagram() {
  return (
    <div className="docs-surface mt-6 rounded-[1.25rem] p-4 shadow-sm md:p-5">
      <div className="grid gap-3 lg:grid-cols-4">
        {layers.map((layer, index) => (
          <div key={layer.title} className="docs-surface-soft relative rounded-[1rem] p-4">
            <div className="docs-accent-badge mb-2 inline-flex rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
              {String(index + 1).padStart(2, "0")}
            </div>
            <h3 className="text-base font-semibold text-foreground">{layer.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{layer.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="docs-surface-soft rounded-[1rem] p-4">
          <p className="font-medium text-foreground">Messages</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Generic OnOff, Config, and Provisioning messages flow through the core and out through the active bearer.
          </p>
        </div>
        <div className="docs-surface-soft rounded-[1rem] p-4">
          <p className="font-medium text-foreground">Events</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Managers emit scan, proxy, provision, send, and receive events so app code can react without handling BLE details directly.
          </p>
        </div>
        <div className="docs-surface-soft rounded-[1rem] p-4">
          <p className="font-medium text-foreground">Persistence</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The mesh CDB is serialized by the core and persisted by a platform-specific Storage implementation.
          </p>
        </div>
      </div>
    </div>
  )
}