import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// `vite build --mode win7` builds only the renderer here; the Electron main/preload
// are bundled separately as CommonJS by scripts/build-electron-win7.mjs (needed for
// Electron 22, the last version that runs on Windows 7). The default mode uses
// vite-plugin-electron, which emits ESM for the modern Electron 42 build.
export default defineConfig(({ mode }) => {
  const isWin7 = mode === 'win7'

  return {
    plugins: [
      react(),
      // Modern build only: emits ESM main/preload for Electron 42. Falsy plugins
      // are ignored by Vite, so this is skipped entirely in win7 mode.
      !isWin7 &&
        electron([
          {
            // Main process entry
            entry: 'electron/main.ts',
            vite: {
              define: {
                __PRELOAD__: JSON.stringify('preload.mjs'),
                __IS_CJS__: 'false',
              },
            },
          },
          {
            // Preload script — emit as .mjs so it is unambiguously ESM
            entry: 'electron/preload.ts',
            onstart(options) {
              options.reload()
            },
            vite: {
              build: {
                rollupOptions: {
                  output: {
                    format: 'es',
                    entryFileNames: 'preload.mjs',
                  },
                },
              },
            },
          },
        ]),
      renderer(),
    ],
    base: './',
  }
})
