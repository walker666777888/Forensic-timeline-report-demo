import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Activity,
  ArrowDownLeft,
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpNarrowWide,
  ArrowUpRight,
  CalendarDays,
  CircleCheckBig,
  Cpu,
  FileAudio,
  FileCheck2,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Flag,
  Inbox,
  Layers,
  Lock,
  Mail,
  Paperclip,
  Quote,
  Scale,
  Search,
  SearchX,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import {
  caseInfo,
  phases,
  records as allRecords,
  type Actor,
  type Kind,
  type Phase,
  type TimelineRecord,
} from './data'

/* ------------------------------------------------------------------ */
/* Vocabulary                                                          */
/* ------------------------------------------------------------------ */

type Filter = 'all' | 'milestone' | 'message' | 'evidence' | 'privileged' | 'audit'

const filterOf = (k: Kind): Exclude<Filter, 'all'> =>
  k === 'message_in' || k === 'message_out' ? 'message' : k

const FILTERS: { id: Filter; label: string; icon: LucideIcon; tone: string }[] = [
  { id: 'all', label: 'All records', icon: Layers, tone: 'text-slate-500' },
  { id: 'milestone', label: 'Milestones', icon: Flag, tone: 'text-navy dark:text-slate-300' },
  { id: 'message', label: 'Messages', icon: Mail, tone: 'text-blue-600 dark:text-[#8fa6cc]' },
  { id: 'evidence', label: 'Evidence', icon: Paperclip, tone: 'text-teal-600 dark:text-[#86bcb1]' },
  { id: 'privileged', label: 'Privileged notes', icon: Lock, tone: 'text-amber-600 dark:text-[#cfa25a]' },
  { id: 'audit', label: 'Audit log', icon: ShieldCheck, tone: 'text-slate-500' },
]

/**
 * Per-kind presentation. Every kind differs by icon, label, colour AND the
 * shape of its detail block, so no record relies on colour alone.
 */
const KIND: Record<Kind, { label: string; icon: LucideIcon; pill: string; node: string }> = {
  milestone: {
    label: 'Milestone',
    icon: Flag,
    pill: 'bg-navy text-white',
    node: 'bg-navy text-white dark:bg-[#e6dfcf] dark:text-[#1a1917]',
  },
  message_in: {
    label: 'Message received',
    icon: ArrowDownLeft,
    pill: 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200',
    node: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  },
  message_out: {
    label: 'Message sent',
    icon: ArrowUpRight,
    pill: 'bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-200',
    node: 'bg-blue-600 text-white',
  },
  evidence: {
    label: 'Evidence',
    icon: Paperclip,
    pill: 'bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-200',
    node: 'bg-teal-700 text-white',
  },
  privileged: {
    label: 'Privileged note',
    icon: Lock,
    pill: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200',
    node: 'hatch-amber text-amber-800 ring-1 ring-inset ring-amber-300',
  },
  audit: {
    label: 'Audit record',
    icon: ShieldCheck,
    pill: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
    node: 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200',
  },
}

/**
 * Each phase has its own hue and icon, used on its chapter bar, summary tile,
 * rail line and lifecycle step, so the chapters are told apart at a glance.
 */
const PHASE_TONE: Record<
  Phase['key'],
  { icon: LucideIcon; solid: string; band: string; text: string; rail: string; tile: string; seg: string }
