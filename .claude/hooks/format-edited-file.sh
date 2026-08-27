#!/usr/bin/env bash
# Formats a file that Claude just wrote, so prettier-only diffs never show up
# in a review. Silent on anything it cannot or should not format.
set -uo pipefail

payload=$(cat)
file=$(printf '%s' "$payload" | node -e '
  let s = "";
  process.stdin.on("data", (d) => (s += d));
  process.stdin.on("end", () => {
    try {
      const p = JSON.parse(s).tool_input?.file_path ?? "";
      process.stdout.write(p);
    } catch {
      process.stdout.write("");
    }
  });
' 2>/dev/null)

[ -n "$file" ] || exit 0
[ -f "$file" ] || exit 0

case "$file" in
  *.ts | *.tsx | *.mts | *.cts | *.js | *.jsx | *.mjs | *.cjs | *.json | *.md | *.mdx | *.css | *.yml | *.yaml) ;;
  *) exit 0 ;;
esac

repo=$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null) || exit 0
prettier="$repo/node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0

"$prettier" --ignore-path "$repo/.prettierignore" --log-level silent --write "$file" >/dev/null 2>&1 || true
exit 0
