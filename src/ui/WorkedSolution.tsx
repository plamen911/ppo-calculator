import { CalcOutput } from '../calc/types'
import { Katex } from './Katex'

export function WorkedSolution({ output, title }: { output: CalcOutput<unknown>; title: string }) {
  const results = output.steps.filter((s) => s.kind === 'result')
  return (
    <div className="solution">
      <div className="solution-head">
        <h2>{title}</h2>
      </div>

      {output.warnings.length > 0 && (
        <div className="warnings">
          {output.warnings.map((w, i) => (
            <div key={i} className="warning">
              ⚠ {w}
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="results-grid">
          {results.map(
            (s, i) =>
              s.kind === 'result' && (
                <div key={i} className="result-card">
                  <div className="result-label">{s.label}</div>
                  <div className="result-value">
                    <Katex tex={s.tex} />
                  </div>
                </div>
              ),
          )}
        </div>
      )}

      <div className="steps">
        {output.steps.map((s, i) => {
          switch (s.kind) {
            case 'heading':
              return (
                <h3 key={i} className="step-heading">
                  {s.text}
                </h3>
              )
            case 'note':
              return (
                <p key={i} className="step-note">
                  {s.text}
                </p>
              )
            case 'math':
              return (
                <div key={i} className="step-math">
                  <Katex tex={s.tex} display />
                </div>
              )
            case 'result':
              return null
          }
        })}
      </div>
    </div>
  )
}
