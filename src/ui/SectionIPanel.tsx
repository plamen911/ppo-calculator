import { useMemo, useState } from 'react'
import { calcSectionI, SectionIInput } from '../calc/sectionI'
import { TABLE1_Vl, TABLE2_In } from '../data/tables'
import { Field, SelectField } from './Field'
import { ShapeSelector } from './ShapeSelector'
import { WorkedSolution } from './WorkedSolution'

const initial: SectionIInput = {
  t_ds: 10,
  t_dv: 4,
  t_r: 3,
  V: 1,
  a: 10,
  b: 12,
  I: 0.1,
  shape: 'two_aa',
  jet: 'B',
  hg: 5,
  protectionJets: 0,
}

export function SectionIPanel() {
  const [inp, setInp] = useState<SectionIInput>(initial)
  const set = <K extends keyof SectionIInput>(k: K, v: SectionIInput[K]) =>
    setInp((p) => ({ ...p, [k]: v }))
  const output = useMemo(() => calcSectionI(inp), [inp])

  return (
    <div className="panel">
      <div className="inputs no-print">
        <h2>Изходни данни — твърди горими вещества</h2>

        <fieldset>
          <legend>Време</legend>
          <Field label="t_дс — време до съобщението" value={inp.t_ds} onChange={(v) => set('t_ds', v)} unit="min" step={1} min={0} />
          <Field label="t_дв — време за движение" value={inp.t_dv} onChange={(v) => set('t_dv', v)} unit="min" step={1} min={0} />
          <Field label="t_р — време за разгръщане" value={inp.t_r} onChange={(v) => set('t_r', v)} unit="min" step={1} min={0} />
        </fieldset>

        <fieldset>
          <legend>Помещение и пожар</legend>
          <Field label="a — ширина" value={inp.a} onChange={(v) => set('a', v)} unit="m" min={0} />
          <Field label="b — дължина" value={inp.b} onChange={(v) => set('b', v)} unit="m" min={0} />
          <Field
            label="V_л — линейна скорост"
            value={inp.V}
            onChange={(v) => set('V', v)}
            unit="m/min"
            min={0}
            table={TABLE1_Vl}
            tableLabel="Табл. 1 — Линейна скорост на разпространение V_л"
          />
          <Field
            label="I_н — интензивност вода"
            value={inp.I}
            onChange={(v) => set('I', v)}
            unit="l/(s·m²)"
            step={0.01}
            min={0}
            table={TABLE2_In}
            tableLabel="Табл. 2 — Интензивност на подаване на вода I_н"
          />
        </fieldset>

        <fieldset>
          <legend>Гасене</legend>
          <SelectField
            label="Тип ръчен струйник"
            value={inp.jet}
            onChange={(v) => set('jet', v)}
            options={[
              { value: 'B', label: 'Тип "B" — 7 l/s' },
              { value: 'C', label: 'Тип "C" — 3.5 l/s' },
            ]}
          />
          <SelectField
            label="h_г — дълбочина на гасене"
            value={String(inp.hg)}
            onChange={(v) => set('hg', Number(v))}
            options={[
              { value: '5', label: '5 m — ръчни струйници' },
              { value: '10', label: '10 m — лафетни струйници' },
            ]}
          />
          <Field
            label="Струйници за защита"
            value={inp.protectionJets}
            onChange={(v) => set('protectionJets', v)}
            step={1}
            min={0}
          />
        </fieldset>

        <fieldset>
          <legend>Форма на гасене</legend>
          <ShapeSelector value={inp.shape} onChange={(v) => set('shape', v)} />
        </fieldset>
      </div>

      <WorkedSolution output={output} title="Решение — Раздел I (твърди горими вещества)" />
    </div>
  )
}
