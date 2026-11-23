// Resolve hook for running the repo's TypeScript modules with Node's built-in type stripping:
// maps the "@/" alias to src/ and adds the .ts/.tsx extension Next's bundler resolution leaves out.
// Register with: node --import ./scripts/content/register.mjs <script.ts>
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "src");
const isFile = (p) => existsSync(p) && statSync(p).isFile();

function candidate(base) {
  for (const p of [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")]) if (isFile(p)) return p;
  return null;
}

export async function resolve(specifier, context, next) {
  let base = null;
  if (specifier.startsWith("@/")) base = path.join(SRC, specifier.slice(2));
  else if (path.isAbsolute(specifier) && !path.extname(specifier)) base = specifier;
  else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    const parent = fileURLToPath(context.parentURL);
    if (!parent.includes(`${path.sep}node_modules${path.sep}`)) base = path.resolve(path.dirname(parent), specifier);
  }
  if (base) {
    const found = candidate(base);
    if (found) return next(pathToFileURL(found).href, context);
  }
  return next(specifier, context);
}
