import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"
import Link from "next/link"

import { ArchitectureDiagram } from "@/components/docs/architecture-diagram"
import { ApiSignature } from "@/components/docs/api-signature"
import { Callout } from "@/components/docs/callout"
import { CodeBlock } from "@/components/docs/code-block"
import { SourceFile } from "@/components/docs/source-file"
import { Tab, Tabs } from "@/components/docs/tabs"
import { cn, slugifyHeading } from "@/lib/utils"

type MDXComponentMap = Record<string, ElementType>

function textFromChildren(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return `${children}`
  }
  if (Array.isArray(children)) {
    return children.map(textFromChildren).join("")
  }
  if (children && typeof children === "object" && "props" in children) {
    return textFromChildren((children as { props?: { children?: ReactNode } }).props?.children)
  }
  return ""
}

function getCodeLanguage(className?: string) {
  if (!className) {
    return undefined
  }

  const match = className.match(/language-([a-z0-9+-]+)/i)
  return match?.[1]
}

function getLanguageFromProps(props?: { className?: string; [key: string]: unknown }) {
  if (!props) {
    return undefined
  }

  const dataLanguage = typeof props["data-language"] === "string" ? props["data-language"] : undefined
  return dataLanguage ?? getCodeLanguage(props.className)
}

function Heading({
  as: Tag,
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"h2"> & {
  as: "h1" | "h2" | "h3"
}) {
  const label = textFromChildren(children)
  const id = slugifyHeading(label)

  return (
    <Tag id={id} className={cn("group scroll-m-24", className)} {...props}>
      <a href={`#${id}`} className="inline-flex items-center gap-2 text-inherit no-underline">
        <span>{children}</span>
        <span className="font-mono text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          #
        </span>
      </a>
    </Tag>
  )
}

const ProseLink = ({ className, href = "", ...props }: ComponentPropsWithoutRef<"a">) => {
  if (href.startsWith("/")) {
    return (
      <Link
        href={href}
        className={cn("font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary", className)}
        {...props}
      />
    )
  }

  return (
    <a
      className={cn("font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary", className)}
      href={href}
      {...props}
    />
  )
}

export function useMDXComponents(components: MDXComponentMap): MDXComponentMap {
  return {
    a: ProseLink,
    blockquote: ({ children, className, ...props }) => (
      <Callout as="blockquote" className={className} {...props}>
        {children}
      </Callout>
    ),
    code: (props) => <code {...props} />,
    h1: (props) => <Heading as="h1" {...props} />,
    h2: (props) => <Heading as="h2" {...props} />,
    h3: (props) => <Heading as="h3" {...props} />,
    pre: ({ className, children, ...props }: ComponentPropsWithoutRef<"pre">) => {
      const preClassName = typeof className === "string" ? className : undefined
      const childProps =
        children && typeof children === "object" && "props" in children
          ? (children as { props?: { className?: string; [key: string]: unknown } }).props
          : undefined
      const preProps = {
        ...props,
        className: preClassName,
      }
      const language = getLanguageFromProps(childProps) ?? getLanguageFromProps(preProps)

      return (
        <CodeBlock language={language}>
          <pre className={cn("overflow-x-auto bg-transparent p-0 text-[13px] text-slate-800 dark:text-slate-100", preClassName)} {...props}>
            {children}
          </pre>
        </CodeBlock>
      )
    },
    table: (props) => (
      <div className="mt-5 overflow-x-auto rounded-[1.35rem] border border-border/80 bg-card/74 shadow-sm">
        <table {...props} />
      </div>
    ),
    thead: (props) => <thead {...props} />,
    th: (props) => <th {...props} />,
    td: (props) => <td {...props} />,
    Callout,
    ApiSignature,
    ArchitectureDiagram,
    SourceFile,
    Tab,
    Tabs,
    ...components,
  }
}