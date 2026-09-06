import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const INDEX_HTML = 'src/index.html';

const SUBSET_LIST = /[?&]icon_names=([a-z0-9_,]+)/;
const ICON_ATTRIBUTE = /(?:^|\s)(?:icon|activeIcon|iconName)\s*=\s*"([a-z0-9_]+)"/g;
const ICON_BINDING = /\[(?:icon|activeIcon|iconName|name)\]\s*=\s*"([^"]*)"/g;
const UI_ICON_TAG = /<ui-icon\b[^>]*>/g;
const NAME_ATTRIBUTE = /(?:^|\s)name\s*=\s*"([a-z0-9_]+)"/;
const STRING_LITERAL = /'([a-z0-9_]+)'/g;

const indexHtml = readFileSync(INDEX_HTML, 'utf8');
const subsetMatch = indexHtml.match(SUBSET_LIST);

if (!subsetMatch) {
  console.error(
    `\n    error ${INDEX_HTML}: the Material Symbols stylesheet carries no icon_names\n`,
  );
  process.exit(1);
}

const subset = new Set(subsetMatch[1].split(','));

const templates = [
  ...globSync('src/**/*.html').filter(file => file !== INDEX_HTML),
  ...globSync('projects/ui/src/lib/**/*.html'),
];

const used = new Map();

function remember(name, file) {
  if (!used.has(name)) {
    used.set(name, file);
  }
}

for (const file of templates) {
  const source = readFileSync(file, 'utf8');

  for (const [, name] of source.matchAll(ICON_ATTRIBUTE)) {
    remember(name, file);
  }

  for (const [, expression] of source.matchAll(ICON_BINDING)) {
    for (const [, name] of expression.matchAll(STRING_LITERAL)) {
      remember(name, file);
    }
  }

  for (const [tag] of source.matchAll(UI_ICON_TAG)) {
    const name = tag.match(NAME_ATTRIBUTE);
    if (name) {
      remember(name[1], file);
    }
  }
}

const missing = [...used].filter(([name]) => !subset.has(name));
const unused = [...subset].filter(name => !used.has(name));

if (unused.length > 0) {
  console.warn(`\n  ${unused.length} icon(s) subsetted but never used: ${unused.join(', ')}`);
}

if (missing.length > 0) {
  console.error(`\n  ${missing.length} icon(s) missing from the Material Symbols subset:\n`);
  for (const [name, file] of missing) {
    console.error(`    error ${file}: '${name}' is not in icon_names of ${INDEX_HTML}`);
  }
  console.error('');
  process.exit(1);
}

console.log(
  `✔ all ${used.size} icon(s) are covered by the subset (${templates.length} templates checked)`,
);
