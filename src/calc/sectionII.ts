// Раздел II — Сили и средства за гасене на ЛЗТ и ГТ (леснозапалими и горими
// течности) с въздушно-механична пяна и охлаждане на вертикални цилиндрични
// резервоари. Методика, формули 24–32.

import { CalcOutput, Step, PI, ceil, fmt } from './types'

/** Интензивност за охлаждане на горящ резервоар по периметър, [l/(s·m)]. */
const I_COOL_BURN = 0.5
/** Интензивност при разлив (обхванат по целия периметър), [l/(s·m)]. */
const I_COOL_BURN_SPILL = 1.0
/** Интензивност за охлаждане на съседен резервоар, [l/(s·m)]. */
const I_COOL_NEIGHBOR = 0.2
/** Максимален разход на вода на един екип, [l/s]. */
const CREW_MAX_FLOW = 14
/** Нормативно време за гасене с пяна, [min]. */
const FOAM_TIME_MIN = 10
/** Коефициент на запаса на пенообразувател K_з. */
const K_Z = 3

export type JetType = 'B' | 'C'
const JET_FLOW: Record<JetType, number> = { B: 7, C: 3.5 }

export interface SectionIIInput {
  /** D_р^г — диаметър на горящия резервоар, [m]. */
  D_burn: number
  /** Обхванат ли е по целия периметър при разлив (→ I = 1.0 вместо 0.5). */
  spillSurround: boolean
  /** Брой съседни резервоари за охлаждане. */
  neighbors: number
  /** D_р^с — диаметър на съседен резервоар, [m]. */
  D_neighbor: number
  /** Тип воден струйник за охлаждане. */
  jet: JetType
  /** I_н^г — интензивност за ВМП (Табл. 4), [l/(s·m²)]. */
  I_foam: number
  /** q_ппв.л — разход по разтвор на един пеногенератор, [l/s]. */
  q_foamGen: number
}

export interface SectionIIResult {
  Q_cool_burn: number
  N_jets_burn: number
  Q_cool_neighbor: number
  N_jets_neighbor: number
  Q_cool_total: number
  N_crews_cool: number
  F_foam: number
  N_foamGen: number
  W_foam: number
}

