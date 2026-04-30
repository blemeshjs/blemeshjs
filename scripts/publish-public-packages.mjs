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
const publishArgs = ["npm", "publish", "--access", "public", "--tolerate-republish"];

if (dryRun) {
  publishArgs.push("--dry-run");
}

if (process.env.CI === "true") {
  publishArgs.push("--provenance");
}

function runYarn(args, cwd) {
  execFileSync("yarn", args, {
    cwd,
    stdio: "inherit",
    env: process.env
  });
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

  if (!skipBuild) {
    console.log(`Building ${manifest.name}@${manifest.version}`);
    runYarn(["build"], packagePath);
  }

  console.log(`Publishing ${manifest.name}@${manifest.version}${dryRun ? " (dry run)" : ""}`);

  runYarn(publishArgs, packagePath);
}