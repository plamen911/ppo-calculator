import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export function AboutModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card about-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Относно приложението</h3>
          <button className="modal-close" onClick={onClose} aria-label="Затвори">
            ✕
          </button>
        </div>
        <div className="about-body">
          <p className="about-logo">🔥 Калкулатор за план за гасене на пожар</p>
          <p>
            Приложение за изчисляване на силите и необходимите средства за гасене на пожар
            по Методиката от Приложение № 5 — твърди горими вещества, ЛЗТ и ГТ (резервоари и
            пяна), пяна по обем и прахово гасене. Показва подробно решение по формулите и
            справочните таблици от указанията.
          </p>
          <div className="about-author">
            <div className="about-label">Автор</div>
            <div className="about-name">Plamen Markov</div>
            <a href="mailto:plamen326@gmail.com">plamen326@gmail.com</a>
          </div>
          <p className="about-privacy">
            Приложението работи изцяло локално — не събира, не съхранява и не предава лични данни.
          </p>
          <p className="about-copy">© 2026 Plamen Markov. Всички права запазени.</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
