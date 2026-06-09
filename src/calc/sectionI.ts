// Раздел I — Сили и средства за гасене на ТВЪРДИ ГОРИМИ ВЕЩЕСТВА.
// Методика, Приложение № 5, формули 1–22.

import { CalcOutput, Step, ceil, fmt } from './types'
import {
  freeTime,
  fireDevelopment,
  extinguishArea,
  FireShape,
  SHAPE_LABELS,
} from './helpers'

/** Тип ръчен струйник и съответен дебит q_стр, [l/s]. */
export type JetType = 'B' | 'C'
export const JET_FLOW: Record<JetType, number> = { B: 7, C: 3.5 }

/** Дебит на струйник за защита (струя "C"), [l/s]. */
const PROTECTION_JET_FLOW = 3.5
/** Производителност на един пожарен автомобил, [l/s]. */
const TRUCK_CAPACITY = 20

export interface SectionIInput {
  /** t_дс — време до съобщението за пожар, [min]. */
  t_ds: number
  /** t_дв — време за движение на първите сили, [min]. */
  t_dv: number
  /** t_р — време за разгръщане на първите линии, [min]. */
  t_r: number
  /** V_л — линейна скорост на разпространение, [m/min] (Табл. 1). */
  V: number
  /** a — ширина на помещението, [m]. */
  a: number
  /** b — дължина на помещението, [m]. */
  b: number
  /** I_н — интензивност на подаване на вода, [l/(s·m²)] (Табл. 2). */
  I: number
  /** Форма на гасене (площ на гасене F_г). */
  shape: FireShape
  /** Тип ръчен струйник за гасене. */
  jet: JetType
  /** h_г — дълбочина на гасене, [m] (5 ръчни, 10 лафетни). */
  hg: number
  /** Брой струйници за защита (струя "C"). */
  protectionJets: number
}

export interface SectionIResult {
  t_sv: number
  Fp: number
  R: number
  Fg: number
  /** Необходим разход на вода за гасене Q_н^г, [l/s]. */
  Qg: number
  /** Брой струйници за гасене N_стр^г. */
  N_jets: number
  /** Общ брой струйници N_стр^об. */
  N_jets_total: number
  /** Брой пожарни автомобили. */
  N_trucks: number
  /** Брой пожарникари (струяри). */
  N_firefighters: number
}

