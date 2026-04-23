"use client"

import { Children, Fragment, isValidElement, useMemo, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type TabProps = {
  value: string
  label: string
  children: ReactNode
}

type TabsProps = {
  defaultValue?: string
  children: ReactNode
}

export function Tab({ children }: TabProps) {
  return <Fragment>{children}</Fragment>
}

export function Tabs({ defaultValue, children }: TabsProps) {
  const items = useMemo(
    () =>
      Children.toArray(children).flatMap((child) => {
        if (!isValidElement<TabProps>(child)) {
          return []
        }

        const { value, label, children: content } = child.props
        if (!value || !label) {
          return []
        }

        return [{ value, label, content }]
      }),
    [children],
  )

  const initialValue = defaultValue ?? items[0]?.value ?? ""
  const [activeValue, setActiveValue] = useState(initialValue)
  const activeItem = items.find((item) => item.value === activeValue) ?? items[0]

  if (items.length === 0) {
    return null
  }

  return (
    <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border/80 bg-card/70 shadow-sm">
      <div className="flex flex-wrap gap-2 border-b border-border/80 bg-background/80 px-3 py-3">
        {items.map((item) => {
          const isActive = item.value === activeItem.value

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setActiveValue(item.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div className="px-5 py-5">{activeItem.content}</div>
    </div>
  )
}