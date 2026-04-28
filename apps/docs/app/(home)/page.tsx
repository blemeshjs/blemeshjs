import Link from 'next/link';
import {
  ArrowRight,
  Bluetooth,
  Cable,
  Layers3,
  MonitorSmartphone,
  RadioTower,
  Sparkles,
  Zap,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { appName, docsRoute } from '@/lib/shared';

const stats = [
  {
    label: 'Platforms',
    value: 'Multiple runtimes',
    detail: 'React Native, Node.js, and Web from one SDK model.',
    icon: Layers3,
    accent: 'from-sky-500/15 via-sky-500/5 to-transparent',
    iconClassName: 'bg-sky-500/10 text-sky-700 ring-sky-500/15',
  },
  {
    label: 'Core Flow',
    value: 'Scan to control',
    detail: 'Discovery, provisioning, and device commands without changing mental models.',
    icon: Zap,
    accent: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    iconClassName: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/15',
  },
  {
    label: 'Operational Depth',
    value: 'Groups and scenes',
    detail: 'Move from first light control into production workflows and state updates.',
    icon: RadioTower,
    accent: 'from-amber-500/15 via-amber-500/5 to-transparent',
    iconClassName: 'bg-amber-500/10 text-amber-700 ring-amber-500/15',
  },
];

const quickStartCode = `import { createMesh } from "@blemeshjs/sdk"

const mesh = await createMesh({ platform: "react-native" })
const devices = await mesh.scan({ timeout: 10_000 })
const device = await mesh.connect(devices[0].uuid)

await device.provision({ appKey: "home-app" })
await device.light.on()`;

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem] bg-gradient-to-b from-fd-primary/10 via-fd-primary/5 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-12 -z-10 mx-auto h-64 max-w-4xl rounded-full bg-fd-primary/10 blur-3xl" />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-10 sm:px-8 lg:pb-28 lg:pt-16">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)] lg:gap-10">
          <div className="space-y-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-fd-card px-4 py-2 text-xs font-medium text-fd-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
              Cross-platform Bluetooth Mesh SDK
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-fd-foreground sm:text-6xl lg:text-[4.3rem] lg:leading-none">
                Build mesh flows without drowning in transport code.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-fd-muted-foreground sm:text-lg">
                {appName} gives React Native, Node.js, and Web teams one path for discovery,
                provisioning, and control.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`${docsRoute}/playground`}
                className={cn(
                  buttonVariants({ variant: 'primary' }),
                  'gap-2 rounded-full px-6 py-3 shadow-sm',
                )}
              >
                Open Playground
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={docsRoute}
                className={cn(
                  buttonVariants({ variant: 'secondary' }),
                  'gap-2 rounded-full px-6 py-3 shadow-sm',
                )}
              >
                Browse documentation
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="relative overflow-hidden rounded-[1.5rem] border bg-fd-card p-4 text-fd-card-foreground shadow-sm"
                >
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b opacity-90',
                      item.accent,
                    )}
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-fd-muted-foreground">
                        {item.label}
                      </div>
                      <div className="mt-2 text-2xl font-semibold tracking-tight text-fd-foreground">
                        {item.value}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex h-11 w-11 items-center justify-center rounded-2xl ring-1 backdrop-blur-sm',
                        item.iconClassName,
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="relative mt-3 text-sm leading-6 text-fd-muted-foreground">{item.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
