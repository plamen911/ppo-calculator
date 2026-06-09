import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

// Injected at build time: 'preload.mjs' (ESM) or 'preload.js' (CJS/Win7).
declare const __PRELOAD__: string
// Injected at build time: false for the ESM build, true for the CommonJS (Win7) build.
// The unused branch is dead-code-eliminated, so each format keeps only its native
// way of resolving the directory (`__dirname` is empty under ESM; `import.meta.url`
// is empty under CJS).
declare const __IS_CJS__: boolean

const baseDir = __IS_CJS__
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url))

// dist-electron/main.js -> app root is one level up
process.env.APP_ROOT = path.join(baseDir, '..')

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

let win: BrowserWindow | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'Калкулатор за план за пожарогасене',
    webPreferences: {
      preload: path.join(baseDir, __PRELOAD__),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  win.setMenuBarVisibility(false)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Export the current page to a PDF file chosen by the user.
ipcMain.handle('export-pdf', async (_event, suggestedName: string) => {
  if (!win) return { ok: false, error: 'no-window' }

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Запази като PDF',
    defaultPath: suggestedName || 'plan-za-gasene.pdf',
    filters: [{ name: 'PDF документ', extensions: ['pdf'] }],
  })
  if (canceled || !filePath) return { ok: false, error: 'canceled' }

  const data = await win.webContents.printToPDF({
    printBackground: true,
    pageSize: 'A4',
    margins: { marginType: 'default' },
  })
  fs.writeFileSync(filePath, data)
  return { ok: true, filePath }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
  win = null
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
