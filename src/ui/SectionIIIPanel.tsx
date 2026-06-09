import { useMemo, useState } from 'react'
import { calcSectionIII, SectionIIIInput, Z_DEFAULT } from '../calc/sectionIII'
import { Field } from './Field'
import { WorkedSolution } from './WorkedSolution'

const initial: SectionIIIInput = {
  a: 10,
  l: 20,
  h_load: 3,
  z: Z_DEFAULT,
  q_foamGen: 12,
}

export function SectionIIIPanel() {
  const [inp, setInp] = useState<SectionIIIInput>(initial)
  const set = <K extends keyof SectionIIIInput>(k: K, v: SectionIIIInput[K]) =>
    setInp((p) => ({ ...p, [k]: v }))
  const output = useMemo(() => calcSectionIII(inp), [inp])

  return (
    <div className="panel">
      <div className="inputs no-print">
        <h2>Изходни данни — пяна по обем</h2>

        <fieldset>
          <legend>Помещение</legend>
          <Field label="a — ширина" value={inp.a} onChange={(v) => set('a', v)} unit="m" min={0} />
          <Field label="l — дължина" value={inp.l} onChange={(v) => set('l', v)} unit="m" min={0} />
          <Field label="h_пл — височина на натоварването" value={inp.h_load} onChange={(v) => set('h_load', v)} unit="m" min={0} />
          <Field label="z — слой пяна над натоварването" value={inp.z} onChange={(v) => set('z', v)} unit="m" step={0.1} min={0} />
        </fieldset>

        <fieldset>
          <legend>Пеногенератори</legend>
          <Field label="q_ппв — производителност по пяна" value={inp.q_foamGen} onChange={(v) => set('q_foamGen', v)} unit="m³/min" min={0} />
        </fieldset>
      </div>

      <WorkedSolution output={output} title="Решение — Раздел III (пяна по обем)" />
    </div>
  )
}
