import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ServerCodeBlock } from 'fumadocs-ui/components/codeblock.rsc';

type FileCodeBlockProps = {
  file: string;
  lang?: string;
  title?: string;
  startLine?: number;
  endLine?: number;
};

const findFile = async (file: string): Promise<{ absolutePath: string; source: string }> => {
  if (path.isAbsolute(file)) {
    const source = await readFile(file, 'utf8');
    return { absolutePath: file, source };
  }

  const roots = [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
    path.resolve(process.cwd(), '..', '..'),
  ];

  for (const root of roots) {
    const absolutePath = path.resolve(root, file);

    if (!absolutePath.startsWith(root + path.sep)) {
      continue;
    }

    try {
      const source = await readFile(absolutePath, 'utf8');
      return { absolutePath, source };
    } catch {
      // Try the next candidate root.
    }
  }

  throw new Error(`Unable to find snippet file: ${file}`);
};

const selectLines = (source: string, startLine?: number, endLine?: number): string => {
  if (!startLine && !endLine) {
    return source;
  }

  const lines = source.split('\n');
  const start = Math.max(1, startLine ?? 1);
  const end = Math.min(lines.length, endLine ?? lines.length);

  if (start > end) {
    return '';
  }

  return lines.slice(start - 1, end).join('\n');
};

export async function FileCodeBlock({
  file,
  lang = 'ts',
  title,
  startLine,
  endLine,
}: FileCodeBlockProps) {
  const { source } = await findFile(file);
  const code = selectLines(source, startLine, endLine);

  return <ServerCodeBlock code={code} lang={lang} codeblock={{ title: title ?? file }} />;
}
