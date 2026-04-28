import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Application, ReflectionKind } from 'typedoc';

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

await fs.mkdir(apiDocsDir, { recursive: true });

for (const config of packages) {
  const page = await buildPackagePage(config);
  await fs.writeFile(path.join(apiDocsDir, `${config.key}.mdx`), page, 'utf8');
}

await fs.writeFile(path.join(apiDocsDir, 'index.mdx'), buildIndexPage(packages), 'utf8');
await fs.writeFile(path.join(apiDocsDir, 'meta.json'), JSON.stringify({
  title: 'API',
  icon: 'TrafficCone',
  pages: ['index', ...packages.map((item) => item.key)],
}, null, 2) + '\n', 'utf8');

function buildIndexPage(packageConfigs) {
  const rows = packageConfigs
    .map(
      (item) =>
        `| [${item.title}](/docs/api/${item.key}) | \`${item.packageName}\` | ${escapePipe(item.description)} |`,
    )
    .join('\n');

  return `---
title: API Reference
description: Auto-generated package reference built from TypeScript source comments and exported surfaces.
icon: BookOpenText
---

This API section is package-oriented and auto-generated from the public TypeScript entrypoints in the monorepo.

> Write API documentation as TSDoc-style comments above exported declarations in package source files. The docs generator reads those comments and rebuilds these pages automatically.

## How this flow works

1. Add or update comments in the package source under the relevant \`src/**\` tree.
2. Run \`yarn workspace docs api:generate\` if you want to refresh the API pages directly.
3. Any docs \`dev\`, \`build\`, or \`types:check\` run also regenerates the API pages first.

## Package reference map

| Page | Package | What it covers |
| --- | --- | --- |
${rows}

## Writing good source comments

Use concise comments directly on exported declarations.

\`\`\`ts
/**
 * Creates a browser-configured mesh manager using Web Bluetooth transport and browser storage.
 *
 * @remarks
 * Call this once during application startup and reuse the returned manager for later scans and connections.
 */
export async function createBrowserMesh(...) {
  // ...
}
\`\`\`

## Why this flow is better

- The package surface stays aligned with the real source of truth.
- Comments live next to the code they describe.
- Docs rebuilds automatically as part of normal docs workflows.
- Fumadocs still renders the generated pages with the same site-wide styling as the rest of the docs.
`;
}

async function buildPackagePage(config) {
  const project = await createProject(config);
  const allExports = uniqueByName((project.children ?? []).filter((child) => !child.inheritedFrom));
  const exportsForPage = (config.localOnly
    ? allExports.filter((child) => isLocalReflection(child, config.entryPoint))
    : allExports)
    .sort((left, right) => left.name.localeCompare(right.name));

  const exportMapRows = exportsForPage.length
    ? exportsForPage.map((reflection) => {
        const summary = summaryText(reflection.comment) || 'No description yet.';
        return `| [${reflection.name}](#${slugify(reflection.name)}) | ${reflectionKind(reflection)} | ${escapePipe(summary)} |`;
      }).join('\n')
    : '| None yet | - | Add exported declarations with comments in source. |';

  const sections = exportsForPage.map((reflection) => renderReflectionSection(reflection)).join('\n\n');

  const reexportNote = config.reexports?.length
    ? `\n## Package notes\n\nThis package also re-exports symbols from ${config.reexports.map((name) => `\`${name}\``).join(' and ')}. This page focuses on the runtime-specific exports declared in ${config.sourceLabel}.\n`
    : '';

  return `---
title: ${config.title}
description: ${config.description}
icon: ${config.icon}
---

This page is auto-generated from \`${config.sourceLabel}\` and the public exports exposed by \`${config.packageName}\`.

> Update TSDoc comments in source, then run \`yarn workspace docs api:generate\`. Normal docs \`dev\`, \`build\`, and \`types:check\` runs regenerate these pages automatically.

## Package overview

| Field | Value |
| --- | --- |
| Package | \`${config.packageName}\` |
| Entry point | \`${path.relative(repoRoot, config.entryPoint).replaceAll('\\\\', '/')}\` |
| Source tree | \`${config.sourceLabel}\` |

${reexportNote}
## Export map

| Export | Kind | Summary |
| --- | --- | --- |
${exportMapRows}

## Exported API

${sections || 'No exported API reflections were generated for this package yet.'}
`;
}

