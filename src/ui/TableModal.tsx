import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { TableRow } from '../data/tables'

interface Props {
  title: string
  rows: TableRow[]
  unit?: string
  onPick: (value: number) => void
  onClose: () => void
}

export function TableModal({ title, rows, unit, onPick, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Затвори">
            ✕
          </button>
        </div>
        <p className="modal-hint">Изберете ред, за да попълните стойността; може и да въведете ръчно.</p>
        <div className="modal-body">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Обект / материал</th>
                <th className="num">Стойност{unit ? `, ${unit}` : ''}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  className="ref-row"
                  onClick={() => {
                    onPick(r.value)
                    onClose()
                  }}
                >
                  <td>{r.label}</td>
                  <td className="num">
                    <span className="ref-value">{r.value}</span>
                    {r.note && <span className="ref-note"> ({r.note})</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  )
}
