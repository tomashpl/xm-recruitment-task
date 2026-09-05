import { readFileSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { globSync } from 'node:fs';

const LIBRARY_ROOT = 'projects/ui';
const APPLICATION_ROOT = 'src';

const STYLE_AT_RULE = /@(?:use|forward|import)\s+['"]([^'"]+)['"]/g;
const ANGULAR_URL = /(?:styleUrls?|templateUrl)\s*:\s*\[?\s*['"]([^'"]+)['"]/g;

function scan(files, extract) {
  const found = [];
  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    for (const [, specifier] of source.matchAll(extract)) {
      found.push({ file, specifier });
    }
  }
  return found;
}

function resolvesInside(file, specifier, root) {
  if (!specifier.startsWith('.')) {
    return true;
  }
  const target = resolve(dirname(file), specifier);
  return !relative(resolve(root), target).startsWith('..');
}

const violations = [];

const libraryStyles = globSync(`${LIBRARY_ROOT}/**/*.scss`);
for (const { file, specifier } of scan(libraryStyles, STYLE_AT_RULE)) {
  if (!resolvesInside(file, specifier, LIBRARY_ROOT)) {
    violations.push(`${file}: stylesheet reaches outside the library — '${specifier}'`);
  }
}

const libraryComponents = globSync(`${LIBRARY_ROOT}/**/*.ts`);
for (const { file, specifier } of scan(libraryComponents, ANGULAR_URL)) {
  if (!resolvesInside(file, specifier, LIBRARY_ROOT)) {
    violations.push(`${file}: template or style url reaches outside the library — '${specifier}'`);
  }
}

const applicationStyles = globSync(`${APPLICATION_ROOT}/**/*.scss`);
for (const { file, specifier } of scan(applicationStyles, STYLE_AT_RULE)) {
  if (specifier.includes(LIBRARY_ROOT)) {
    violations.push(`${file}: reaches into the library by file path — '${specifier}'. Use the includePaths alias instead.`);
  }
}

if (violations.length > 0) {
  console.error(`\n  ${violations.length} style boundary violation(s):\n`);
  for (const violation of violations) {
    console.error(`    error ${violation}`);
  }
  console.error('');
  process.exit(1);
}

console.log(`✔ no style boundary violations found (${libraryStyles.length + libraryComponents.length + applicationStyles.length} files checked)`);
