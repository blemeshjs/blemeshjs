"use client"

import { isValidElement, useMemo, useState, type ReactNode } from "react"
import { TerminalSquare } from "lucide-react"

import { CopyButton } from "@/components/docs/copy-button"

const TERMINAL_TABS = ["npm", "yarn", "pnpm", "bun"] as const

type TerminalTab = (typeof TERMINAL_TABS)[number]

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("")
  }

  if (!isValidElement(node)) {
    return ""
  }

  const props = node.props as {
    children?: ReactNode
    [key: string]: unknown
  }

  if (node.type === "br") {
    return "\n"
  }

  const text = extractText(props.children)
  if (props["data-line"] !== undefined) {
    return `${text}\n`
  }

  return text
}

function getCopyText(children: ReactNode, copyText?: string) {
  if (copyText) {
    return copyText
  }

  return extractText(children).replace(/\n{2,}$/g, "\n").trimEnd()
}

function getTerminalCommands(source: string): Record<TerminalTab, string> {
  const trimmed = source.trim()

  if (trimmed.startsWith("yarn add ")) {
    const packages = trimmed.slice("yarn add ".length)
    return {
      npm: `npm install ${packages}`,
      yarn: trimmed,
      pnpm: `pnpm add ${packages}`,
      bun: `bun add ${packages}`,
    }
  }

  if (trimmed.startsWith("npm install ")) {
    const packages = trimmed.slice("npm install ".length)
    return {
      npm: trimmed,
      yarn: `yarn add ${packages}`,
      pnpm: `pnpm add ${packages}`,
      bun: `bun add ${packages}`,
    }
  }

  if (trimmed.startsWith("npm i ")) {
    const packages = trimmed.slice("npm i ".length)
    return {
      npm: `npm install ${packages}`,
      yarn: `yarn add ${packages}`,
      pnpm: `pnpm add ${packages}`,
      bun: `bun add ${packages}`,
    }
  }

  if (trimmed.startsWith("pnpm add ")) {
    const packages = trimmed.slice("pnpm add ".length)
    return {
      npm: `npm install ${packages}`,
      yarn: `yarn add ${packages}`,
      pnpm: trimmed,
      bun: `bun add ${packages}`,
    }
  }

  if (trimmed.startsWith("bun add ")) {
    const packages = trimmed.slice("bun add ".length)
    return {
      npm: `npm install ${packages}`,
      yarn: `yarn add ${packages}`,
      pnpm: `pnpm add ${packages}`,
      bun: trimmed,
    }
  }

  if (trimmed.startsWith("npx ")) {
    const command = trimmed.slice("npx ".length)
    return {
      npm: trimmed,
      yarn: `yarn dlx ${command}`,
      pnpm: `pnpm dlx ${command}`,
      bun: `bunx ${command}`,
    }
  }

  return {
    npm: trimmed,
    yarn: trimmed,
    pnpm: trimmed,
    bun: trimmed,
  }
}

function looksLikeTerminalCommand(source: string) {
  const trimmed = source.trim()
  return /^(npm\s+(install|i)\b|yarn\s+(add|dlx)\b|pnpm\s+(add|dlx)\b|bun(x|\s+add)\b|npx\b)/.test(trimmed)
}

function renderCommand(command: string) {
  const lines = command.split("\n")

  return lines.map((line, lineIndex) => {
    const parts = line.split(/(\s+)/)

    return (
      <span key={`${line}-${lineIndex}`} className="block">
        {parts.map((part, partIndex) => {
          if (!part) {
            return null
          }

          let className = "text-slate-700 dark:text-[#E6EDF3]"

          if (/^--/.test(part)) {
            className = "text-emerald-600 dark:text-[#3FB950]"
          } else if (/^(npm|yarn|pnpm|bun|bunx|npx)$/.test(part)) {
            className = "text-sky-700 dark:text-[#79C0FF]"
          } else if (/^(@?[a-z0-9][\w./-]*)(@[^\s]+)?$/i.test(part) && /[@/-]/.test(part)) {
            className = "text-slate-700 dark:text-[#E6EDF3]"
          } else if (/^(install|i|add|dlx)$/.test(part)) {
            className = "text-amber-600 dark:text-[#FFA657]"
          }

          return (
            <span key={`${part}-${partIndex}`} className={className}>
              {part}
            </span>
          )
        })}
      </span>
    )
  })
}

