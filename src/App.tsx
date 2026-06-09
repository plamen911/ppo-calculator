import { useState } from 'react'
import { SectionIPanel } from './ui/SectionIPanel'
import { SectionIIPanel } from './ui/SectionIIPanel'
import { SectionIIIPanel } from './ui/SectionIIIPanel'
import { SectionIVPanel } from './ui/SectionIVPanel'
import { AboutModal } from './ui/AboutModal'

type Tab = 'I' | 'II' | 'III' | 'IV'

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: 'I', label: 'Раздел I', hint: 'Твърди горими вещества' },
  { id: 'II', label: 'Раздел II', hint: 'ЛЗТ и ГТ · резервоари + пяна' },
  { id: 'III', label: 'Раздел III', hint: 'Пяна по обем' },
  { id: 'IV', label: 'Раздел IV', hint: 'Прахово гасене' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('I')
  const [aboutOpen, setAboutOpen] = useState(false)

  const print = () => window.print()
  const exportPdf = async () => {
    if (window.ppo?.isElectron) {
      const res = await window.ppo.exportPdf(`plan-za-gasene-razdel-${tab}.pdf`)
      if (!res.ok && res.error && res.error !== 'canceled') {
        alert('Грешка при запис на PDF: ' + res.error)
      }
    } else {
      window.print()
    }
  }

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <span className="logo">🔥</span>
          <div>
            <div className="title">Калкулатор за план за пожарогасене</div>
            <div className="subtitle">Сили и средства за гасене на пожар · Приложение № 5</div>
          </div>
        </div>
        <div className="actions">
          <button onClick={print}>🖨 Печат</button>
          <button onClick={exportPdf}>📄 Запази като PDF</button>
          <button onClick={() => setAboutOpen(true)}>ⓘ Относно</button>
        </div>
      </header>

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}

      <nav className="tabs no-print">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-label">{t.label}</span>
            <span className="tab-hint">{t.hint}</span>
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'I' && <SectionIPanel />}
        {tab === 'II' && <SectionIIPanel />}
        {tab === 'III' && <SectionIIIPanel />}
        {tab === 'IV' && <SectionIVPanel />}
      </main>
    </div>
  )
}
