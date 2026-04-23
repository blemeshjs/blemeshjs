import { readFile } from "node:fs/promises"
import path from "node:path"

import { CodeBlock } from "@/components/docs/code-block"
import { highlightSourceCode } from "@/lib/code-highlighting"

export async function SourceFile({
  path: filePath,
  language = "ts",
}: {
  path: string
  language?: string
}) {
  const absolutePath = path.join(process.cwd(), filePath)
  const source = await readFile(absolutePath, "utf8")
  const html = await highlightSourceCode(source, language)

  return (
    <CodeBlock title={filePath} copyText={source} html={html} language={language} />
  )
}