export function calcSectionI(inp: SectionIInput): CalcOutput<SectionIResult> {
  const steps: Step[] = []
  const warnings: string[] = []
  const { V, a, b, I, shape, jet, hg, protectionJets: z } = inp
  const aMin = Math.min(a, b)
  const aMax = Math.max(a, b)

  // --- 1. Свободно време за развитие (формула 1) ---
  const t_sv = freeTime(inp.t_ds, inp.t_dv, inp.t_r)
  steps.push({ kind: 'heading', text: '1. Свободно време за развитие на пожара' })
  steps.push({ kind: 'math', tex: 't_{св} = t_{дс} + t_{дв} + t_{р}' })
  steps.push({
    kind: 'math',
    tex: `t_{св} = ${inp.t_ds} + ${inp.t_dv} + ${inp.t_r} = ${t_sv}\\ \\text{(min)}`,
  })

  // --- 2. Площ на пожара F_п (формули 2–7) ---
  const dev = fireDevelopment(t_sv, V, a, b)
  steps.push({ kind: 'heading', text: '2. Определяне площта на пожара F_п' })
  steps.push({ kind: 'note', text: `V_л = ${V} (m/min) — по Табл. 1 от указанията.` })
  if (dev.mode === 'circle') {
    steps.push({ kind: 'note', text: 'Пожарът се развива кръгово.' })
    steps.push({ kind: 'math', tex: 'F_{п} = \\pi (0.5\\, V_{л}\\, t_{св})^{2}' })
    steps.push({
      kind: 'math',
      tex: `F_{п} = 3.14 \\cdot (0.5 \\cdot ${V} \\cdot ${t_sv})^{2} = ${fmt(dev.Fp)}\\ \\text{(m}^2)`,
    })
  } else {
    steps.push({ kind: 'note', text: 'Фронтът достига по-късата стена — правоъгълно развитие.' })
    steps.push({ kind: 'math', tex: 'F_{п} = n\\, a\\, V_{л}(0.5\\, t_{1} + t_{2}),\\ n = 2' })
    steps.push({
      kind: 'math',
      tex: `F_{п} = ${fmt(dev.Fp)}\\ \\text{(m}^2)`,
    })
    if (dev.cappedToRoom) {
      steps.push({
        kind: 'note',
        text: `Пожарът обхваща цялата площ на помещението: F_общ = a·b = ${aMin} · ${aMax} = ${fmt(a * b)} (m²).`,
      })
    }
  }
  steps.push({ kind: 'result', label: 'Площ на пожара F_п', tex: `${fmt(dev.Fp)}\\ \\text{m}^2` })
  if (dev.mode === 'circle') {
    steps.push({ kind: 'result', label: 'Радиус на пожара R_п', tex: `${fmt(dev.R)}\\ \\text{m}` })
  }

  // --- 3. Площ на гасене F_г (формули 8–13) ---
  const { Fg, tex: fgTex } = extinguishArea(shape, aMin, aMax, hg, dev.R, dev.Fp)
  steps.push({ kind: 'heading', text: '3. Определяне площта на гасене F_г' })
  steps.push({ kind: 'note', text: `Форма на гасене: ${SHAPE_LABELS[shape]}; h_г = ${hg} m.` })
  if (shape !== 'whole') {
    steps.push({ kind: 'math', tex: `${fgTex} = ${fmt(Fg)}\\ \\text{(m}^2)` })
  }
  steps.push({ kind: 'result', label: 'Площ на гасене F_г', tex: `${fmt(Fg)}\\ \\text{m}^2` })

  // --- 4. Необходим разход на вода Q_н^г (формули 14–16) ---
  steps.push({ kind: 'heading', text: '4. Необходим разход на вода за гасене Q_н^г' })
  steps.push({ kind: 'note', text: `I_н = ${I} (l/(s·m²)) — по Табл. 2 от указанията.` })
  let Qg: number
  if (dev.Fp <= Fg) {
    // формула 14: когато F_п ≤ F_г
    Qg = dev.Fp * I
    steps.push({ kind: 'note', text: 'F_п ≤ F_г → гаси се по цялата площ на пожара.' })
    steps.push({ kind: 'math', tex: 'Q_{н}^{г} = F_{п} \\cdot I_{н}' })
    steps.push({
      kind: 'math',
      tex: `Q_{н}^{г} = ${fmt(dev.Fp)} \\cdot ${I} = ${fmt(Qg)}\\ \\text{(l/s)}`,
    })
  } else {
    // формула 15: когато F_п > F_г
    Qg = Fg * I
    steps.push({ kind: 'note', text: 'F_п > F_г → гаси се по площта на гасене.' })
    steps.push({ kind: 'math', tex: 'Q_{н}^{г} = F_{г} \\cdot I_{н}' })
    steps.push({
      kind: 'math',
      tex: `Q_{н}^{г} = ${fmt(Fg)} \\cdot ${I} = ${fmt(Qg)}\\ \\text{(l/s)}`,
    })
  }
  steps.push({ kind: 'result', label: 'Разход за гасене Q_н^г', tex: `${fmt(Qg)}\\ \\text{l/s}` })

  // --- 5. Брой струйници за гасене N_стр (формули 17–19) ---
  const q = JET_FLOW[jet]
  const N_jets = ceil(Qg / q)
  steps.push({ kind: 'heading', text: '5. Брой струйници за гасене N_стр' })
  steps.push({ kind: 'note', text: `Избран струйник тип "${jet}", q_стр = ${q} (l/s).` })
  steps.push({ kind: 'math', tex: 'N_{стр}^{г} = \\dfrac{Q_{н}^{г}}{q_{стр}}' })
  steps.push({
    kind: 'math',
    tex: `N_{стр}^{г} = \\dfrac{${fmt(Qg)}}{${q}} = ${N_jets}\\ \\text{струйника тип "${jet}"}`,
  })

  // Струйници за защита (струя "C").
  const N_jets_total = N_jets + z
  let Qfact = N_jets * q
  if (z > 0) {
    Qfact += z * PROTECTION_JET_FLOW
    steps.push({
      kind: 'note',
      text: `Струйници за защита: N_стр^з = ${z} (струя "C", по ${PROTECTION_JET_FLOW} l/s).`,
    })
    steps.push({ kind: 'math', tex: 'N_{стр}^{об} = N_{стр}^{г} + N_{стр}^{з}' })
    steps.push({
      kind: 'math',
      tex: `N_{стр}^{об} = ${N_jets} + ${z} = ${N_jets_total}\\ \\text{струйника}`,
    })
  }

  // --- 6. Пожарни автомобили и пожарникари ---
  const N_trucks = ceil(Qfact / TRUCK_CAPACITY)
  const N_firefighters = N_jets * 2 + z * 1
  steps.push({ kind: 'heading', text: '6. Пожарни автомобили и личен състав' })
  steps.push({
    kind: 'note',
    text: `Фактически разход: Q = ${fmt(Qfact)} l/s (1 автомобил ≈ ${TRUCK_CAPACITY} l/s).`,
  })
  steps.push({
    kind: 'math',
    tex: `N_{авт} = \\left\\lceil \\dfrac{${fmt(Qfact)}}{${TRUCK_CAPACITY}} \\right\\rceil = ${N_trucks}`,
  })
  steps.push({
    kind: 'math',
    tex:
      z > 0
        ? `N_{пожарникари} = 2 \\cdot ${N_jets} + 1 \\cdot ${z} = ${N_firefighters}`
        : `N_{пожарникари} = 2 \\cdot ${N_jets} = ${N_firefighters}`,
  })

  steps.push({ kind: 'result', label: 'Брой струйници (общо)', tex: `${N_jets_total}` })
  steps.push({ kind: 'result', label: 'Брой пожарни автомобили', tex: `${N_trucks}` })
  steps.push({ kind: 'result', label: 'Брой пожарникари', tex: `${N_firefighters}` })

  // Валидни ли са геометрията/формата.
  if (Fg <= 0) {
    warnings.push(
      'Площта на гасене F_г е нула или отрицателна за избраната форма и размери — проверете a, b и h_г.',
    )
  }

  return {
    results: {
      t_sv,
      Fp: dev.Fp,
      R: dev.R,
      Fg,
      Qg,
      N_jets,
      N_jets_total,
      N_trucks,
      N_firefighters,
    },
    steps,
    warnings,
  }
}
