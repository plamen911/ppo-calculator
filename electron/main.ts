import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// dist-electron/main.js -> app root is one level up
process.env.APP_ROOT = path.join(__dirname, '..')

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
      preload: path.join(__dirname, 'preload.mjs'),
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
