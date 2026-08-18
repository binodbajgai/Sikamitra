import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const THEME_FILE = path.join(ROOT, "src", "styles", "theme.css");
const FILE_EXTENSIONS = new Set([".css", ".html", ".ts", ".tsx", ".js", ".jsx", ".svg"]);

const HASH = String.fromCharCode(35);
const RGB = ["r", "g", "b"].join("");

const COLOR_PATTERNS = [
  new RegExp(`${HASH}[0-9a-fA-F]{3,8}\\b`, "g"),
  new RegExp(`${RGB}a?\\(\\s*\\d+(?:\\.\\d+)?\\s*,\\s*\\d+(?:\\.\\d+)?\\s*,\\s*\\d+(?:\\.\\d+)?(?:\\s*,\\s*\\d*(?:\\.\\d+)?)?\\s*\\)`, "gi"),
];

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, results);
      continue;
    }

    if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }

  return results;
}

const violations = [];

for (const filePath of walk(ROOT)) {
  if (path.resolve(filePath) === path.resolve(THEME_FILE)) {
    continue;
  }

  const text = fs.readFileSync(filePath, "utf8");

  for (const pattern of COLOR_PATTERNS) {
    pattern.lastIndex = 0;

    for (const match of text.matchAll(pattern)) {
      const before = text.slice(0, match.index);
      const line = before.split(/\r?\n/).length;
      violations.push({
        filePath,
        line,
        value: match[0],
      });
    }
  }
}

if (violations.length > 0) {
  console.error("Hardcoded color literals found outside src/styles/theme.css:");

  for (const violation of violations) {
    const relativePath = path.relative(ROOT, violation.filePath);
    console.error(`${relativePath}:${violation.line}: ${violation.value}`);
  }

  process.exitCode = 1;
}
