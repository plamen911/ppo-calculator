/// <reference types="vite/client" />

interface PpoApi {
  exportPdf: (suggestedName: string) => Promise<{ ok: boolean; filePath?: string; error?: string }>
  isElectron: boolean
}

interface Window {
  ppo?: PpoApi
}
