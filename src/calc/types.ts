// Общи типове за изчислителното ядро (методика по Приложение № 5).
// Ядрото е чисто (без DOM) и напълно тестваемо.

/** Една стъпка от подробното решение, рендира се в панела с решението. */
export type Step =
  | { kind: 'heading'; text: string }
  | { kind: 'note'; text: string }
  /** Ред с формула в KaTeX синтаксис (без числа). */
  | { kind: 'math'; tex: string }
  /** Открояван краен резултат: етикет + KaTeX израз. */
  | { kind: 'result'; label: string; tex: string }

/** Резултат от изчисление: краен набор стойности + подробни стъпки + предупреждения. */
export interface CalcOutput<R> {
  results: R
  steps: Step[]
  warnings: string[]
}

/** π според методиката (използва се 3.14, както в указанията). */
export const PI = 3.14

/** Закръгляне нагоре до цяло (брой струйници/коли/хора). */
export const ceil = (x: number) => Math.ceil(x)

/** Закръгляне до зададен брой знаци за показване. */
export const round = (x: number, digits = 0): number => {
  const f = Math.pow(10, digits)
  return Math.round(x * f) / f
}

/** Форматира число за показване (маха излишни нули). */
export const fmt = (x: number, digits = 2): string => {
  const r = round(x, digits)
  return Number.isFinite(r) ? String(r) : '—'
}
