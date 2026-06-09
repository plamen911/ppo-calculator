import { useMemo } from 'react'
import katex from 'katex'

export function Katex({ tex, display = false }: { tex: string; display?: boolean }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        output: 'html',
      })
    } catch {
      return tex
    }
  }, [tex, display])
  return <span className="katex-host" dangerouslySetInnerHTML={{ __html: html }} />
}
