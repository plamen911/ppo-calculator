// Раздел III — Сили и средства за гасене с въздушно-механична пяна ПО ОБЕМ.
// Методика, формули 33–35.

import { CalcOutput, Step, ceil, fmt } from './types'

/** Коефициент на разрушаване на пяната K_р. */
const K_R = 3
/** Нормативно време за запълване с пяна, [min]. */
const T_N = 10
/** Минимална височина на слоя пяна над пожарното натоварване z, [m]. */
export const Z_DEFAULT = 0.3

export interface SectionIIIInput {
  /** a — ширина на помещението, [m]. */
  a: number
  /** l — дължина на помещението, [m]. */
  l: number
  /** h_пл — височина на пожарното натоварване, [m]. */
  h_load: number
  /** z — височина на слоя пяна над натоварването, [m] (мин. 0.3). */
  z: number
  /** q_ппв — производителност на един пеногенератор по пяна, [m³/min]. */
  q_foamGen: number
}

export interface SectionIIIResult {
  h_o: number
  V_p: number
  /** Необходим разход на пяна по обем Q_п^г, [m³/min]. */
  Q_foam: number
  N_foamGen: number
}

export function calcSectionIII(inp: SectionIIIInput): CalcOutput<SectionIIIResult> {
  const steps: Step[] = []
  const warnings: string[] = []

  // --- 1. Височина и обем за запълване (формула 34) ---
  const h_o = inp.h_load + inp.z
  const V_p = inp.a * inp.l * h_o
  steps.push({ kind: 'heading', text: '1. Обем за запълване с пяна V_п' })
  steps.push({ kind: 'note', text: `h_о = h_пл + z = ${inp.h_load} + ${inp.z} = ${fmt(h_o)} m (z ≥ ${Z_DEFAULT} m).` })
  steps.push({ kind: 'math', tex: 'V_{п} = a \\cdot l \\cdot h_{o}' })
  steps.push({
    kind: 'math',
    tex: `V_{п} = ${inp.a} \\cdot ${inp.l} \\cdot ${fmt(h_o)} = ${fmt(V_p)}\\ \\text{(m}^3)`,
  })

  // --- 2. Необходим разход на пяна по обем (формула 33) ---
  const Q_foam = (V_p * K_R) / T_N
  steps.push({ kind: 'heading', text: '2. Необходим разход на пяна по обем Q_п^г' })
  steps.push({ kind: 'note', text: `K_р = ${K_R}; t_н = ${T_N} min.` })
  steps.push({ kind: 'math', tex: 'Q_{п}^{г} = \\dfrac{V_{п} \\cdot K_{р}}{t_{н}}' })
  steps.push({
    kind: 'math',
    tex: `Q_{п}^{г} = \\dfrac{${fmt(V_p)} \\cdot ${K_R}}{${T_N}} = ${fmt(Q_foam)}\\ \\text{(m}^3/\\text{min)}`,
  })

  // --- 3. Брой пеногенератори (формула 35) ---
  const N_foamGen = ceil(Q_foam / inp.q_foamGen)
  steps.push({ kind: 'heading', text: '3. Брой пеногенератори N_ппв^г' })
  steps.push({ kind: 'note', text: `q_ппв = ${inp.q_foamGen} m³/min (производителност на ПГ по пяна).` })
  steps.push({
    kind: 'math',
    tex: `N_{ппв}^{г} = \\left\\lceil \\dfrac{Q_{п}^{г}}{q_{ппв}} \\right\\rceil = \\left\\lceil \\dfrac{${fmt(Q_foam)}}{${inp.q_foamGen}} \\right\\rceil = ${N_foamGen}`,
  })

  steps.push({ kind: 'result', label: 'Обем за запълване V_п', tex: `${fmt(V_p)}\\ \\text{m}^3` })
  steps.push({ kind: 'result', label: 'Разход на пяна Q_п^г', tex: `${fmt(Q_foam)}\\ \\text{m}^3/\\text{min}` })
  steps.push({ kind: 'result', label: 'Брой пеногенератори', tex: `${N_foamGen}` })

  if (inp.q_foamGen <= 0) warnings.push('Производителността q_ппв трябва да е положителна.')
  if (inp.z < Z_DEFAULT) warnings.push(`Височината z е под минималната ${Z_DEFAULT} m.`)

  return { results: { h_o, V_p, Q_foam, N_foamGen }, steps, warnings }
}
