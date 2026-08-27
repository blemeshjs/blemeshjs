import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { Application } from 'typedoc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(docsRoot, '..', '..');
const apiDocsDir = path.join(docsRoot, 'content', 'docs', 'api');

const packages = [
  {
    key: 'sdk',
    title: 'SDK Package',
    description: 'High-level mesh manager, model extensions, and shared SDK types used across runtimes.',
    icon: 'BookOpenText',
    packageName: '@blemeshjs/sdk',
    entryPoint: path.join(repoRoot, 'packages', 'sdk', 'src', 'index.ts'),
    tsconfig: path.join(repoRoot, 'packages', 'sdk', 'tsconfig.build.json'),
    sourceLabel: 'packages/sdk/src/**',
    localOnly: true,
    reexports: ['@blemeshjs/utils'],
  },
  {
    key: 'core',
    title: 'Core Package',
    description: 'Reusable mesh engine types, messages, bearers, and provisioning primitives shared across runtimes.',
    icon: 'Layers',
    packageName: '@blemeshjs/core',
    entryPoint: path.join(repoRoot, 'packages', 'core', 'src', 'index.ts'),
    tsconfig: path.join(repoRoot, 'packages', 'core', 'tsconfig.build.json'),
    sourceLabel: 'packages/core/src/**',
  },
  {
    key: 'utils',
    title: 'Utils Package',
    description: 'Shared identifiers, storage abstractions, enums, message helpers, and low-level support types.',
    icon: 'Wrench',
    packageName: '@blemeshjs/utils',
    entryPoint: path.join(repoRoot, 'packages', 'utils', 'src', 'index.ts'),
    tsconfig: path.join(repoRoot, 'packages', 'utils', 'tsconfig.build.json'),
    sourceLabel: 'packages/utils/src/**',
  },
  {
    key: 'crypto',
    title: 'Crypto Package',
    description: 'Mesh cryptographic helpers layered on top of the shared utility and protocol packages.',
    icon: 'Shield',
    packageName: '@blemeshjs/crypto',
    entryPoint: path.join(repoRoot, 'packages', 'crypto', 'src', 'index.ts'),
    tsconfig: path.join(repoRoot, 'packages', 'crypto', 'tsconfig.build.json'),
    sourceLabel: 'packages/crypto/src/**',
  },
  {
    key: 'web',
    title: 'Web Package',
    description: 'Browser transport and storage helpers for Web Bluetooth integrations, plus the shared SDK surface.',
    icon: 'Monitor',
    packageName: '@blemeshjs/sdk-web',
    entryPoint: path.join(repoRoot, 'packages', 'sdk-web', 'src', 'index.ts'),
    tsconfig: path.join(repoRoot, 'packages', 'sdk-web', 'tsconfig.build.json'),
    sourceLabel: 'packages/sdk-web/src/**',
    localOnly: true,
    reexports: ['@blemeshjs/sdk', '@blemeshjs/crypto'],
  },
  {
    key: 'react-native',
    title: 'React Native Package',
    description: 'React Native transport and storage setup helpers that wrap the shared SDK for mobile runtimes.',
    icon: 'Smartphone',
    packageName: '@blemeshjs/sdk-react-native',
    entryPoint: path.join(repoRoot, 'packages', 'sdk-react-native', 'src', 'index.ts'),
    tsconfig: path.join(repoRoot, 'packages', 'sdk-react-native', 'tsconfig.build.json'),
    sourceLabel: 'packages/sdk-react-native/src/**',
    localOnly: true,
    reexports: ['@blemeshjs/sdk'],
  },
];

await fs.rm(apiDocsDir, { recursive: true, force: true });
await fs.mkdir(apiDocsDir, { recursive: true });

/**
 * Renders one package's public API to a single MDX page.
 *
 * typedoc-plugin-markdown does the rendering. We only supply the entry point,
 * the visibility rules, and the Fumadocs frontmatter.
 */
