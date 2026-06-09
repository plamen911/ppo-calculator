import { describe, it, expect } from 'vitest'
import { calcSectionII } from './sectionII'
import { calcSectionIII } from './sectionIII'
import { calcSectionIV } from './sectionIV'

describe('Раздел II — охлаждане + ВМП', () => {
  it('разход за охлаждане на горящ резервоар (формула 24)', () => {
    const out = calcSectionII({
      D_burn: 10,
      spillSurround: false,
      neighbors: 2,
      D_neighbor: 10,
      jet: 'B',
      I_foam: 0.08,
      q_foamGen: 6,
    })
    // Q_охл.г = π·D·I = 3.14·10·0.5 = 15.7
    expect(out.results.Q_cool_burn).toBeCloseTo(15.7, 6)
    // Q_охл.с = 0.5·2·3.14·10·0.2 = 6.28
    expect(out.results.Q_cool_neighbor).toBeCloseTo(6.28, 6)
    // общо = 21.98 → екипи ceil(21.98/14) = 2
    expect(out.results.Q_cool_total).toBeCloseTo(21.98, 6)
    expect(out.results.N_crews_cool).toBe(2)
    // F_foam = 3.14·100/4 = 78.5; N_ппв = ceil(78.5·0.08/6) = ceil(1.046)=2
    expect(out.results.F_foam).toBeCloseTo(78.5, 6)
    expect(out.results.N_foamGen).toBe(2)
    // W_по = 2·6·10·60·3 = 21600
    expect(out.results.W_foam).toBeCloseTo(21600, 6)
  })

  it('разлив по целия периметър увеличава интензивността на 1.0', () => {
    const out = calcSectionII({
      D_burn: 10,
      spillSurround: true,
      neighbors: 0,
      D_neighbor: 10,
      jet: 'B',
      I_foam: 0.08,
      q_foamGen: 6,
    })
    // Q_охл.г = 3.14·10·1.0 = 31.4
    expect(out.results.Q_cool_burn).toBeCloseTo(31.4, 6)
    expect(out.results.Q_cool_neighbor).toBe(0)
  })
})

describe('Раздел III — пяна по обем', () => {
  it('обем, разход и брой пеногенератори (формули 33–35)', () => {
    const out = calcSectionIII({ a: 10, l: 20, h_load: 3, z: 0.3, q_foamGen: 12 })
    // h_o = 3.3; V = 10·20·3.3 = 660
    expect(out.results.h_o).toBeCloseTo(3.3, 6)
    expect(out.results.V_p).toBeCloseTo(660, 6)
    // Q = 660·3/10 = 198 m³/min
    expect(out.results.Q_foam).toBeCloseTo(198, 6)
    // N = ceil(198/12) = 17
    expect(out.results.N_foamGen).toBe(17)
  })

  it('предупреждава при z под минимума', () => {
    const out = calcSectionIII({ a: 10, l: 10, h_load: 2, z: 0.1, q_foamGen: 12 })
    expect(out.warnings.length).toBeGreaterThan(0)
  })
})

describe('Раздел IV — прахово гасене', () => {
  it('разход, струйници, прах и автомобили (формули 36–40)', () => {
    const out = calcSectionIV({ Fp: 50, I: 0.3, jet: 'hand', t_n: 30, W_perTruck: 1000 })
    // Q = 50·0.3 = 15 kg/s
    expect(out.results.Qg).toBeCloseTo(15, 6)
    // N_стр = ceil(15/5) = 3
    expect(out.results.N_jets).toBe(3)
    // W = 50·0.3·30 = 450 kg
    expect(out.results.W_powder).toBeCloseTo(450, 6)
    // N_па = ceil(450/1000) = 1
    expect(out.results.N_trucks).toBe(1)
  })

  it('лафетни струйници: q = 40 kg/s', () => {
    const out = calcSectionIV({ Fp: 200, I: 0.3, jet: 'lafette', t_n: 30, W_perTruck: 1000 })
    // Q = 60 kg/s; N = ceil(60/40) = 2
    expect(out.results.N_jets).toBe(2)
  })
})