> = {
  // Dark values are low-chroma "ink" versions of each hue on warm graphite,
  // chosen per phase rather than taken from the saturated Tailwind 900/950 ramp.
  received: {
    icon: Inbox,
    solid: 'bg-sky-600 text-white dark:bg-[#4a7396]',
    band: 'border-sky-200 bg-sky-50/95 dark:border-[#2d4257] dark:bg-[#1b2835]/95',
    text: 'text-sky-700 dark:text-[#a9c6de]',
    rail: 'bg-sky-200 dark:bg-[#3b5872]',
    tile: 'bg-sky-50/70 ring-sky-200/80 dark:bg-[#1c2733] dark:ring-[#2d4257]',
    seg: 'bg-sky-500 dark:bg-[#7aa0bf]',
  },
  acknowledged: {
    icon: Scale,
    solid: 'bg-orange-600 text-white dark:bg-[#9a5c3f]',
    band: 'border-orange-200 bg-orange-50/95 dark:border-[#4d3325] dark:bg-[#2e2019]/95',
    text: 'text-orange-700 dark:text-[#e0ae8f]',
    rail: 'bg-orange-200 dark:bg-[#6b4531]',
    tile: 'bg-orange-50/70 ring-orange-200/80 dark:bg-[#2c201a] dark:ring-[#4d3325]',
    seg: 'bg-orange-500 dark:bg-[#c07e5b]',
  },
  evidence: {
    icon: FileSearch,
    solid: 'bg-cyan-700 text-white dark:bg-[#3f7a7d]',
    band: 'border-cyan-200 bg-cyan-50/95 dark:border-[#2a4a4a] dark:bg-[#172c2d]/95',
    text: 'text-cyan-800 dark:text-[#9cd0cd]',
    rail: 'bg-cyan-200 dark:bg-[#356060]',
    tile: 'bg-cyan-50/70 ring-cyan-200/80 dark:bg-[#192c2c] dark:ring-[#2a4a4a]',
    seg: 'bg-cyan-600 dark:bg-[#66a5a2]',
  },
  analysis: {
    icon: Users,
    solid: 'bg-rose-600 text-white dark:bg-[#8e4b5c]',
    band: 'border-rose-200 bg-rose-50/95 dark:border-[#4d2e37] dark:bg-[#2e1c21]/95',
    text: 'text-rose-700 dark:text-[#e2a6b3]',
    rail: 'bg-rose-200 dark:bg-[#6a3b49]',
    tile: 'bg-rose-50/70 ring-rose-200/80 dark:bg-[#2c1d22] dark:ring-[#4d2e37]',
    seg: 'bg-rose-500 dark:bg-[#bb7385]',
  },
  par: {
    icon: FileCheck2,
    solid: 'bg-emerald-600 text-white dark:bg-[#58804f]',
    band: 'border-emerald-200 bg-emerald-50/95 dark:border-[#33482f] dark:bg-[#1d2a1c]/95',
    text: 'text-emerald-700 dark:text-[#b0d0a8]',
    rail: 'bg-emerald-200 dark:bg-[#466342]',
    tile: 'bg-emerald-50/70 ring-emerald-200/80 dark:bg-[#1f2b1e] dark:ring-[#33482f]',
    seg: 'bg-emerald-500 dark:bg-[#85aa7d]',
  },
  closed: {
    icon: CircleCheckBig,
    solid: 'bg-zinc-700 text-white dark:bg-[#635e55]',
    band: 'border-zinc-200 bg-zinc-100/95 dark:border-[#3d3b36] dark:bg-[#262523]/95',
    text: 'text-zinc-700 dark:text-[#c9c4b9]',
    rail: 'bg-zinc-300 dark:bg-[#56524a]',
    tile: 'bg-zinc-50 ring-zinc-200 dark:bg-[#262522] dark:ring-[#3d3b36]',
    seg: 'bg-zinc-500 dark:bg-[#958f84]',
  },
}

const isAutomated = (r: TimelineRecord) => r.kind === 'audit' && r.actor.type === 'system'

/** Event number in true chronological order, stable across filters and sorting. */
const eventNo = new Map(
  [...allRecords].sort((a, b) => a.at.localeCompare(b.at)).map((r, i) => [r.id, i + 1]),
)

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const dayKey = (iso: string) => iso.slice(0, 10)

const fmtTime = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' })
const fmtWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const fmtMonthDay = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const fmtFull = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const caseStart = startOfDay(new Date(caseInfo.openedAt))
const dayNumber = (d: Date) => Math.round((startOfDay(d).getTime() - caseStart.getTime()) / DAY) + 1
const daysBetween = (a: string, b: string) =>
  Math.abs(Math.round((startOfDay(new Date(a)).getTime() - startOfDay(new Date(b)).getTime()) / DAY))

/** Full phase extent, independent of filters. */
const phaseSpan = new Map(
  phases.map((p) => {
    const rs = allRecords.filter((r) => r.phase === p.key).sort((a, b) => a.at.localeCompare(b.at))
    return [p.key, rs.length ? { from: new Date(rs[0].at), to: new Date(rs[rs.length - 1].at) } : null]
  }),
)

function spanLabel(key: Phase['key']) {
  const s = phaseSpan.get(key)
  if (!s) return 'Not reached'
  const a = fmtMonthDay.format(s.from)
  const b = fmtMonthDay.format(s.to)
  const da = dayNumber(s.from)
  const db = dayNumber(s.to)
  return a === b ? `${a} · Day ${da}` : `${a} to ${b} · Days ${da} to ${db}`
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRe(q)})`, 'gi'))
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>,
      )}
    </>
  )
}

/** Renders an all-caps lead-in such as "LEGAL HOLD ISSUED:" as a bold run-in head. */
function RecordText({ text, query }: { text: string; query: string }) {
  const m = text.match(/^([A-Z][A-Z /]{3,}):\s*(.*)$/s)
  if (!m) return <Highlight text={text} query={query} />
  return (
    <>
      <strong className="font-semibold text-slate-900">
        <Highlight text={m[1]} query={query} />:
      </strong>{' '}
      <Highlight text={m[2]} query={query} />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Small parts                                                         */
/* ------------------------------------------------------------------ */

function Avatar({ actor }: { actor: Actor }) {
  const initials = actor.name
    .split(/[\s_@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
  return (
    <span
      aria-hidden
      className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${
        actor.type === 'reporter'
          ? 'bg-blue-100 text-blue-800'
          : actor.type === 'system'
            ? 'bg-slate-100 text-slate-500'
            : 'bg-slate-200/80 text-slate-700'
      }`}
    >
      {actor.type === 'system' ? <Cpu className="size-3" strokeWidth={2.25} /> : initials}
    </span>
  )
}

