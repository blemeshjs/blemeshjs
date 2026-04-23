"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ListTree } from "lucide-react"

import { cn, slugifyHeading } from "@/lib/utils"

type Heading = {
  title: string
  level: 2 | 3
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const items = useMemo(
    () => headings.map((heading) => ({ ...heading, id: slugifyHeading(heading.title) })),
    [headings],
  )
  const [activeId, setActiveId] = useState(items[0]?.id)

  useEffect(() => {
    if (items.length === 0) {
      return
    }

    function updateActiveHeading() {
      const threshold = 160
      let nextActiveId = items[0]?.id

      for (const item of items) {
        const element = document.getElementById(item.id)
        if (!element) {
          continue
        }

        if (element.getBoundingClientRect().top <= threshold) {
          nextActiveId = item.id
        }
      }

      if (window.location.hash) {
        const hashId = window.location.hash.slice(1)
        if (items.some((item) => item.id === hashId)) {
          nextActiveId = hashId
        }
      }

      setActiveId(nextActiveId)
    }

    updateActiveHeading()

    window.addEventListener("scroll", updateActiveHeading, { passive: true })
    window.addEventListener("resize", updateActiveHeading)
    window.addEventListener("hashchange", updateActiveHeading)

    return () => {
      window.removeEventListener("scroll", updateActiveHeading)
      window.removeEventListener("resize", updateActiveHeading)
      window.removeEventListener("hashchange", updateActiveHeading)
    }
  }, [items])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="sticky top-[9.75rem]">
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <ListTree className="size-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">On this page</p>
      </div>
      <nav className="mt-4 space-y-1">
        {items.map((heading) => (
          <Link
            key={`${heading.level}-${heading.id}`}
            href={`#${heading.id}`}
            onClick={() => setActiveId(heading.id)}
            className={cn(
              "flex items-center rounded-lg px-2.5 py-2 text-[0.84rem] leading-5 text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground",
              activeId === heading.id && "bg-primary/10 font-medium text-foreground",
              heading.level === 3 && "ml-4 text-[0.8rem]",
            )}
          >
            {heading.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}