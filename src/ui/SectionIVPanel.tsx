import { useMemo, useState } from 'react'
import { calcSectionIV, SectionIVInput, T_N_POWDER } from '../calc/sectionIV'
import { Field, SelectField } from './Field'
import { WorkedSolution } from './WorkedSolution'

const initial: SectionIVInput = {
  Fp: 50,
  I: 0.3,
  jet: 'hand',
  t_n: T_N_POWDER,
  W_perTruck: 1000,
}

export function SectionIVPanel() {
  const [inp, setInp] = useState<SectionIVInput>(initial)
  const set = <K extends keyof SectionIVInput>(k: K, v: SectionIVInput[K]) =>
    setInp((p) => ({ ...p, [k]: v }))
  const output = useMemo(() => calcSectionIV(inp), [inp])

  return (
    <div className="panel">
      <div className="inputs no-print">
        <h2>Изходни данни — прахово гасене</h2>

        <fieldset>
          <legend>Пожар</legend>
          <Field label="F_п — площ на пожара" value={inp.Fp} onChange={(v) => set('Fp', v)} unit="m²" min={0} />
          <Field label="I_н — интензивност за прах" value={inp.I} onChange={(v) => set('I', v)} unit="kg/(s·m²)" step={0.01} min={0} />
          <Field label="t_н^г — нормативно време" value={inp.t_n} onChange={(v) => set('t_n', v)} unit="s" step={1} min={0} />
        </fieldset>

        <fieldset>
          <legend>Средства</legend>
          <SelectField
            label="Тип прахов струйник"
            value={inp.jet}
            onChange={(v) => set('jet', v)}
            options={[
              { value: 'hand', label: 'Ръчни — 5 kg/s' },
              { value: 'lafette', label: 'Лафетни — 40 kg/s' },
            ]}
          />
          <Field label="W_прах — прах на автомобил" value={inp.W_perTruck} onChange={(v) => set('W_perTruck', v)} unit="kg" step={10} min={0} />
        </fieldset>
      </div>

      <WorkedSolution output={output} title="Решение — Раздел IV (прахово гасене)" />
    </div>
  )
}