const fileIcon = (name: string): LucideIcon => {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'mp3' || ext === 'wav' || ext === 'm4a') return FileAudio
  if (ext === 'csv' || ext === 'xlsx' || ext === 'xls') return FileSpreadsheet
  return FileText
}

/** File names wrap after "_" and "." rather than mid-word. */
function FileName({ name, query }: { name: string; query: string }) {
  const parts = name.split(/(?<=[_.])/)
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          <Highlight text={p} query={query} />
        </Fragment>
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ */
/* One record                                                          */
/* ------------------------------------------------------------------ */

const ROW_GRID =
  'grid grid-cols-[32px_minmax(0,1fr)] gap-x-3 md:grid-cols-[76px_32px_minmax(0,1fr)] md:gap-x-4'

/**
 * Each record type is its own tile, told apart by silhouette first and colour
 * second, so the difference survives in dark mode and for colour-blind readers:
 *  - milestone: solid, heaviest tile
 *  - messages: chat bubbles with a tail corner, received left / sent right
 *  - evidence: a case-file folder with a tab
 *  - privileged: a sealed note with a dashed edge and hatched band
 *  - audit: a flat, recessed log card with no band
 */
type Frame = 'band' | 'tab' | 'flat'

const TILE: Record<
  Kind,
  { frame: Frame; shell: string; band: string; label: string; footer: string }
> = {
  milestone: {
    frame: 'band',
    shell:
      'rounded-xl border-navy bg-navy text-white shadow-[0_12px_28px_-16px_rgba(30,27,75,0.75)] dark:border-[#6b665b] dark:bg-raised dark:shadow-none',
    band: 'bg-white/10 text-white dark:bg-[#e6dfcf] dark:text-[#1a1917]',
    label: 'Milestone reached',
    footer: 'border-white/15 text-white/75 dark:border-slate-200 dark:text-slate-500',
  },
  message_in: {
    frame: 'band',
    shell: 'rounded-2xl rounded-tl-[4px] border-blue-200 bg-raised dark:bg-blue-50',
    band: 'border-b border-blue-100 bg-blue-50 text-blue-800 dark:border-blue-200 dark:bg-blue-100',
    label: 'Message received',
    footer: 'border-slate-100 text-slate-500 dark:border-blue-200',
  },
  message_out: {
    frame: 'band',
    shell: 'rounded-2xl rounded-tr-[4px] border-blue-600 bg-blue-50/70 dark:bg-blue-50',
    band: 'bg-blue-600 text-white',
    label: 'Message sent',
    footer: 'border-blue-200/70 text-slate-500 dark:border-blue-200',
  },
  evidence: {
    frame: 'tab',
    shell:
      'rounded-xl rounded-tl-none border-teal-700/40 bg-teal-50/40 dark:border-teal-700 dark:bg-teal-50',
    band: 'bg-teal-700 text-white',
    label: 'Evidence uploaded',
    footer: 'border-teal-100 text-slate-500 dark:border-teal-200',
  },
  privileged: {
    frame: 'band',
    shell: 'rounded-xl border-dashed border-amber-400 bg-amber-50/60',
    band: 'hatch-amber border-b border-dashed border-amber-300 text-amber-900',
    label: 'Privileged and confidential',
    footer: 'border-amber-200/70 text-slate-500',
  },
  audit: {
    frame: 'flat',
    shell: 'rounded-lg border-slate-200 bg-slate-50',
    band: 'text-slate-500',
    label: 'Audit record',
    footer: 'text-slate-500',
  },
}

function EvidenceBody({ record, query }: { record: TimelineRecord; query: string }) {
  const file = record.file!
  const Icon = fileIcon(file.name)
  const ext = file.name.split('.').pop()?.toUpperCase()
  return (
    <div className="mt-3 flex items-center gap-3.5">
      <span className="flex size-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg bg-surface text-teal-800 ring-1 ring-inset ring-teal-200">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        <span className="text-[10.5px] font-bold tracking-[0.04em]">{ext}</span>
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[13.5px] leading-snug text-slate-900">
          <FileName name={file.name} query={query} />
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px]">
          <span className="tabular-nums text-slate-500">{file.size}</span>
          <span className="inline-flex items-center gap-1 font-medium text-teal-700 dark:text-teal-300">
            <ShieldCheck className="size-3.5" strokeWidth={2} aria-hidden />
            Chain of custody logged
          </span>
        </p>
      </div>
    </div>
  )
}

