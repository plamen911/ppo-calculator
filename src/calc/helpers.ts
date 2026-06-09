import { PI, fmt } from './types'

/**
 * Свободно време за развитие на пожара (формула 1):
 *   t_св = t_дс + t_дв + t_р
 */
export function freeTime(t_ds: number, t_dv: number, t_r: number): number {
  return t_ds + t_dv + t_r
}

/** Резултат от модела за свободно развитие на пожара. */
export interface FreeDevelopment {
  /** Площ на пожара F_п, [m²]. */
  Fp: number
  /** Радиус на пожара R_п, [m] (при кръгово развитие; при правоъгълно = a/2). */
  R: number
  /** Форма на развитие. */
  mode: 'circle' | 'rect'
  /** Достигната ли е цялата площ на помещението. */
  cappedToRoom: boolean
}

/**
 * Определяне на площта на пожара F_п (формули 2–7) и радиуса R_п.
 *
 * Модел: пожарът се развива кръгово със скорост V_л (Табл. 1). При t_св > 10 min
 * скоростта на нарастване на радиуса остава V_л, но за първите 10 min се отчита
 * с коефициент 0.5 (0.5·V_л·t₁). Когато фронтът достигне по-късата стена (a),
 * развитието става правоъгълно: F_п = n·a·V_л·(0.5·t₁ + t₂), n = 2.
 * Площта не може да надхвърли площта на помещението a·b.
 */
export function fireDevelopment(t_sv: number, V: number, a: number, b: number): FreeDevelopment {
  const aMin = Math.min(a, b)
  const half = aMin / 2
  const roomArea = a * b

  // Радиус при свободно кръгово развитие за времето t_св.
  const rFull = t_sv <= 10 ? 0.5 * V * t_sv : 0.5 * V * 10 + V * (t_sv - 10)

  if (rFull < half) {
    // Пожарът остава кръгов през цялото време.
    return { Fp: PI * rFull * rFull, R: rFull, mode: 'circle', cappedToRoom: false }
  }

  // Фронтът е достигнал по-късата стена → правоъгълно развитие.
  const rect = t_sv <= 10 ? 2 * aMin * (0.5 * V * t_sv) : 2 * aMin * V * (t_sv - 5)
  const Fp = Math.min(rect, roomArea)
  return { Fp, R: half, mode: 'rect', cappedToRoom: rect >= roomArea }
}

/** Видове форма за гасене (площ на гасене F_г). */
export type FireShape =
  | 'front_a' // едностранно по фронт a (по-къса страна)
  | 'front_b' // едностранно по фронт b (по-дълга страна)
  | 'two_aa' // двустранно по двата фронта a
  | 'two_bb' // двустранно по двата фронта b
  | 'two_ab' // двустранно Г-образно (a + b)
  | 'three_aab' // тристранно (2a + b)
  | 'three_abb' // тристранно (2b + a)
  | 'perimeter' // по периметъра на правоъгълник
  | 'circle' // по периметъра на кръг
  | 'whole' // по цялата площ

export const SHAPE_LABELS: Record<FireShape, string> = {
  front_a: 'Едностранно по фронт a',
  front_b: 'Едностранно по фронт b',
  two_aa: 'Двустранно (по двата фронта a)',
  two_bb: 'Двустранно (по двата фронта b)',
  two_ab: 'Двустранно Г-образно (a + b)',
  three_aab: 'Тристранно (2a + b)',
  three_abb: 'Тристранно (2b + a)',
  perimeter: 'По периметъра (правоъгълник)',
  circle: 'По периметъра на кръг',
  whole: 'По цялата площ',
}

/**
 * Площ на гасене F_г (формули 8–13) за избраната форма.
 * h — дълбочина на гасене h_г (5 m ръчни, 10 m лафетни струйници).
 * За форма "circle" се ползва радиусът R; за "whole" се връща площта на пожара Fp.
 */
export function extinguishArea(
  shape: FireShape,
  aMin: number,
  aMax: number,
  h: number,
  R: number,
  Fp: number,
): { Fg: number; tex: string } {
  switch (shape) {
    case 'front_a':
      return { Fg: aMin * h, tex: `F_{г} = a \\cdot h_{г} = ${aMin} \\cdot ${h}` }
    case 'front_b':
      return { Fg: aMax * h, tex: `F_{г} = b \\cdot h_{г} = ${aMax} \\cdot ${h}` }
    case 'two_aa':
      return { Fg: 2 * aMin * h, tex: `F_{г} = 2 a \\cdot h_{г} = 2 \\cdot ${aMin} \\cdot ${h}` }
    case 'two_bb':
      return { Fg: 2 * aMax * h, tex: `F_{г} = 2 b \\cdot h_{г} = 2 \\cdot ${aMax} \\cdot ${h}` }
    case 'two_ab':
      return {
        Fg: h * (aMin + aMax - h),
        tex: `F_{г} = h_{г}(a + b - h_{г}) = ${h}(${aMin} + ${aMax} - ${h})`,
      }
    case 'three_aab':
      return {
        Fg: h * (2 * aMin + aMax - 2 * h),
        tex: `F_{г} = h_{г}(2a + b - 2 h_{г}) = ${h}(2 \\cdot ${aMin} + ${aMax} - 2 \\cdot ${h})`,
      }
    case 'three_abb':
      return {
        Fg: h * (2 * aMax + aMin - 2 * h),
        tex: `F_{г} = h_{г}(2b + a - 2 h_{г}) = ${h}(2 \\cdot ${aMax} + ${aMin} - 2 \\cdot ${h})`,
      }
    case 'perimeter':
      return {
        Fg: 2 * h * (aMin + aMax - 2 * h),
        tex: `F_{г} = 2 h_{г}(a + b - 2 h_{г}) = 2 \\cdot ${h}(${aMin} + ${aMax} - 2 \\cdot ${h})`,
      }
    case 'circle':
      return {
        Fg: PI * h * (2 * R - h),
        tex: `F_{г} = \\pi h_{г}(2R - h_{г}) = 3.14 \\cdot ${h}(2 \\cdot ${fmt(R)} - ${h})`,
      }
    case 'whole':
      return { Fg: Fp, tex: `F_{г} = F_{п} = ${fmt(Fp)}` }
  }
}
