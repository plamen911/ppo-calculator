import { ReactNode, useState } from 'react'
import { TableRow } from '../data/tables'
import { TableModal } from './TableModal'

interface FieldProps {
  label: ReactNode
  value: number
  onChange: (v: number) => void
  unit?: string
  step?: number
  min?: number
  /** Опционален списък със справочни стойности (показва се в модален прозорец). */
  table?: TableRow[]
  /** Заглавие на справочния прозорец. */
  tableLabel?: string
}

export function Field({ label, value, onChange, unit, step = 0.1, min, table, tableLabel }: FieldProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {table && (
          <button
            type="button"
            className="info-btn"
            onClick={() => setOpen(true)}
            title="Справочни стойности"
            aria-label="Справочни стойности"
          >
            ⓘ
          </button>
        )}
      </label>
      <div className="field-control">
        <input
          type="number"
          value={Number.isFinite(value) ? value : ''}
          step={step}
          min={min}
          onChange={(e) => {
            const n = parseFloat(e.target.value)
            onChange(Number.isFinite(n) ? n : 0)
          }}
        />
        {unit && <span className="field-unit">{unit}</span>}
      </div>
      {table && open && (
        <TableModal
          title={tableLabel ?? 'Справочни стойности'}
          rows={table}
          unit={unit}
          onPick={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: ReactNode
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <select className="field-control" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function CheckField({
  label,
  checked,
  onChange,
}: {
  label: ReactNode
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="field check-field">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}