function RecordRow({ record, query }: { record: TimelineRecord; query: string }) {
  const k = KIND[record.kind]
  const t = TILE[record.kind]
  const automated = isAutomated(record)
  const at = new Date(record.at)
  const Icon = k.icon
  const n = eventNo.get(record.id)
  const isMessage = record.kind === 'message_in' || record.kind === 'message_out'
  const onDark = record.kind === 'milestone'

  const number = (
    <span className="ml-auto shrink-0 pl-3 text-[11.5px] font-medium tracking-normal normal-case tabular-nums opacity-85">
      #{n}
      <span className="md:hidden"> · {fmtTime.format(at)}</span>
    </span>
  )

  const typeLabel = (
    <>
      <Icon className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
      <span>{t.label}</span>
    </>
  )

  const who = (
    <>
      <span>{isMessage ? 'From' : 'By'}</span>
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <Avatar actor={record.actor} />
        <span
          className={`truncate font-medium ${onDark ? 'text-white dark:text-slate-800' : 'text-slate-700'}`}
        >
          <Highlight text={record.actor.name} query={query} />
        </span>
      </span>
      {isMessage && (
        <>
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
          <span>to</span>
          <span className="font-medium text-slate-700">
            {record.kind === 'message_in' ? 'Case team' : 'Reporter'}
          </span>
        </>
      )}
    </>
  )

  const details = (
    <>
      {record.kind === 'milestone' && (
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/85 dark:text-slate-700">
          <strong className="font-semibold text-white dark:text-slate-900">
            <Highlight text={record.title} query={query} />.
          </strong>{' '}
          <Highlight text={record.body} query={query} />
        </p>
      )}

      {isMessage && (
        <blockquote className="mt-2 flex gap-2.5 text-[14.5px] leading-relaxed text-slate-700">
          <Quote
            className={`mt-1 size-4 shrink-0 ${
              record.kind === 'message_in' ? 'text-blue-300' : 'text-blue-500'
            }`}
            aria-hidden
          />
          <span>
            <RecordText text={record.body} query={query} />
          </span>
        </blockquote>
      )}

      {record.kind === 'evidence' && <EvidenceBody record={record} query={query} />}

      {record.kind === 'privileged' && (
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-800">
          <RecordText text={record.body} query={query} />
        </p>
      )}
    </>
  )

  const headline = (
    <h4
      className={`font-semibold leading-snug ${
        onDark ? 'text-[17px] text-white dark:text-slate-900' : 'text-[15.5px] text-slate-900'
      }`}
    >
      <Highlight text={record.headline} query={query} />
    </h4>
  )

  let tile: ReactNode
  if (t.frame === 'flat') {
    // Audit: recessed card, no band, lighter type, so it reads as bookkeeping.
    tile = (
      <article className={`border px-4 py-3 ${t.shell}`}>
        <header
          className={`flex items-center gap-1.5 text-[11px] font-bold tracking-[0.06em] uppercase ${t.band}`}
        >
          {typeLabel}
          {number}
        </header>
        <h4 className="mt-1 text-[15px] font-semibold leading-snug text-slate-900">
          <Highlight text={record.headline} query={query} />
        </h4>
        <p className="mt-0.5 text-[13.5px] leading-relaxed text-slate-600">
          <Highlight text={record.body} query={query} />
        </p>
        <p className={`mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] ${t.footer}`}>
          {who}
        </p>
      </article>
    )
  } else if (t.frame === 'tab') {
    // Evidence: a case-file folder, the label sits on a tab above the sheet.
    tile = (
      <div className="relative pt-[27px]">
        <div
          className={`absolute top-0 left-0 flex h-7 max-w-full items-center gap-2 rounded-t-lg px-3.5 text-[11.5px] font-bold tracking-[0.06em] uppercase ${t.band}`}
        >
          {typeLabel}
          <span className="pl-1 text-[11.5px] font-medium tracking-normal normal-case tabular-nums opacity-85">
            #{n}
            <span className="md:hidden"> · {fmtTime.format(at)}</span>
          </span>
        </div>
        <article className={`overflow-hidden border px-4 pt-3.5 pb-3 ${t.shell}`}>
          {headline}
          {details}
          <div
            className={`mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t pt-2.5 text-[12.5px] ${t.footer}`}
          >
            {who}
          </div>
        </article>
      </div>
    )
  } else {
    tile = (
      <article
        className={`overflow-hidden border ${t.shell} ${isMessage ? 'md:max-w-[84%]' : ''} ${
          record.kind === 'message_out' ? 'md:ml-auto' : ''
        }`}
      >
        <header
          className={`flex items-center gap-2 px-4 py-2 text-[11.5px] font-bold tracking-[0.06em] uppercase ${t.band}`}
        >
          {typeLabel}
          {number}
        </header>
        <div className="px-4 pt-3 pb-3">
          {headline}
          {details}
          <div
            className={`mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t pt-2.5 text-[12.5px] ${t.footer}`}
          >
            {who}
          </div>
        </div>
      </article>
    )
  }

  return (
    <li
      id={`rec-${record.id}`}
      tabIndex={-1}
      className={`relative -mx-2 scroll-mt-32 rounded-xl px-2 outline-none ${ROW_GRID} ${
        automated ? 'py-2' : 'py-3'
      }`}
    >
      {/* When (desktop) */}
      <div className={`hidden text-right md:block ${automated ? 'pt-0.5' : 'pt-2'}`}>
        <time
          dateTime={record.at}
          title={fmtFull.format(at)}
          className="block text-[13px] tabular-nums text-slate-600"
        >
          {fmtTime.format(at)}
        </time>
        <span className="mt-0.5 block text-[12px] tabular-nums text-slate-500">#{n}</span>
      </div>

      {/* Rail node */}
      <div className="flex items-start justify-center">
        {automated ? (
          <span className="mt-1.5 size-2.5 rounded-full bg-slate-300 ring-4 ring-surface" aria-hidden />
        ) : (
          <span className="mt-1 rounded-full bg-surface p-1" aria-hidden>
            <span
              className={`grid place-items-center rounded-full ${k.node} ${
                t.frame === 'flat' ? 'size-7' : 'size-8'
              }`}
            >
              <Icon className="size-4" strokeWidth={2} />
            </span>
          </span>
        )}
      </div>

      {/* What happened */}
      <div className="min-w-0">
        {automated ? (
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px] leading-6 text-slate-500">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <Cpu className="size-3.5 self-center" aria-hidden />
              <Highlight text={record.headline} query={query} />
            </span>
            <span>
              (<Highlight text={record.body} query={query} />)
            </span>
            <span className="ml-auto text-[12px] tabular-nums md:hidden">
              #{n} · {fmtTime.format(at)}
            </span>
          </div>
        ) : (
          <div className="max-w-[760px]">{tile}</div>
        )}
      </div>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* Lifecycle strip                                                     */
/* ------------------------------------------------------------------ */

function Lifecycle({ onJump }: { onJump: (id: string) => void }) {
  return (
    <nav aria-label="Case phases">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-0">
        {phases.map((p, i) => {
          const span = phaseSpan.get(p.key)
          const done = Boolean(span)
          return (
            <li key={p.key} className="relative">
              {i > 0 && (
                <span
                  aria-hidden
                  className={`absolute top-[15px] right-[calc(50%+18px)] left-[calc(-50%+18px)] hidden h-px lg:block ${
                    done ? 'bg-slate-300' : 'bg-slate-200'
                  }`}
                />
              )}
              <button
                type="button"
                disabled={!done}
                onClick={() => onJump(`phase-${p.key}`)}
                className="group flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-surface px-3 py-2.5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-col lg:gap-2 lg:border-transparent lg:bg-transparent lg:px-1 lg:py-0 lg:text-center lg:hover:border-transparent lg:hover:bg-transparent"
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold tabular-nums transition-transform duration-200 ease-out group-hover:scale-105 ${
                    done ? PHASE_TONE[p.key].solid : 'border border-slate-300 bg-surface text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-slate-900 group-hover:underline group-hover:decoration-slate-300 group-hover:underline-offset-4">
                    {p.short}
                  </span>
                  <span className="block text-[12.5px] tabular-nums text-slate-500">
                    {span ? `${fmtMonthDay.format(span.from)} · Day ${dayNumber(span.from)}` : 'Pending'}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Phase                                                               */
/* ------------------------------------------------------------------ */

function kindCounts(items: TimelineRecord[]) {
  const c = { message: 0, evidence: 0, privileged: 0, milestone: 0, audit: 0 }
  for (const r of items) c[filterOf(r.kind)]++
  const out: string[] = []
  if (c.milestone) out.push(`${c.milestone} milestone${c.milestone > 1 ? 's' : ''}`)
  if (c.message) out.push(`${c.message} message${c.message > 1 ? 's' : ''}`)
  if (c.evidence) out.push(`${c.evidence} evidence file${c.evidence > 1 ? 's' : ''}`)
  if (c.privileged) out.push(`${c.privileged} privileged note${c.privileged > 1 ? 's' : ''}`)
  if (c.audit) out.push(`${c.audit} audit record${c.audit > 1 ? 's' : ''}`)
  return out
}

interface DayBlock {
  key: string
  first: string
  items: TimelineRecord[]
  quietBefore: number
}

function PhaseSection({
  phase,
  index,
  days,
  query,
}: {
  phase: Phase
  index: number
  days: DayBlock[]
  query: string
}) {
  const items = days.flatMap((d) => d.items)
  const tone = PHASE_TONE[phase.key]
  const PIcon = tone.icon
  return (
    <section aria-labelledby={`phase-${phase.key}-title`} className="relative">
      {/* Sticky chapter bar, tinted in the phase's own colour */}
      <div
        id={`phase-${phase.key}`}
        tabIndex={-1}
        className={`sticky top-0 z-20 -mx-5 scroll-mt-0 border-y px-5 py-3 outline-none backdrop-blur-sm sm:-mx-7 sm:px-7 ${ROW_GRID} items-center ${tone.band}`}
      >
        <span className={`hidden text-right text-[12px] font-semibold md:block ${tone.text}`}>
          Phase {index + 1} of {phases.length}
        </span>
        <span
          className={`grid size-8 place-items-center rounded-full text-[13px] font-semibold tabular-nums shadow-sm ${tone.solid}`}
        >
          {index + 1}
        </span>
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h3
            id={`phase-${phase.key}-title`}
            className="flex items-center gap-2 text-[16.5px] font-semibold text-slate-900"
          >
            <PIcon className={`size-[18px] shrink-0 ${tone.text}`} strokeWidth={2} aria-hidden />
            {phase.title}
          </h3>
          <span className="flex items-center gap-3">
            <span className="text-[12.5px] tabular-nums text-slate-600">{spanLabel(phase.key)}</span>
            <span className="hidden items-center gap-0.5 sm:flex" aria-hidden>
              {phases.map((q, i) => (
                <span
                  key={q.key}
                  className={`h-1.5 w-3.5 rounded-full ${
                    i <= index ? PHASE_TONE[q.key].seg : 'bg-slate-300/70'
                  }`}
                />
              ))}
            </span>
          </span>
        </div>
      </div>

      {/* Chapter summary tile */}
      <div className={`${ROW_GRID} pt-4 pb-1`}>
        <span className="hidden md:block" />
        <span />
        <div className={`flex max-w-[760px] gap-3.5 rounded-xl p-4 ring-1 ring-inset ${tone.tile}`}>
          <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${tone.solid}`}>
            <PIcon className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className={`text-[12px] font-semibold ${tone.text}`}>What happened in this phase</p>
            <p className="mt-0.5 text-[14.5px] leading-relaxed text-slate-800">{phase.summary}</p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Records in this phase">
              {kindCounts(items).map((c) => (
                <li
                  key={c}
                  className="rounded-full bg-surface/80 px-2.5 py-0.5 text-[12px] font-medium text-slate-600 ring-1 ring-slate-200"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <ol className="relative pb-4">
        <span
          aria-hidden
          className={`absolute top-0 bottom-6 left-[15.5px] w-0.5 -translate-x-[0.5px] rounded-full md:left-[107.5px] ${tone.rail}`}
        />
        {days.map((day) => {
          const d = new Date(day.first)
          return (
            <Fragment key={day.key}>
              <li className={`${ROW_GRID} pt-4 pb-1`}>
                <span className="hidden md:block" />
                <span className="flex justify-center">
                  <span className="grid size-6 place-items-center rounded-full bg-surface text-slate-400 ring-1 ring-slate-200">
                    <CalendarDays className="size-3.5" aria-hidden />
                  </span>
                </span>
                <p className="flex flex-wrap items-baseline gap-x-2 pt-0.5 text-[13px]">
                  <span className="font-semibold text-slate-800">
                    {fmtWeekday.format(d)}, {fmtMonthDay.format(d)}
                  </span>
                  <span className="tabular-nums text-slate-500">Day {dayNumber(d)}</span>
                  {day.quietBefore > 0 && (
                    <span className="text-slate-500 italic">
                      after {day.quietBefore} quiet {day.quietBefore === 1 ? 'day' : 'days'}
                    </span>
                  )}
                </p>
              </li>
              {day.items.map((r) => (
                <RecordRow key={r.id} record={r} query={query} />
              ))}
            </Fragment>
          )
        })}
      </ol>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

export default function ForensicTimeline() {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  // Newest first: Phase 6 sits at the top and the case reads down to Phase 1.
  const [newestFirst, setNewestFirst] = useState(true)
  const [showAutomated, setShowAutomated] = useState(true)
  const [jumpTo, setJumpTo] = useState<{ id: string } | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: 0,
      milestone: 0,
      message: 0,
      evidence: 0,
      privileged: 0,
      audit: 0,
    }
    for (const r of allRecords) {
      if (!showAutomated && isAutomated(r)) continue
      c.all++
      c[filterOf(r.kind)]++
    }
    return c
  }, [showAutomated])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = allRecords.filter((r) => {
      if (!showAutomated && isAutomated(r)) return false
      if (filter !== 'all' && filterOf(r.kind) !== filter) return false
      if (!q) return true
      return [r.headline, r.title, r.body, r.actor.name, r.file?.name ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
    list.sort((a, b) => (newestFirst ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at)))
    return list
  }, [filter, query, newestFirst, showAutomated])

  // Phase > day > record, in the chosen order.
  const chapters = useMemo(() => {
    // Quiet days are measured in real time order, so "after 2 quiet days" stays
    // true whichever way the list is sorted.
    const chronoDays = [...new Set(visible.map((r) => dayKey(r.at)))].sort()
    const quiet = new Map(
      chronoDays.map((d, i) => [d, i === 0 ? 0 : Math.max(0, daysBetween(chronoDays[i - 1], d) - 1)]),
    )

    const order = newestFirst ? [...phases].reverse() : phases
    const out: { phase: Phase; index: number; days: DayBlock[] }[] = []
    for (const phase of order) {
      const items = visible.filter((r) => r.phase === phase.key)
      if (!items.length) continue
      const days: DayBlock[] = []
      for (const r of items) {
        const key = dayKey(r.at)
        const last = days[days.length - 1]
        if (last && last.key === key) last.items.push(r)
        else days.push({ key, first: r.at, items: [r], quietBefore: quiet.get(key) ?? 0 })
      }
      out.push({ phase, index: phases.indexOf(phase), days })
    }
    return out
  }, [visible, newestFirst])

  const filtered = filter !== 'all' || query.trim() !== '' || !showAutomated

  const clearAll = () => {
    setFilter('all')
    setQuery('')
    setShowAutomated(true)
  }

  // Jumping to a phase clears filters first so the target is always on screen.
  const jump = (id: string) => {
    clearAll()
    setJumpTo({ id })
  }

  useEffect(() => {
    if (!jumpTo) return
    const el = document.getElementById(jumpTo.id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // The chapter bar is sticky, so scroll to its section instead of the bar itself.
    const target = el.parentElement ?? el
    const y = target.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' })
    el.focus({ preventScroll: true })
    el.classList.remove('record-flash')
    void el.offsetWidth
    el.classList.add('record-flash')
    const t = window.setTimeout(() => el.classList.remove('record-flash'), 1800)
    return () => window.clearTimeout(t)
  }, [jumpTo])

  // "/" focuses search, like most log viewers.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const sorted = [...allRecords].sort((a, b) => a.at.localeCompare(b.at))
  const first = new Date(sorted[0].at)
  const last = new Date(sorted[sorted.length - 1].at)

  return (
    <section
      aria-labelledby="timeline-title"
      className="rounded-xl border border-slate-200 bg-surface shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)]"
    >
      {/* Header */}
      <header className="rounded-t-xl border-b border-slate-200 bg-slate-50/60 px-5 pt-5 pb-5 sm:px-7 sm:pt-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
          <div className="min-w-[260px] flex-1">
            <h2
              id="timeline-title"
              className="flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.01em] text-slate-900"
            >
              <Activity className="size-5 text-navy dark:text-slate-300" strokeWidth={2} aria-hidden />
              Unified Forensic Timeline
            </h2>
            <p className="mt-1 max-w-[75ch] text-[14.5px] leading-relaxed text-slate-600">
              Immutable chronological record of all case events, evidence, and correspondence.
            </p>
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
            <div>
              <dt className="text-slate-500">Records</dt>
              <dd className="font-semibold tabular-nums text-slate-900">{allRecords.length}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Span</dt>
              <dd className="font-semibold tabular-nums text-slate-900">
                {fmtMonthDay.format(first)} to {fmtMonthDay.format(last)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Duration</dt>
              <dd className="font-semibold tabular-nums text-slate-900">{dayNumber(last)} days</dd>
            </div>
          </dl>
        </div>

        <div className="mt-5">
          <Lifecycle onJump={jump} />
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-slate-200 px-5 py-4 sm:px-7">
        <div role="group" aria-label="Filter by record type" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.id
            const FIcon = f.icon
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={`inline-flex h-9 items-center gap-2 rounded-full border pr-2 pl-3 text-[13px] font-medium transition-colors duration-150 ${
                  active
                    ? 'border-navy bg-navy text-white dark:border-[#e6dfcf] dark:bg-[#e6dfcf] dark:text-[#1a1917]'
                    : 'border-slate-200 bg-surface text-slate-700 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <FIcon className={`size-4 ${active ? '' : f.tone}`} strokeWidth={2} aria-hidden />
                {f.label}
                <span
                  className={`min-w-6 rounded-full px-1.5 py-px text-center text-[11.5px] font-semibold tabular-nums ${
                    active ? 'bg-white/15 text-white dark:bg-[#1a1917]/10 dark:text-[#1a1917]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {counts[f.id]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="relative min-w-[220px] flex-1">
            <span className="sr-only">Search records</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
              placeholder="Search text, people or file names"
              className="h-9 w-full rounded-lg border border-slate-200 bg-surface pr-16 pl-9 text-[14px] text-slate-900 placeholder:text-slate-500 hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  searchRef.current?.focus()
                }}
                className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 font-sans text-[11px] text-slate-500">
                /
              </kbd>
            )}
          </label>

          <button
            type="button"
            onClick={() => setNewestFirst((v) => !v)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-surface px-3 text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
            aria-label={`Sort order: ${newestFirst ? 'newest first' : 'oldest first'}. Click to switch.`}
          >
            {newestFirst ? (
              <ArrowDownWideNarrow className="size-4" aria-hidden />
            ) : (
              <ArrowUpNarrowWide className="size-4" aria-hidden />
            )}
            {newestFirst ? 'Newest first' : 'Oldest first'}
          </button>

          <label className="inline-flex h-9 cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-surface px-3 text-[13px] font-medium text-slate-700 transition-colors select-none hover:border-slate-300">
            <input
              type="checkbox"
              role="switch"
              checked={showAutomated}
              onChange={(e) => setShowAutomated(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="relative h-4 w-7 rounded-full bg-slate-300 transition-colors duration-150 peer-checked:bg-teal-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal-700 after:absolute after:top-0.5 after:left-0.5 after:size-3 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-150 peer-checked:after:translate-x-3"
            />
            Automated entries
          </label>
        </div>

        <p className="mt-3 text-[12.5px] text-slate-500" aria-live="polite">
          {filtered ? (
            <>
              Showing <span className="font-semibold tabular-nums text-slate-700">{visible.length}</span> of{' '}
              {allRecords.length} records.{' '}
              <button
                type="button"
                onClick={clearAll}
                className="font-medium text-teal-700 dark:text-teal-300 underline decoration-teal-700/30 underline-offset-2 hover:decoration-teal-700"
              >
                Clear filters
              </button>
            </>
          ) : newestFirst ? (
            <>
              Showing all {allRecords.length} records, newest first: Phase {phases.length} is at the top and
              the case started with Phase 1 at the bottom. Select a phase above to jump to it.
            </>
          ) : (
            <>
              Showing all {allRecords.length} records in the order they happened, grouped into{' '}
              {phases.length} phases. Select a phase above to jump to it.
            </>
          )}
        </p>
      </div>

      {/* Records */}
      <div className="px-5 sm:px-7">
        {chapters.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500">
              <SearchX className="size-6" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="mt-4 text-[15px] font-semibold text-slate-900">
              {query.trim() ? `No records match "${query.trim()}"` : 'No records of this type'}
            </p>
            <p className="mt-1 text-[14px] text-slate-500">Try another search term or record type.</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-4 inline-flex h-9 items-center rounded-lg bg-navy px-4 text-[13px] font-medium text-white transition-colors hover:bg-navy-soft dark:bg-[#e6dfcf] dark:text-[#1a1917] dark:hover:bg-[#f2ecdf]"
            >
              Show all records
            </button>
          </div>
        ) : (
          chapters.map((c) => (
            <PhaseSection
              key={c.phase.key}
              phase={c.phase}
              index={c.index}
              days={c.days}
              query={query}
            />
          ))
        )}
      </div>

      {chapters.length > 0 && (
        <footer className="flex items-center gap-2 rounded-b-xl border-t border-slate-200 bg-slate-50/60 px-5 py-3.5 text-[12.5px] text-slate-500 sm:px-7">
          <Lock className="size-3.5 shrink-0" aria-hidden />
          Append-only record. Entries cannot be edited or deleted; corrections are added as new entries.
        </footer>
      )}
    </section>
  )
}
