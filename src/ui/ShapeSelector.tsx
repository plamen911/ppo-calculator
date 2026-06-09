import { FireShape, SHAPE_LABELS } from '../calc/helpers'

import front_a from '../assets/shapes/area1_a.jpg'
import front_b from '../assets/shapes/area1_b.jpg'
import two_aa from '../assets/shapes/area2_aa.jpg'
import two_bb from '../assets/shapes/area2_bb.jpg'
import two_ab from '../assets/shapes/area2_ab.jpg'
import three_aab from '../assets/shapes/area3_aab.jpg'
import three_abb from '../assets/shapes/area3_abb.jpg'
import perimeter from '../assets/shapes/area4.jpg'
import circle from '../assets/shapes/area_circle.jpg'
import whole from '../assets/shapes/area_plosht.jpg'

const SHAPE_IMG: Record<FireShape, string> = {
  front_a,
  front_b,
  two_aa,
  two_bb,
  two_ab,
  three_aab,
  three_abb,
  perimeter,
  circle,
  whole,
}

const ORDER: FireShape[] = [
  'front_a',
  'front_b',
  'two_aa',
  'two_bb',
  'two_ab',
  'three_aab',
  'three_abb',
  'perimeter',
  'circle',
  'whole',
]

export function ShapeSelector({
  value,
  onChange,
}: {
  value: FireShape
  onChange: (v: FireShape) => void
}) {
  return (
    <div className="shape-grid">
      {ORDER.map((s) => (
        <button
          key={s}
          type="button"
          className={`shape-card ${value === s ? 'selected' : ''}`}
          onClick={() => onChange(s)}
          title={SHAPE_LABELS[s]}
        >
          <img src={SHAPE_IMG[s]} alt={SHAPE_LABELS[s]} />
          <span>{SHAPE_LABELS[s]}</span>
        </button>
      ))}
    </div>
  )
}