async function createProject(config) {
  const app = await Application.bootstrapWithPlugins({
    entryPoints: [config.entryPoint],
    tsconfig: config.tsconfig,
    entryPointStrategy: 'resolve',
    excludeExternals: false,
    excludeInternal: true,
    excludePrivate: true,
    categorizeByGroup: false,
    skipErrorChecking: true,
    plugin: [],
  });

  const project = await app.convert();
  if (!project) {
    throw new Error(`Failed to generate TypeDoc reflection for ${config.packageName}`);
  }

  return project;
}

function renderReflectionSection(reflection) {
  const parts = [];
  const heading = `### ${reflection.name}`;
  parts.push(heading);
  parts.push(`**Kind:** ${reflectionKind(reflection)}`);

  const source = sourcePath(reflection);
  if (source) {
    parts.push(`**Source:** \`${source}\``);
  }

  const summary = summaryText(reflection.comment);
  if (summary) {
    parts.push(`\n${summary}`);
  }

  const remarks = blockTagText(reflection.comment, '@remarks');
  if (remarks) {
    parts.push(`\n${remarks}`);
  }

  const signatureBlock = renderPrimarySignature(reflection);
  if (signatureBlock) {
    parts.push(`\n\`\`\`ts\n${signatureBlock}\n\`\`\``);
  }

  const memberSections = renderMemberSections(reflection);
  if (memberSections) {
    parts.push(memberSections);
  }

  return parts.join('\n\n');
}

function renderPrimarySignature(reflection) {
  if (reflection.signatures?.length) {
    return reflection.signatures.map(renderCallSignature).join('\n\n');
  }

  const kind = reflectionKind(reflection);

  switch (kind) {
    case 'Class':
      return renderClassSignature(reflection);
    case 'Interface':
      return renderInterfaceSignature(reflection);
    case 'Type alias':
      return `type ${reflection.name}${renderTypeParameters(reflection.typeParameters)} = ${stringifyType(reflection.type)};`;
    case 'Variable':
      return `const ${reflection.name}: ${stringifyType(reflection.type)};`;
    case 'Enumeration':
      return renderEnumSignature(reflection);
    default:
      return '';
  }
}

function renderCallSignature(signature) {
  const typeParameters = renderTypeParameters(signature.typeParameters);
  const parameters = (signature.parameters ?? []).map((parameter) => {
    const optional = parameter.flags?.isOptional ? '?' : '';
    return `${parameter.name}${optional}: ${stringifyType(parameter.type)}`;
  }).join(', ');
  return `function ${signature.name}${typeParameters}(${parameters}): ${stringifyType(signature.type)};`;
}

function renderClassSignature(reflection) {
  const typeParameters = renderTypeParameters(reflection.typeParameters);
  const extendedTypes = reflection.extendedTypes?.length
    ? ` extends ${reflection.extendedTypes.map(stringifyType).join(', ')}`
    : '';
  const implementedTypes = reflection.implementedTypes?.length
    ? ` implements ${reflection.implementedTypes.map(stringifyType).join(', ')}`
    : '';
  return `class ${reflection.name}${typeParameters}${extendedTypes}${implementedTypes}`;
}

function renderInterfaceSignature(reflection) {
  const typeParameters = renderTypeParameters(reflection.typeParameters);
  const extendedTypes = reflection.extendedTypes?.length
    ? ` extends ${reflection.extendedTypes.map(stringifyType).join(', ')}`
    : '';
  return `interface ${reflection.name}${typeParameters}${extendedTypes}`;
}

function renderEnumSignature(reflection) {
  const members = (reflection.children ?? []).map((child) => `  ${child.name},`).join('\n');
  return `enum ${reflection.name} {\n${members}\n}`;
}