async function buildPackagePage(config) {
  const outDir = await fs.mkdtemp(path.join(os.tmpdir(), `blemeshjs-api-${config.key}-`));

  // Workspace dependencies resolve through node_modules symlinks into other
  // packages' dist/*.d.ts. Without a filter TypeDoc documents that entire
  // transitive surface, so treat anything outside this package's own src as
  // external and drop it. Each package's page then covers only what it
  // declares, and the re-export callout points at the rest.
  const packageSrcDir = path.dirname(config.entryPoint).replaceAll('\\', '/');

  const app = await Application.bootstrapWithPlugins({
    entryPoints: [config.entryPoint],
    tsconfig: config.tsconfig,
    entryPointStrategy: 'resolve',
    plugin: ['typedoc-plugin-markdown'],

    // Only the surface a consumer can actually reach.
    excludeInternal: true,
    excludePrivate: true,
    excludeProtected: true,
    excludeExternals: true,
    externalPattern: [`!${packageSrcDir}/**`],
    excludeReferences: false,
    skipErrorChecking: true,
    githubPages: false,
    readme: 'none',
    // Source links would point at dist/*.d.ts, which is not useful.
    disableSources: true,

    // One file per package, matching the existing navigation.
    outputFileStrategy: 'modules',
    mergeReadme: false,
    hidePageHeader: true,
    hideBreadcrumbs: true,
    hidePageTitle: true,
    useCodeBlocks: true,
    expandObjects: true,
    expandParameters: true,
    parametersFormat: 'table',
    propertiesFormat: 'list',
    enumMembersFormat: 'table',
    typeDeclarationFormat: 'list',
    indexFormat: 'table',
    sanitizeComments: true,
    out: outDir,
  });

  const project = await app.convert();
  if (!project) {
    throw new Error(`TypeDoc could not convert ${config.packageName}`);
  }
  await app.generateOutputs(project);

  const body = await readGeneratedMarkdown(outDir);
  await fs.rm(outDir, { recursive: true, force: true });

  const entryPoint = path.relative(repoRoot, config.entryPoint).replaceAll('\\', '/');
  const reexportNote = config.reexports?.length
    ? `\n<Callout title="Re-exports">\n  \`${config.packageName}\` also re-exports everything from ` +
      `${config.reexports.map((name) => `\`${name}\``).join(' and ')}. This page documents only what ` +
      `${config.sourceLabel} declares itself.\n</Callout>\n`
    : '';

  return `---
title: ${config.title}
description: ${config.description}
icon: ${config.icon}
---

{/* Generated by apps/docs/scripts/generate-api-docs.mjs. Do not edit by hand. */}
{/* Change the TSDoc comment in \`${entryPoint}\` and run \`yarn workspace docs api:generate\`. */}

Generated from \`${entryPoint}\`.
${reexportNote}
${body}
`;
}

/** Concatenates whatever files the plugin emitted, in a stable order. */
async function readGeneratedMarkdown(outDir) {
  const files = [];
  async function walk(dir) {
    for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith('.md')) files.push(full);
    }
  }
  await walk(outDir);

  const parts = [];
  for (const file of files) {
    parts.push(stripFrontmatter(await fs.readFile(file, 'utf8')).trim());
  }
  return parts.filter(Boolean).join('\n\n---\n\n');
}

function stripFrontmatter(markdown) {
  return markdown.startsWith('---') ? markdown.replace(/^---\n[\s\S]*?\n---\n/, '') : markdown;
}

for (const config of packages) {
  const page = await buildPackagePage(config);
  await fs.writeFile(path.join(apiDocsDir, `${config.key}.mdx`), page, 'utf8');
  process.stdout.write(`  generated api/${config.key}.mdx\n`);
}

await fs.writeFile(
  path.join(apiDocsDir, 'index.mdx'),
  `---
title: API Reference
description: Generated reference for every public blemeshjs package.
icon: Boxes
---

{/* Generated by apps/docs/scripts/generate-api-docs.mjs. Do not edit by hand. */}

Every page here is generated from the package's public entry point with
[TypeDoc](https://typedoc.org). To change what appears, edit the TSDoc comment
next to the declaration and run:

\`\`\`sh
yarn workspace docs api:generate
\`\`\`

CI fails if the committed output does not match what the generator emits.

| Package | Covers |
| --- | --- |
${packages
  .map((config) => `| [${config.title}](/docs/api/${config.key}) | \`${config.packageName}\` |`)
  .join('\n')}

## Where to start

If you are building an app, start with the platform package for your runtime —
[Web](/docs/api/web) or [React Native](/docs/api/react-native) — then
[SDK](/docs/api/sdk) for the manager, models and model extensions. Drop into
[Core](/docs/api/core) only for protocol-level work.
`,
  'utf8',
);

await fs.writeFile(
  path.join(apiDocsDir, 'meta.json'),
  JSON.stringify({ title: 'API', pages: ['index', ...packages.map((c) => c.key)] }, null, 2) + '\n',
  'utf8',
);

process.stdout.write('  generated api/index.mdx and api/meta.json\n');