export function calcSectionII(inp: SectionIIInput): CalcOutput<SectionIIResult> {
  const steps: Step[] = []
  const warnings: string[] = []
  const q = JET_FLOW[inp.jet]

  // --- 1. Разход на вода за охлаждане на горящия резервоар (формула 24) ---
  const I_burn = inp.spillSurround ? I_COOL_BURN_SPILL : I_COOL_BURN
  const Q_cool_burn = PI * inp.D_burn * I_burn
  steps.push({ kind: 'heading', text: '1. Разход на вода за охлаждане на горящия резервоар' })
  steps.push({
    kind: 'note',
    text: `I_н^охл.г = ${I_burn} l/(s·m)${inp.spillSurround ? ' (обхванат по целия периметър при разлив)' : ''}.`,
  })
  steps.push({ kind: 'math', tex: 'Q_{н}^{охл.г} = \\pi \\cdot D_{р}^{г} \\cdot I_{н}^{охл.г}' })
  steps.push({
    kind: 'math',
    tex: `Q_{н}^{охл.г} = 3.14 \\cdot ${inp.D_burn} \\cdot ${I_burn} = ${fmt(Q_cool_burn)}\\ \\text{(l/s)}`,
  })

  // --- 2. Струйници за охлаждане на горящия резервоар (формула 25) ---
  const N_jets_burn = ceil(Q_cool_burn / q)
  steps.push({ kind: 'heading', text: '2. Струйници за охлаждане на горящия резервоар' })
  steps.push({
    kind: 'math',
    tex: `N_{стр}^{охл.г} = \\dfrac{Q_{н}^{охл.г}}{q_{стр}} = \\dfrac{${fmt(Q_cool_burn)}}{${q}} = ${N_jets_burn}`,
  })

  // --- 3+4. Разход и струйници за съседните резервоари (формули 27, 28) ---
  const Q_cool_neighbor = 0.5 * inp.neighbors * PI * inp.D_neighbor * I_COOL_NEIGHBOR
  const N_jets_neighbor = ceil(Q_cool_neighbor / q)
  steps.push({ kind: 'heading', text: '3. Разход на вода за охлаждане на съседните резервоари' })
  steps.push({ kind: 'note', text: `Брой съседни резервоари: ${inp.neighbors}; I_н^охл.с = ${I_COOL_NEIGHBOR} l/(s·m).` })
  steps.push({ kind: 'math', tex: 'Q_{н}^{охл.с} = 0.5 \\cdot n \\cdot \\pi \\cdot D_{р}^{с} \\cdot I_{н}^{охл.с}' })
  steps.push({
    kind: 'math',
    tex: `Q_{н}^{охл.с} = 0.5 \\cdot ${inp.neighbors} \\cdot 3.14 \\cdot ${inp.D_neighbor} \\cdot ${I_COOL_NEIGHBOR} = ${fmt(Q_cool_neighbor)}\\ \\text{(l/s)}`,
  })
  steps.push({
    kind: 'math',
    tex: `N_{стр}^{охл.с} = \\dfrac{${fmt(Q_cool_neighbor)}}{${q}} = ${N_jets_neighbor}`,
  })

  // --- 5. Общ разход за охлаждане и брой екипи (формула 26/29) ---
  const Q_cool_total = Q_cool_burn + Q_cool_neighbor
  const N_crews_cool = ceil(Q_cool_total / CREW_MAX_FLOW)
  steps.push({ kind: 'heading', text: '4. Общ разход за охлаждане и брой екипи' })
  steps.push({
    kind: 'math',
    tex: `Q_{охл} = Q_{н}^{охл.г} + Q_{н}^{охл.с} = ${fmt(Q_cool_burn)} + ${fmt(Q_cool_neighbor)} = ${fmt(Q_cool_total)}\\ \\text{(l/s)}`,
  })
  steps.push({
    kind: 'note',
    text: `Един екип подава до ${CREW_MAX_FLOW} l/s.`,
  })
  steps.push({
    kind: 'math',
    tex: `N_{екипи} = \\left\\lceil \\dfrac{${fmt(Q_cool_total)}}{${CREW_MAX_FLOW}} \\right\\rceil = ${N_crews_cool}`,
  })

  // --- 6. Пеногенератори за гасене (формула 30) ---
  const F_foam = (PI * inp.D_burn * inp.D_burn) / 4
  const N_foamGen = ceil((F_foam * inp.I_foam) / inp.q_foamGen)
  steps.push({ kind: 'heading', text: '5. Пеногенератори за гасене (ВМП)' })
  steps.push({ kind: 'math', tex: 'F_{р}^{г} = \\dfrac{\\pi D^{2}}{4}' })
  steps.push({
    kind: 'math',
    tex: `F_{р}^{г} = \\dfrac{3.14 \\cdot ${inp.D_burn}^{2}}{4} = ${fmt(F_foam)}\\ \\text{(m}^2)`,
  })
  steps.push({ kind: 'note', text: `I_н^г = ${inp.I_foam} l/(s·m²) (Табл. 4); q_ппв.л = ${inp.q_foamGen} l/s.` })
  steps.push({
    kind: 'math',
    tex: `N_{ппв}^{г} = \\dfrac{F_{р}^{г} \\cdot I_{н}^{г}}{q_{ппв.л}} = \\dfrac{${fmt(F_foam)} \\cdot ${inp.I_foam}}{${inp.q_foamGen}} = ${N_foamGen}`,
  })

  // --- 7. Количество пенообразувател (формула 32) ---
  const W_foam = N_foamGen * inp.q_foamGen * FOAM_TIME_MIN * 60 * K_Z
  steps.push({ kind: 'heading', text: '6. Необходимо количество пенообразувател W_по' })
  steps.push({ kind: 'note', text: `t_н^г = ${FOAM_TIME_MIN} min; K_з = ${K_Z}.` })
  steps.push({ kind: 'math', tex: 'W_{по} = N_{ппв}^{г} \\cdot q_{ппв.л} \\cdot t_{н}^{г} \\cdot 60 \\cdot K_{з}' })
  steps.push({
    kind: 'math',
    tex: `W_{по} = ${N_foamGen} \\cdot ${inp.q_foamGen} \\cdot ${FOAM_TIME_MIN} \\cdot 60 \\cdot ${K_Z} = ${fmt(W_foam)}\\ \\text{(l)}`,
  })

  steps.push({ kind: 'result', label: 'Разход за охлаждане (общо)', tex: `${fmt(Q_cool_total)}\\ \\text{l/s}` })
  steps.push({ kind: 'result', label: 'Брой пеногенератори', tex: `${N_foamGen}` })
  steps.push({ kind: 'result', label: 'Пенообразувател W_по', tex: `${fmt(W_foam)}\\ \\text{l}` })

  if (inp.q_foamGen <= 0) warnings.push('Разходът на пеногенератор q_ппв.л трябва да е положителен.')

  return {
    results: {
      Q_cool_burn,
      N_jets_burn,
      Q_cool_neighbor,
      N_jets_neighbor,
      Q_cool_total,
      N_crews_cool,
      F_foam,
      N_foamGen,
      W_foam,
    },
    steps,
    warnings,
  }
}
