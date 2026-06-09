import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('ppo', {
  exportPdf: (suggestedName: string): Promise<{ ok: boolean; filePath?: string; error?: string }> =>
    ipcRenderer.invoke('export-pdf', suggestedName),
  isElectron: true,
})
