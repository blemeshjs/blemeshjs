import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { BadgeInfo, Lightbulb, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"

type CalloutProps = {
  as?: "div" | "blockquote"
  children: ReactNode
  tone?: "default" | "info" | "warn"
  className?: string
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className"> &
  Omit<ComponentPropsWithoutRef<"blockquote">, "children" | "className">

export function Callout({
  as: Tag = "div",
  children,
  tone = "default",
  className,
  ...props
}: CalloutProps) {
  const toneConfig = {
    default: {
      icon: Lightbulb,
      label: "Note",
      containerClassName:
        "border-border/70 bg-card/70 text-foreground dark:border-white/10 dark:bg-white/[0.045]",
      iconClassName:
        "border-border/70 bg-background/80 text-muted-foreground dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200",
    },
    info: {
      icon: BadgeInfo,
      label: "Info",
      containerClassName:
        "border-primary/22 bg-primary/8 text-foreground dark:border-cyan-300/18 dark:bg-cyan-400/10",
      iconClassName:
        "border-primary/20 bg-primary/10 text-primary dark:border-cyan-300/18 dark:bg-cyan-400/12 dark:text-cyan-100",
    },
    warn: {
      icon: TriangleAlert,
      label: "Heads up",
      containerClassName: "border-amber-500/30 bg-amber-500/10 text-foreground",
      iconClassName: "border-amber-500/25 bg-amber-500/12 text-amber-600 dark:text-amber-300",
    },
  }[tone]
  const Icon = toneConfig.icon

  return (
    <Tag
      className={cn(
        "mt-4 rounded-[1rem] border px-3.5 py-3 text-[0.94rem] leading-6 shadow-sm",
        toneConfig.containerClassName,
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:shadow-none",
            toneConfig.iconClassName,
          )}
        >
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            {toneConfig.label}
          </p>
          <div className="mt-1.5 text-[0.94rem] leading-6 text-foreground/88 [&_code]:rounded-md [&_code]:border [&_code]:border-slate-200 [&_code]:bg-slate-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em] [&_code]:text-slate-800 dark:[&_code]:border-white/8 dark:[&_code]:bg-foreground/6 dark:[&_code]:text-foreground [&_p]:m-0 [&_p+p]:mt-2 [&_ul]:my-2 [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:pl-5 [&_li]:mt-1 [&_strong]:font-semibold [&_strong]:text-foreground">
            {children}
          </div>
        </div>
      </div>
    </Tag>
  )
}