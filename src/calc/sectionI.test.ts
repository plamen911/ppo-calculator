import { describe, it, expect } from 'vitest'
import { calcSectionI, SectionIInput } from './sectionI'
import { fireDevelopment, freeTime } from './helpers'
import { PI } from './types'

const base: SectionIInput = {
  t_ds: 10,
  t_dv: 4,
  t_r: 3,
  V: 1,
  a: 10,
  b: 12,
  I: 0.1,
  shape: 'whole',
  jet: 'B',
  hg: 5,
  protectionJets: 0,
}

describe('freeTime (формула 1)', () => {
  it('сумира трите времена', () => {
    expect(freeTime(10, 4, 3)).toBe(17)
  })
})

describe('fireDevelopment (площ на пожара F_п)', () => {
  it('кръгово развитие, когато радиусът не достига стената', () => {
    // V=0.2, t=10 → R=1 m < a/2=5 → кръг, F=π·1²
    const d = fireDevelopment(10, 0.2, 10, 12)
    expect(d.mode).toBe('circle')
    expect(d.R).toBeCloseTo(1, 6)
    expect(d.Fp).toBeCloseTo(PI * 1 * 1, 6)
  })

  it('правоъгълно развитие, когато фронтът достигне по-късата стена', () => {
    // V=1, t=17: R_full = 5 + 1·7 = 12 > a/2=5 → правоъгълно
    // F_rect = 2·aMin·V·(t-5) = 2·10·1·12 = 240, ограничено до a·b=120
    const d = fireDevelopment(17, 1, 10, 12)
    expect(d.mode).toBe('rect')
    expect(d.R).toBe(5)
    expect(d.Fp).toBe(120) // капнато до площта на помещението
    expect(d.cappedToRoom).toBe(true)
  })

  it('правоъгълно, но под площта на помещението', () => {
    // a=10,b=200, V=1, t=12: R_full = 5+1·2=7>5 → rect
    // F_rect = 2·10·1·(12-5)=140 < 2000
    const d = fireDevelopment(12, 1, 10, 200)
    expect(d.mode).toBe('rect')
    expect(d.Fp).toBe(140)
    expect(d.cappedToRoom).toBe(false)
  })

  it('кръгово при t ≤ 10 min', () => {
    // V=0.5, t=8 → R=0.5·0.5·8=2 < 5 → кръг
    const d = fireDevelopment(8, 0.5, 10, 12)
    expect(d.mode).toBe('circle')
    expect(d.R).toBeCloseTo(2, 6)
  })
})

describe('calcSectionI — цялостно изчисление', () => {
  it('базов случай (whole): Q = F_п · I_н', () => {
    const out = calcSectionI(base)
    // F_п = 120 (капнато), Q = 120 · 0.1 = 12 l/s
    expect(out.results.Fp).toBe(120)
    expect(out.results.Fg).toBe(120) // whole → F_г = F_п
    expect(out.results.Qg).toBeCloseTo(12, 6)
    // тип A, q=7: N = ceil(12/7) = 2
    expect(out.results.N_jets).toBe(2)
    // Q_факт = 2·7 = 14 → автомобили ceil(14/20)=1
    expect(out.results.N_trucks).toBe(1)
    // пожарникари = 2·2 = 4
    expect(out.results.N_firefighters).toBe(4)
  })

  it('форма "по периметър" дава F_г по формула 8 и Q = F_г·I_н, когато F_п > F_г', () => {
    // t_св = 13+4+3 = 20 min; a=30,b=40 → правоъгълно развитие
    const out = calcSectionI({ ...base, t_ds: 13, a: 30, b: 40, shape: 'perimeter' })
    // R_full = 0.5·1·10 + 1·(20-10) = 15 = a/2 → правоъгълно
    // F_п(rect) = 2·30·1·(20-5) = 900; помещение = 1200 → не е капнато
    expect(out.results.Fp).toBe(900)
    // F_г = 2·h·(a+b-2h) = 2·5·(30+40-10) = 10·60 = 600
    expect(out.results.Fg).toBeCloseTo(600, 6)
    // F_п (900) > F_г (600) → Q = F_г · I = 600·0.1 = 60
    expect(out.results.Qg).toBeCloseTo(60, 6)
  })

  it('струйници за защита увеличават общия брой и личния състав', () => {
    const out = calcSectionI({ ...base, protectionJets: 2 })
    // N_стр^г=2, +2 защита → общо 4
    expect(out.results.N_jets_total).toBe(4)
    // Q_факт = 2·7 + 2·3.5 = 21 → автомобили ceil(21/20)=2
    expect(out.results.N_trucks).toBe(2)
    // пожарникари = 2·2 + 1·2 = 6
    expect(out.results.N_firefighters).toBe(6)
  })

  it('тип "C" струйник: q = 3.5 l/s', () => {
    const out = calcSectionI({ ...base, jet: 'C' })
    // Q=12, N = ceil(12/3.5) = 4
    expect(out.results.N_jets).toBe(4)
  })

  it('връща стъпки и без предупреждения за валиден вход', () => {
    const out = calcSectionI(base)
    expect(out.steps.length).toBeGreaterThan(5)
    expect(out.warnings).toHaveLength(0)
  })
})
