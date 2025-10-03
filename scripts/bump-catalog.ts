import { readFile, writeFile } from "node:fs/promises";

type Pkg = Record<string, any>;

function parseArgs(argv: string[]) {
  const out = new Map<string, string>();
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (!tok.startsWith("--")) continue;
    let [k, v] = tok.split("=", 2);
    k = k.replace(/^--/, "");
    if (v === undefined) {
      const next = argv[i + 1];
      v = next && !next.startsWith("--") ? (i++, next) : "true";
    }
    out.set(k, v);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const prefixMode = (args.get("prefix") as "caret" | "exact") ?? "exact";
const distTag = args.get("tag") ?? "latest";
const alsoUpdate = args.get("and-update") === "true";
const dryRun = args.get("dry-run") === "true";
const yes = args.get("yes") === "true";

async function run(cmd: string, ...argv: string[]) {
  const p = Bun.spawn([cmd, ...argv], { stdout: "inherit", stderr: "inherit" });
  const code = await p.exited;
  if (code !== 0) throw new Error(`Command failed: ${cmd} ${argv.join(" ")}`);
}

const encode = (name: string) => encodeURIComponent(name);

async function fetchVersion(name: string): Promise<string> {
  const res = await fetch(
    `https://registry.npmjs.org/${encode(name)}/${distTag}`
  );
  if (!res.ok)
    throw new Error(`Failed to fetch ${name}@${distTag}: ${res.status}`);
  const data = await res.json();
  if (!data?.version)
    throw new Error(`No version in ${name}@${distTag} response`);
  return data.version as string;
}

async function main() {
  const pkg: Pkg = JSON.parse(await readFile("package.json", "utf8"));

  const catPath = pkg.workspaces?.catalog
    ? ["workspaces", "catalog"]
    : pkg.catalog
      ? ["catalog"]
      : null;

  if (!catPath)
    throw new Error(
      "No catalog found (expected workspaces.catalog or catalog)."
    );

  let cursor: any = pkg;
  for (const key of catPath.slice(0, -1)) cursor = cursor[key];
  const field = catPath[catPath.length - 1];
  const catalog: Record<string, string> = cursor[field];

  const names = Object.keys(catalog);
  console.log(`Bumping ${names.length} catalog entries to '${distTag}'…`);

  const versions = await Promise.all(names.map(fetchVersion));
  names.forEach((name, i) => {
    const v = versions[i];
    catalog[name] = prefixMode === "caret" ? `^${v}` : v;
    console.log(`  ${name} -> ${catalog[name]}`);
  });

  if (!yes) {
    console.log(
      "About to update package.json. Re-run with --yes to confirm, or add --dry-run to preview only."
    );
    process.exit(0);
  }

  if (!dryRun) {
    await writeFile(
      "package.json",
      JSON.stringify(pkg, null, 2) + "\n",
      "utf8"
    );
    console.log("package.json updated!");
  }

  await writeFile("package.json", JSON.stringify(pkg, null, 2) + "\n", "utf8");
  console.log("package.json updated!");

  if (alsoUpdate) {
    await run("bun", "update", "--latest", "--recursive");
    await run("bun", "install");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
