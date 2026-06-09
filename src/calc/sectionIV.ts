// Раздел IV — Сили и средства за гасене с огнегасителни ПРАХОВИ състави.
// Методика, формули 36–40.

import { CalcOutput, Step, ceil, fmt } from './types'

/** Разход на прах на струйник, [kg/s]. */
export type PowderJetType = 'hand' | 'lafette'
export const POWDER_JET_FLOW: Record<PowderJetType, number> = { hand: 5, lafette: 40 }

/** Нормативно време за гасене (открити технологични инсталации), [s]. */
export const T_N_POWDER = 30

export interface SectionIVInput {
  /** F_п — площ на пожара, [m²]. */
  Fp: number
  /** I_н — интензивност за гасене с прах, [kg/(s·m²)]. */
  I: number
  /** Тип прахов струйник. */
  jet: PowderJetType
  /** t_н^г — нормативно време за гасене, [s]. */
  t_n: number
  /** W_прах — количество прах на един автомобил, [kg]. */
  W_perTruck: number
}

export interface SectionIVResult {
  /** Необходим разход на прах Q_н^г, [kg/s]. */
  Qg: number
  N_jets: number
  /** Необходимо количество прах W_п, [kg]. */
  W_powder: number
  N_trucks: number
}

export function calcSectionIV(inp: SectionIVInput): CalcOutput<SectionIVResult> {
  const steps: Step[] = []
  const warnings: string[] = []
  const q = POWDER_JET_FLOW[inp.jet]

  // --- 1. Необходим разход на прах (формула 36) ---
  const Qg = inp.Fp * inp.I
  steps.push({ kind: 'heading', text: '1. Необходим разход на прах Q_н^г' })
  steps.push({ kind: 'note', text: `F_п = ${fmt(inp.Fp)} m²; I_н = ${inp.I} kg/(s·m²).` })
  steps.push({ kind: 'math', tex: 'Q_{н}^{г} = F_{п} \\cdot I_{н}' })
  steps.push({
    kind: 'math',
    tex: `Q_{н}^{г} = ${fmt(inp.Fp)} \\cdot ${inp.I} = ${fmt(Qg)}\\ \\text{(kg/s)}`,
  })

  // --- 2. Брой прахови струйници (формула 37) ---
  const N_jets = ceil(Qg / q)
  steps.push({ kind: 'heading', text: '2. Брой прахови струйници N_стр^г' })
  steps.push({
    kind: 'note',
    text: `q_стр = ${q} kg/s (${inp.jet === 'hand' ? 'ръчни' : 'лафетни'} струйници).`,
  })
  steps.push({
    kind: 'math',
    tex: `N_{стр}^{г} = \\left\\lceil \\dfrac{Q_{н}^{г}}{q_{стр}} \\right\\rceil = \\left\\lceil \\dfrac{${fmt(Qg)}}{${q}} \\right\\rceil = ${N_jets}`,
  })

  // --- 3. Необходимо количество прах (формула 39) ---
  const W_powder = inp.Fp * inp.I * inp.t_n
  steps.push({ kind: 'heading', text: '3. Необходимо количество прах W_п' })
  steps.push({ kind: 'note', text: `t_н^г = ${inp.t_n} s.` })
  steps.push({ kind: 'math', tex: 'W_{п} = F_{п} \\cdot I_{н} \\cdot t_{н}^{г}' })
  steps.push({
    kind: 'math',
    tex: `W_{п} = ${fmt(inp.Fp)} \\cdot ${inp.I} \\cdot ${inp.t_n} = ${fmt(W_powder)}\\ \\text{(kg)}`,
  })

  // --- 4. Брой автомобили при прахово гасене (формула 40) ---
  const N_trucks = ceil(W_powder / inp.W_perTruck)
  steps.push({ kind: 'heading', text: '4. Брой автомобили при прахово гасене N_па' })
  steps.push({ kind: 'note', text: `W_прах = ${fmt(inp.W_perTruck)} kg на автомобил.` })
  steps.push({
    kind: 'math',
    tex: `N_{па} = \\left\\lceil \\dfrac{W_{п}}{W_{прах}} \\right\\rceil = \\left\\lceil \\dfrac{${fmt(W_powder)}}{${fmt(inp.W_perTruck)}} \\right\\rceil = ${N_trucks}`,
  })

  steps.push({ kind: 'result', label: 'Разход на прах Q_н^г', tex: `${fmt(Qg)}\\ \\text{kg/s}` })
  steps.push({ kind: 'result', label: 'Количество прах W_п', tex: `${fmt(W_powder)}\\ \\text{kg}` })
  steps.push({ kind: 'result', label: 'Брой прахови автомобили', tex: `${N_trucks}` })

  if (inp.W_perTruck <= 0) warnings.push('Количеството прах на автомобил трябва да е положително.')

  return { results: { Qg, N_jets, W_powder, N_trucks }, steps, warnings }
}
