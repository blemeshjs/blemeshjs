import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DocsShell } from "@/components/docs/docs-shell"
import { getDoc, getStaticDocParams } from "@/lib/docs"

type PageProps = {
  params: Promise<{ slug?: string[] }>
}

export async function generateStaticParams() {
  return getStaticDocParams()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug = [] } = await params
  const doc = getDoc(slug)

  if (!doc) {
    return {
      title: "Documentation",
    }
  }

  return {
    title: `${doc.title} | Mesh Link JS`,
    description: doc.description,
  }
}

export default async function DocsPage({ params }: PageProps) {
  const { slug = [] } = await params
  const doc = getDoc(slug)

  if (!doc) {
    notFound()
  }

  const Content = (await doc.loader()).default

  return (
    <DocsShell
      currentHref={doc.href}
      title={doc.title}
      description={doc.description}
      headings={doc.headings}
    >
      <Content />
    </DocsShell>
  )
}