// Post-build: prepend the `'use client'` directive to the bundled main entry. esbuild strips
// module-level directives during bundling, so the components (which use hooks/context) need it
// re-added here to work when imported directly into a React Server Component app (Next.js).
import { readFile, writeFile } from 'node:fs/promises';

const DIRECTIVE = "'use client';\n";
const targets = ['dist/index.js', 'dist/index.cjs'];

for (const file of targets) {
  const code = await readFile(file, 'utf8');
  if (code.startsWith("'use client'") || code.startsWith('"use client"')) continue;
  await writeFile(file, DIRECTIVE + code);
  console.log(`add-use-client: prepended directive to ${file}`);
}
