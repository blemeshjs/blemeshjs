import type { ReactNode } from "react"

type ApiSignatureProps = {
  name: string
  signature: string
  returns?: string
  children?: ReactNode
}

export function ApiSignature({ name, signature, returns, children }: ApiSignatureProps) {
  return (
    <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border/80 bg-card/74 shadow-sm">
      <div className="border-b border-border/80 bg-background/80 px-5 py-4">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{name}</p>
        <pre className="mt-3 overflow-x-auto text-sm text-foreground">{signature}</pre>
        {returns ? <p className="mt-3 text-sm text-muted-foreground">Returns: {returns}</p> : null}
      </div>
      {children ? <div className="px-5 py-5 text-sm leading-7 text-muted-foreground">{children}</div> : null}
    </div>
  )
}