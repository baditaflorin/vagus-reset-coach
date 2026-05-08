import { readdirSync, rmSync } from 'node:fs'

for (const path of [
  'docs/assets',
  'docs/index.html',
  'docs/404.html',
  'docs/registerSW.js',
  'docs/sw.js',
  'docs/sw.js.map',
]) {
  rmSync(path, { force: true, recursive: true })
}

for (const file of readdirSync('docs', { withFileTypes: true })) {
  if (file.isFile() && /^workbox-.*\.js(\.map)?$/.test(file.name)) {
    rmSync(`docs/${file.name}`, { force: true })
  }
}
