// Bundles the Electron main + preload as CommonJS for the Windows 7 build
// (Electron 22 / Node 16). esbuild shims `import.meta.url` for the cjs output,
// so electron/main.ts works unchanged. Run after `vite build --mode win7`.
import { build } from 'esbuild'

const common = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node16', // Electron 22 ships Node 16
  external: ['electron'],
  outdir: 'dist-electron',
  // Fold the `__IS_CJS__ ? ... : ...` constant so the dead `import.meta.url`
  // branch (empty under CJS) is removed.
  minifySyntax: true,
  // The dead ESM branch references import.meta; it is folded away above, so the
  // parse-time warning is noise.
  logOverride: { 'empty-import-meta': 'silent' },
  logLevel: 'info',
}

await build({
  ...common,
  entryPoints: ['electron/main.ts'],
  define: { __PRELOAD__: JSON.stringify('preload.js'), __IS_CJS__: 'true' },
})

await build({
  ...common,
  entryPoints: ['electron/preload.ts'],
  define: { __IS_CJS__: 'true' },
})
