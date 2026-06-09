import { useMemo, useState } from 'react'
import { calcSectionII, SectionIIInput } from '../calc/sectionII'
import { TABLE4_foamIntensity } from '../data/tables'
import { Field, SelectField, CheckField } from './Field'
import { WorkedSolution } from './WorkedSolution'

const initial: SectionIIInput = {
  D_burn: 10,
  spillSurround: false,
  neighbors: 2,
  D_neighbor: 10,
  jet: 'B',
  I_foam: 0.08,
  q_foamGen: 6,
}

export function SectionIIPanel() {
  const [inp, setInp] = useState<SectionIIInput>(initial)
  const set = <K extends keyof SectionIIInput>(k: K, v: SectionIIInput[K]) =>
    setInp((p) => ({ ...p, [k]: v }))
  const output = useMemo(() => calcSectionII(inp), [inp])

  return (
    <div className="panel">
      <div className="inputs no-print">
        <h2>Изходни данни — ЛЗТ и ГТ (резервоари + пяна)</h2>

        <fieldset>
          <legend>Резервоари</legend>
          <Field label="D_р^г — диаметър на горящия резервоар" value={inp.D_burn} onChange={(v) => set('D_burn', v)} unit="m" min={0} />
          <Field label="Брой съседни резервоари" value={inp.neighbors} onChange={(v) => set('neighbors', v)} step={1} min={0} />
          <Field label="D_р^с — диаметър на съседен резервоар" value={inp.D_neighbor} onChange={(v) => set('D_neighbor', v)} unit="m" min={0} />
          <CheckField
            label="Разлив, обхванат по целия периметър (I = 1.0 вместо 0.5)"
            checked={inp.spillSurround}
            onChange={(v) => set('spillSurround', v)}
          />
        </fieldset>

        <fieldset>
          <legend>Охлаждане и пяна</legend>
          <SelectField
            label="Тип воден струйник"
            value={inp.jet}
            onChange={(v) => set('jet', v)}
            options={[
              { value: 'B', label: 'Тип "B" — 7 l/s' },
              { value: 'C', label: 'Тип "C" — 3.5 l/s' },
            ]}
          />
          <Field
            label="I_н^г — интензивност за ВМП"
            value={inp.I_foam}
            onChange={(v) => set('I_foam', v)}
            unit="l/(s·m²)"
            step={0.01}
            min={0}
            table={TABLE4_foamIntensity.map((r) => ({ label: r.label, value: r.intensity }))}
            tableLabel="Табл. 4 — Интензивност на подаване на разтвор за ВМП"
          />
          <Field label="q_ппв.л — разход на пеногенератор" value={inp.q_foamGen} onChange={(v) => set('q_foamGen', v)} unit="l/s" min={0} />
        </fieldset>
      </div>

      <WorkedSolution output={output} title="Решение — Раздел II (резервоари + ВМП)" />
    </div>
  )
}
