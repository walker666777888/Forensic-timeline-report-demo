import { useEffect, useState } from 'react'
import { ChevronRight, Mail, Moon, Sun } from 'lucide-react'
import ForensicTimeline from './ForensicTimeline'
import { caseInfo } from './data'

const THEME_KEY = 'timeline-theme'

export default function App() {
  // index.html sets the class before first paint; this keeps it in sync.
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
    } catch {
      /* storage unavailable: the theme still applies for this visit */
    }
  }, [dark])

  return (
    <div className="min-h-dvh bg-page">
      <main className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-slate-500">
            <span>All Cases</span>
            <ChevronRight className="size-3.5" aria-hidden />
            <span className="font-mono text-slate-700">{caseInfo.id}</span>
          </nav>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            aria-pressed={dark}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-surface px-3 text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <div className="mt-3 mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.015em] text-slate-900">{caseInfo.title}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-slate-600">
              <span>{caseInfo.client}</span>
              <span className="text-slate-300" aria-hidden>|</span>
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" aria-hidden /> {caseInfo.channel} intake
              </span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[13px] font-medium text-teal-800">
            <span className="size-1.5 rounded-full bg-teal-600" aria-hidden />
            {caseInfo.status}
          </span>
        </div>

        <ForensicTimeline />

        <p className="mt-6 text-center text-[12.5px] text-slate-500">
          Demo with dummy data. Nothing here is connected to the live platform.
        </p>
      </main>
    </div>
  )
}
