import path from "node:path"
import { fileURLToPath } from "node:url"

import createMDX from "@next/mdx"

const configDir = path.dirname(fileURLToPath(import.meta.url))
const remarkGfmPluginPath = path.join(configDir, "lib/remark-gfm-plugin.mjs")
const rehypePrettyCodePluginPath = path.join(configDir, "lib/rehype-pretty-code-plugin.mjs")

const withMDX = createMDX({
	options: {
		remarkPlugins: [remarkGfmPluginPath],
		rehypePlugins: [[rehypePrettyCodePluginPath, {
			theme: {
				light: "github-light",
				dark: "github-dark-dimmed",
			},
			keepBackground: false,
			defaultLang: {
				block: "plaintext",
				inline: "plaintext",
			},
		}]],
	},
})

/** @type {import('next').NextConfig} */
const nextConfig = {
	pageExtensions: ["ts", "tsx", "md", "mdx"],
}

export default withMDX(nextConfig)
