import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ChevronRight, Github, PanelLeftOpen } from "lucide-react"

import { DocIcon, SectionIcon } from "@/components/docs/doc-icons"
import { DocsSearch } from "@/components/docs/search"
import { TableOfContents } from "@/components/docs/table-of-contents"
import { ThemeToggle } from "@/components/docs/theme-toggle"
import { docs, getDocNeighbors, getSearchableDocs, getSections } from "@/lib/docs"
import { cn } from "@/lib/utils"

const topNav = [
  { href: "/docs", label: "Home" },
  { href: "/docs/quick-start", label: "Quick Start" },
  { href: "/docs/guides/react-native", label: "Setup" },
  { href: "/docs/guides", label: "Guides" },
  { href: "/docs/api", label: "Reference" },
]

type Props = {
  currentHref: string
  title: string
  description: string
  headings?: Array<{
    title: string
    level: 2 | 3
  }>
  children: ReactNode
}

export function DocsShell({ currentHref, title, description, headings = [], children }: Props) {
  const sections = getSections()
  const neighbors = getDocNeighbors(currentHref)
  const searchableDocs = getSearchableDocs()
  const currentDoc = docs.find((doc) => doc.href === currentHref)
  const currentSection = currentDoc?.section ?? "Documentation"
  const highlightedDocs = docs.filter((doc) => ["/docs/quick-start", "/docs/guides/provisioning", "/docs/api/mesh", "/docs/troubleshooting"].includes(doc.href))
  const showSectionCrumb = currentSection !== "Introduction" && currentSection !== title
  const isLandingPage = currentHref === "/docs"
  const contentWidthClass = isLandingPage ? "max-w-[76rem]" : "max-w-[52rem]"

  function isTopNavActive(href: string) {
    if (href === "/docs") {
      return currentHref === "/docs"
    }

    if (href === "/docs/guides/react-native") {
      return currentSection === "Setup"
    }

    return currentHref === href || currentHref.startsWith(`${href}/`)
  }

  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[104rem] flex-col gap-4 px-5 py-3 lg:flex-row lg:items-center lg:justify-between xl:px-6">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <Link href="/docs" className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="docs-accent-badge flex size-9 items-center justify-center rounded-xl font-mono text-[11px] font-semibold tracking-[0.2em]">
                  ML
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[0.8rem] font-semibold tracking-[0.14em] text-foreground uppercase">
                    Mesh Link JS
                  </p>
                  <p className="truncate text-[0.82rem] leading-5 text-muted-foreground">
                    JavaScript and TypeScript mesh SDK documentation
                  </p>
                </div>
              </div>
            </Link>
            <div className="rounded-full border border-border/80 bg-card/75 px-3 py-1 text-xs font-medium text-muted-foreground lg:hidden">
              {title}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[44rem] lg:flex-row lg:items-center lg:justify-end">
            <nav className="flex flex-wrap items-center gap-2">
            {topNav.map((item) => {
              const isActive = isTopNavActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.82rem] transition-colors",
                    isActive
                      ? "docs-accent-badge text-foreground"
                      : "border-border/70 bg-card/60 text-muted-foreground hover:border-primary/20 hover:text-foreground dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-cyan-300/20",
                  )}
                >
                  <DocIcon href={item.href} className="size-3.5" />
                  {item.label}
                </Link>
              )
            })}
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a
                href="https://github.com"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/65 px-3 py-1.5 text-[0.82rem] text-muted-foreground transition-colors hover:text-foreground dark:border-white/10 dark:bg-white/[0.04]"
              >
                <Github className="size-3.5" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[104rem] gap-6 px-5 py-5 xl:grid-cols-[18rem_minmax(0,1fr)] 2xl:grid-cols-[18rem_minmax(0,1fr)_16rem] xl:px-6">
        <aside className="space-y-4 xl:block">
          <div className="xl:sticky xl:top-[6.4rem]">
            <div className="flex items-center gap-2 border-b border-border/70 pb-3">
              <PanelLeftOpen className="size-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Documentation</p>
            </div>

            <div className="mt-4">
              <DocsSearch docs={searchableDocs} currentHref={currentHref} />
            </div>

            <div className="mt-5 space-y-6">
              {Object.entries(sections).map(([section, pages]) => {
                const sectionPage = pages.find((page) => page.title === section)
                const visiblePages = sectionPage ? pages.filter((page) => page.href !== sectionPage.href) : pages

                return (
                  <div key={section}>
                    {section !== "Introduction" ? (
                      sectionPage ? (
                        <Link
                          href={sectionPage.href}
                          className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <SectionIcon section={section} className="size-3.5" />
                          {section}
                        </Link>
                      ) : (
                        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          <SectionIcon section={section} className="size-3.5" />
                          {section}
                        </div>
                      )
                    ) : null}
                    <div className="space-y-1">
                      {visiblePages.map((page) => {
                        return (
                          <Link
                            key={page.href}
                            href={page.href}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[0.84rem] leading-5 transition-colors hover:bg-foreground/[0.04] hover:text-foreground",
                              currentHref === page.href
                                ? "docs-accent-badge font-medium text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            <DocIcon href={page.href} className="size-3.5 shrink-0" />
                            <span>{page.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5 border-t border-border/70 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Popular</p>
              <div className="mt-3 space-y-2">
                {highlightedDocs.map((doc) => {
                  return (
                    <Link
                      key={doc.href}
                      href={doc.href}
                      className="flex items-center gap-2 text-[0.82rem] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <DocIcon href={doc.href} className="size-3.5 text-primary" />
                      <span>{doc.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className={cn("mx-auto", contentWidthClass)}>
            <div className="mb-6 border-b border-border/70 pb-5 md:pb-6">
              <div className="flex flex-wrap items-center gap-2 text-[0.8rem] text-muted-foreground">
                <Link href="/docs" className="transition-colors hover:text-foreground">Docs</Link>
                {showSectionCrumb ? (
                  <>
                    <ChevronRight className="size-3.5" />
                    <span className="inline-flex items-center gap-1.5">
                      <SectionIcon section={currentSection} className="size-3.5 text-primary" />
                      {currentSection}
                    </span>
                  </>
                ) : null}
                <ChevronRight className="size-3.5" />
                <span className="text-foreground">{title}</span>
              </div>
              <div className="mt-3 flex items-start gap-3.5">
                <div className="docs-accent-well mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl">
                  <DocIcon href={currentHref} className="size-5" />
                </div>
                <div className="min-w-0">
              <h1 className="text-[1.95rem] leading-[1.05] font-semibold tracking-tight text-foreground md:text-[2.25rem]">
                {title}
              </h1>
              <p className="mt-2.5 max-w-3xl text-[0.96rem] leading-6 text-muted-foreground md:text-[1rem]">
                {description}
              </p>
                </div>
              </div>
            </div>
            <article className="docs-copy max-w-none">{children}</article>
          </div>

          <div className={cn("mx-auto mt-6 grid gap-4 md:grid-cols-2", contentWidthClass)}>
            <DocPagerCard
              direction="Previous"
              href={neighbors.previous?.href}
              title={neighbors.previous?.title}
            />
            <DocPagerCard direction="Next" href={neighbors.next?.href} title={neighbors.next?.title} />
          </div>
        </main>

        <aside className="hidden 2xl:block">
          <TableOfContents headings={headings} />
        </aside>
      </div>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-[104rem] flex-col gap-4 px-5 py-6 text-[0.84rem] text-muted-foreground md:flex-row md:items-center md:justify-between xl:px-6">
          <div>
            <p className="font-medium text-foreground">Mesh Link JS</p>
            <p className="mt-1">Documentation for the JavaScript and TypeScript SDK surface.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/docs/quick-start" className="transition-colors hover:text-foreground">
              Quick Start
            </Link>
            <Link href="/docs/guides/react-native" className="transition-colors hover:text-foreground">
              Setup
            </Link>
            <Link href="/docs/guides" className="transition-colors hover:text-foreground">
              Guides
            </Link>
            <Link href="/docs/api" className="transition-colors hover:text-foreground">
              Reference
            </Link>
            <a href="https://github.com" className="transition-colors hover:text-foreground">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DocPagerCard({
  direction,
  href,
  title,
}: {
  direction: string
  href?: string
  title?: string
}) {
  if (!href || !title) {
    return <div className="hidden md:block" />
  }

  const Arrow = direction === "Previous" ? ArrowLeft : ArrowRight

  return (
    <Link
      href={href}
      className="docs-surface-interactive rounded-[1.1rem] p-4 transition-transform hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card dark:hover:border-cyan-300/25 dark:hover:bg-white/[0.06]"
    >
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{direction}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DocIcon href={href} className="size-4 text-primary" />
          <p className="text-[0.95rem] font-medium text-foreground">{title}</p>
        </div>
        <Arrow className="size-4 text-muted-foreground" />
      </div>
    </Link>
  )
}