function renderMemberSections(reflection) {
  const children = reflection.children ?? [];
  if (!children.length) {
    return '';
  }

  const properties = children.filter((child) =>
    ['Property', 'Accessor', 'Get signature', 'Set signature'].includes(reflectionKind(child)),
  );
  const methods = children.filter((child) => reflectionKind(child) === 'Method');
  const constructors = children.filter((child) => reflectionKind(child) === 'Constructor');
  const enumMembers = children.filter((child) => reflectionKind(child) === 'Enumeration member');

  const parts = [];

  if (constructors.length) {
    parts.push('#### Constructors');
    parts.push('| Name | Signature | Description |');
    parts.push('| --- | --- | --- |');
    for (const item of constructors) {
      const signature = item.signatures?.[0] ? renderCallSignature(item.signatures[0]).replace(/^function\s+/, '') : item.name;
      parts.push(`| \`${item.name}\` | \`${escapePipe(signature)}\` | ${escapePipe(summaryText(item.comment) || 'No description yet.')} |`);
    }
  }

  if (properties.length) {
    parts.push('#### Properties');
    parts.push('| Name | Type | Description |');
    parts.push('| --- | --- | --- |');
    for (const item of properties) {
      parts.push(`| \`${item.name}\` | \`${escapePipe(stringifyType(item.type))}\` | ${escapePipe(summaryText(item.comment) || 'No description yet.')} |`);
    }
  }

  if (methods.length) {
    parts.push('#### Methods');
    parts.push('| Name | Signature | Description |');
    parts.push('| --- | --- | --- |');
    for (const item of methods) {
      const signature = item.signatures?.[0] ? renderCallSignature(item.signatures[0]).replace(/^function\s+/, '') : item.name;
      parts.push(`| \`${item.name}\` | \`${escapePipe(signature)}\` | ${escapePipe(summaryText(item.comment) || 'No description yet.')} |`);
    }
  }

  if (enumMembers.length) {
    parts.push('#### Members');
    parts.push('| Name | Description |');
    parts.push('| --- | --- |');
    for (const item of enumMembers) {
      parts.push(`| \`${item.name}\` | ${escapePipe(summaryText(item.comment) || 'No description yet.')} |`);
    }
  }

  return parts.join('\n');
}

function isLocalReflection(reflection, entryPoint) {
  const packageSrcDir = path.dirname(entryPoint) + path.sep;
  return (reflection.sources ?? []).some((source) => {
    const fileName = source.fullFileName ?? source.fileName ?? '';
    const absolute = path.isAbsolute(fileName) ? fileName : path.join(repoRoot, fileName);
    return absolute.startsWith(packageSrcDir);
  });
}

function reflectionKind(reflection) {
  if (reflection.kindOf?.(ReflectionKind.Class)) {
    return 'Class';
  }
  if (reflection.kindOf?.(ReflectionKind.Interface)) {
    return 'Interface';
  }
  if (reflection.kindOf?.(ReflectionKind.Enum)) {
    return 'Enumeration';
  }
  if (reflection.kindOf?.(ReflectionKind.EnumMember)) {
    return 'Enumeration member';
  }
  if (reflection.kindOf?.(ReflectionKind.TypeAlias)) {
    return 'Type alias';
  }
  if (reflection.kindOf?.(ReflectionKind.Variable)) {
    return 'Variable';
  }
  if (reflection.kindOf?.(ReflectionKind.Function)) {
    return 'Function';
  }
  if (reflection.kindOf?.(ReflectionKind.Method)) {
    return 'Method';
  }
  if (reflection.kindOf?.(ReflectionKind.Constructor)) {
    return 'Constructor';
  }
  if (reflection.kindOf?.(ReflectionKind.Property)) {
    return 'Property';
  }
  if (reflection.kindOf?.(ReflectionKind.Accessor)) {
    return 'Accessor';
  }
  if (reflection.kindOf?.(ReflectionKind.Reference)) {
    return 'Reference';
  }
  return 'Unknown';
}

function summaryText(comment) {
  if (!comment?.summary?.length) {
    return '';
  }
  return comment.summary.map((part) => part.text).join('').trim().replace(/\n+/g, ' ');
}

function blockTagText(comment, tag) {
  const block = comment?.blockTags?.find((item) => item.tag === tag);
  if (!block?.content?.length) {
    return '';
  }
  return block.content.map((part) => part.text).join('').trim();
}

function sourcePath(reflection) {
  const source = reflection.sources?.[0];
  if (!source) {
    return '';
  }
  const fileName = source.fullFileName ?? source.fileName ?? '';
  const absolute = path.isAbsolute(fileName) ? fileName : path.join(repoRoot, fileName);
  return `${path.relative(repoRoot, absolute).replaceAll('\\\\', '/')}#L${source.line ?? 1}`;
}

function stringifyType(type) {
  if (!type) {
    return 'unknown';
  }
  if (typeof type === 'string') {
    return type;
  }
  if (typeof type.toString === 'function') {
    return type.toString();
  }
  return 'unknown';
}

function renderTypeParameters(typeParameters) {
  if (!typeParameters?.length) {
    return '';
  }
  return `<${typeParameters.map((parameter) => parameter.name).join(', ')}>`;
}

function uniqueByName(reflections) {
  const seen = new Set();
  return reflections.filter((reflection) => {
    if (seen.has(reflection.name)) {
      return false;
    }
    seen.add(reflection.name);
    return true;
  });
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function escapePipe(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
