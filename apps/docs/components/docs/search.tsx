"use client"

import Link from "next/link"
import { useDeferredValue, useMemo, useState } from "react"
import { Search } from "lucide-react"

import { DocIcon } from "@/components/docs/doc-icons"
import { cn } from "@/lib/utils"

type SearchDoc = {
  href: string
  title: string
  description: string
  section: string
  keywords: string[]
  headings: Array<{
    title: string
    level: 2 | 3
  }>
}

export function DocsSearch({ docs, currentHref }: { docs: SearchDoc[]; currentHref: string }) {
  const [query, setQuery] = useState("")
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return []
    }

    return docs
      .map((doc) => {
        const haystack = [
          doc.title,
          doc.description,
          doc.section,
          ...doc.keywords,
          ...doc.headings.map((heading) => heading.title),
        ]
          .join("\n")
          .toLowerCase()

        const titleMatch = doc.title.toLowerCase().includes(normalizedQuery)
        const headingMatch = doc.headings.some((heading) =>
          heading.title.toLowerCase().includes(normalizedQuery),
        )
        const score = Number(titleMatch) * 4 + Number(headingMatch) * 2 + Number(haystack.includes(normalizedQuery))

        return { doc, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score || left.doc.title.localeCompare(right.doc.title))
      .slice(0, 8)
      .map((entry) => entry.doc)
  }, [docs, normalizedQuery])

  return (
    <div className="relative">
      <div className="docs-surface-soft flex items-center gap-2 rounded-xl px-3 py-2">
        <Search className="size-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search docs, APIs, and headings"
          className="w-full bg-transparent text-[0.84rem] text-foreground outline-none placeholder:text-muted-foreground"
          aria-label="Search documentation"
        />
      </div>

      {normalizedQuery ? (
        <div className="mt-3 overflow-hidden border-t border-border/70 pt-1">
          {results.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground">No docs matched that search.</div>
          ) : (
            <div className="divide-y divide-border/70">
              {results.map((doc) => {
                return (
                  <Link
                    key={doc.href}
                    href={doc.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 transition-colors hover:bg-foreground/[0.03]",
                      currentHref === doc.href && "docs-accent-badge bg-primary/8 dark:bg-cyan-400/10",
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-2">
                        <DocIcon href={doc.href} className="size-3.5 shrink-0 text-primary" />
                        <p className="truncate text-[0.84rem] font-medium text-foreground">{doc.title}</p>
                      </div>
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {doc.section}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[0.82rem] leading-5 text-muted-foreground">
                      {doc.description}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}