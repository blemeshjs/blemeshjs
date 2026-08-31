import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const packageDirs = [
  "packages/utils",
  "packages/crypto",
  "packages/core",
  "packages/sdk",
  "packages/sdk-web",
  "packages/sdk-react-native"
];

const dryRun = process.argv.includes("--dry-run");
const skipBuild = process.argv.includes("--skip-build");
const publishArgs = ["publish", "--access", "public", "--no-git-checks"];
const enableProvenance = process.env.BLEMESHJS_ENABLE_PROVENANCE === "true";

if (dryRun) {
  publishArgs.push("--dry-run");
}

if (enableProvenance) {
  publishArgs.push("--provenance");
}

function runPnpm(args, cwd) {
  execFileSync("pnpm", args, {
    cwd,
    stdio: "inherit",
    env: process.env
  });
}

// pnpm has no equivalent of yarn's `npm publish --tolerate-republish`, so ask the
// registry directly and skip versions that are already there.
function isAlreadyPublished(name, version) {
  try {
    const stdout = execFileSync("npm", ["view", `${name}@${version}`, "version"], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "ignore"],
      env: process.env,
      encoding: "utf8"
    });

    return stdout.trim() === version;
  } catch {
    // `npm view` exits non-zero when the version (or the package) does not exist yet.
    return false;
  }
}

for (const packageDir of packageDirs) {
  const packagePath = path.join(repoRoot, packageDir);
  const manifestPath = path.join(packagePath, "package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

  if (manifest.private) {
    continue;
  }

  if (!manifest.name || !manifest.version) {
    throw new Error(`Missing name or version in ${manifestPath}`);
  }

  if (!dryRun && isAlreadyPublished(manifest.name, manifest.version)) {
    console.log(`Skipping ${manifest.name}@${manifest.version} (already published)`);
    continue;
  }

  if (!skipBuild) {
    console.log(`Building ${manifest.name}@${manifest.version}`);
    runPnpm(["run", "build"], packagePath);
  }

  console.log(`Publishing ${manifest.name}@${manifest.version}${dryRun ? " (dry run)" : ""}`);

  runPnpm(publishArgs, packagePath);
}
