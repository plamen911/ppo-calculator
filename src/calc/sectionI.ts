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

/** Дебит на струйник за защита (струйник "C"), [l/s]. */
const PROTECTION_JET_FLOW = 3.5
/** Струйници, които подава един екип (пълен състав): 4 тип "C" или 2 тип "B". */
const TEAM_JETS: Record<JetType, number> = { B: 2, C: 4 }
/** Коефициент на използване на помпата (формула 23). */
const PUMP_FACTOR = 0.8

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
  /** Брой струйници за защита (струйник "C"). */
  protectionJets: number
  /** Q_па — дебит на помпата на един пожарен автомобил, [l/s]. */
  Qpa: number
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
  /** Брой екипи за гасене N_екип^г. */
  N_teams_g: number
  /** Общ брой екипи N_екип = N_екип^г + N_екип^з. */
  N_teams: number
  /** Личен състав = 4 · N_екип. */
  N_personnel: number
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

  // Струйници за защита (струйник "C").
  const N_jets_total = N_jets + z
  if (z > 0) {
    steps.push({
      kind: 'note',
      text: `Струйници за защита: N_стр^з = ${z} (струйник "C", по ${PROTECTION_JET_FLOW} l/s).`,
    })
    steps.push({ kind: 'math', tex: 'N_{стр}^{об} = N_{стр}^{г} + N_{стр}^{з}' })
    steps.push({
      kind: 'math',
      tex: `N_{стр}^{об} = ${N_jets} + ${z} = ${N_jets_total}\\ \\text{струйника}`,
    })
  }

  // --- 6. Брой екипи за гасене N_екип (формули 21, 22) ---
  const n_team = TEAM_JETS[jet]
  const N_teams_g = ceil(N_jets / n_team)
  const N_teams_z = z > 0 ? ceil(z / TEAM_JETS.C) : 0 // струйниците за защита са тип "C"
  const N_teams = N_teams_g + N_teams_z
  const N_personnel = N_teams * 4
  steps.push({ kind: 'heading', text: '6. Брой екипи за гасене N_екип' })
  steps.push({
    kind: 'note',
    text: `Един екип (пълен състав, 4 пожарникари) подава n_стр,екип = ${n_team} струйника тип "${jet}" (4 тип "C" или 2 тип "B").`,
  })
  steps.push({ kind: 'math', tex: 'N_{екип}^{г} = \\dfrac{N_{стр}^{г}}{n_{стр,екип}}' })
  steps.push({
    kind: 'math',
    tex: `N_{екип}^{г} = \\dfrac{${N_jets}}{${n_team}} = ${N_teams_g}\\ \\text{екип(а)}`,
  })
  if (z > 0) {
    steps.push({
      kind: 'math',
      tex: `N_{екип}^{з} = \\left\\lceil \\dfrac{${z}}{${TEAM_JETS.C}} \\right\\rceil = ${N_teams_z}`,
    })
    steps.push({ kind: 'math', tex: 'N_{екип} = N_{екип}^{г} + N_{екип}^{з}' })
    steps.push({
      kind: 'math',
      tex: `N_{екип} = ${N_teams_g} + ${N_teams_z} = ${N_teams}\\ \\text{екип(а)}`,
    })
  }
  steps.push({
    kind: 'math',
    tex: `\\text{Личен състав} = 4 \\cdot ${N_teams} = ${N_personnel}\\ \\text{пожарникари}`,
  })

  // --- 7. Брой пожарни автомобили N_па (формула 23) ---
  let N_trucks = 0
  steps.push({ kind: 'heading', text: '7. Брой пожарни автомобили N_па' })
  if (inp.Qpa > 0) {
    N_trucks = ceil(Qg / (PUMP_FACTOR * inp.Qpa))
    steps.push({
      kind: 'note',
      text: `Q_па = ${fmt(inp.Qpa)} l/s — дебит на помпата; използваемост ${PUMP_FACTOR} (0.8·Q_па).`,
    })
    steps.push({ kind: 'math', tex: 'N_{па}^{г} = \\dfrac{Q_{н}^{г}}{0.8\\, Q_{па}}' })
    steps.push({
      kind: 'math',
      tex: `N_{па}^{г} = \\left\\lceil \\dfrac{${fmt(Qg)}}{0.8 \\cdot ${fmt(inp.Qpa)}} \\right\\rceil = ${N_trucks}`,
    })
  } else {
    warnings.push('Q_па трябва да е положителен — въведете дебит на помпата, за да се изчисли броят автомобили.')
  }

  steps.push({ kind: 'result', label: 'Брой струйници (общо)', tex: `${N_jets_total}` })
  steps.push({ kind: 'result', label: 'Брой екипи', tex: `${N_teams}` })
  steps.push({ kind: 'result', label: 'Личен състав', tex: `${N_personnel}` })
  steps.push({ kind: 'result', label: 'Брой пожарни автомобили', tex: `${N_trucks}` })

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
      N_teams_g,
      N_teams,
      N_personnel,
    },
    steps,
    warnings,
  }
}