export function CodeBlock({
  children,
  title,
  copyText,
  html,
  language,
}: {
  children?: ReactNode
  title?: string
  copyText?: string
  html?: string
  language?: string
}) {
  const text = getCopyText(children, copyText)
  const normalizedLanguage = (language ?? "").toLowerCase()
  const isTerminal = ["bash", "shell", "sh", "zsh", "console"].includes(normalizedLanguage) || looksLikeTerminalCommand(text)
  const terminalCommands = useMemo(() => getTerminalCommands(text), [text])
  const defaultTab = text.trim().startsWith("yarn ")
    ? "yarn"
    : text.trim().startsWith("pnpm ")
      ? "pnpm"
      : text.trim().startsWith("bun")
        ? "bun"
        : "npm"
  const [activeTab, setActiveTab] = useState<TerminalTab>(defaultTab)
  const activeCommand = isTerminal ? terminalCommands[activeTab] : text

  return (
    <div
      className="docs-codeblock mt-5 flex w-full flex-col rounded-[12px] border border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8fc_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_24px_rgba(15,23,42,0.08)] dark:border-[#30363D] dark:bg-[#0D1117] dark:bg-none dark:shadow-[inset_0_1px_0_rgba(240,246,252,0.03),0_10px_24px_rgba(1,4,9,0.18)]"
      data-language={normalizedLanguage || undefined}
    >
      {isTerminal ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-2.5 py-1.5 text-slate-500 dark:border-[#30363D] dark:bg-[#0B0F14] dark:text-[#8B949E]">
              <TerminalSquare className="size-3.5" />
              <span className="text-sm font-medium">Terminal</span>
            </div>
            {TERMINAL_TABS.map((tab) => {
              const isActive = tab === activeTab

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={isActive ? "rounded-[8px] border border-slate-200 bg-white px-3 py-1.5 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(15,23,42,0.08)] dark:border-[#30363D] dark:bg-[#21262D] dark:text-[#E6EDF3] dark:shadow-none" : "rounded-[8px] px-3 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-[#8B949E] dark:hover:bg-[#161B22] dark:hover:text-[#E6EDF3]"}
                >
                  <span className={isActive ? "text-sm font-semibold" : "text-sm font-medium"}>{tab}</span>
                </button>
              )
            })}
          </div>
          <CopyButton
            text={activeCommand}
            className="ml-auto shrink-0 bg-transparent text-slate-500 hover:text-slate-900 dark:text-[#8B949E] dark:hover:text-[#E6EDF3]"
          />
        </div>
      ) : null}

      <div className="flex flex-col rounded-[10px] border border-slate-200/80 bg-white p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] dark:border-white/5 dark:bg-[#010409] dark:shadow-[inset_0_1px_0_rgba(240,246,252,0.02)]">
        {title ? <div className="mb-3 text-xs text-slate-500 dark:text-[#8B949E]">{title}</div> : null}

        {!isTerminal && typeof html === "string" ? (
          <div className="docs-codeblock-content" dangerouslySetInnerHTML={{ __html: html }} />
        ) : isTerminal ? (
          <pre className="m-0 overflow-x-auto bg-transparent p-0 font-mono text-[14px] leading-6 text-slate-700 dark:text-[#E6EDF3]">
            <code>{renderCommand(activeCommand)}</code>
          </pre>
        ) : (
          <div className="docs-codeblock-content">{children}</div>
        )}
      </div>
    </div>
  )
}