import { useState } from 'react'
import { ChevronDown, ChevronUp, Shield, BookOpen, Scale, Search, X, AlertTriangle } from 'lucide-react'
import { FRS_DATA } from '../../data/frsData.js'
import clsx from 'clsx'

function ControlPill({ control, type }) {
  const styles = {
    prevent:  'bg-red-50 border-red-200 text-red-800',
    mitigate: 'bg-blue-50 border-blue-200 text-blue-800',
  }
  return (
    <div className={clsx('flex items-start gap-2.5 p-3 rounded-lg border', styles[type])}>
      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5', type === 'prevent' ? 'bg-red-500' : 'bg-blue-500')} />
      <span className="text-sm leading-snug">{control}</span>
    </div>
  )
}

function FRSCard({ frs }) {
  const [open, setOpen] = useState(false)
  const prevent  = frs.criticalControls.filter((c) => c.type === 'prevent')
  const mitigate = frs.criticalControls.filter((c) => c.type === 'mitigate')

  return (
    <div className={clsx('bg-white rounded-2xl border overflow-hidden transition-all', open ? 'border-red-300 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm')}>
      {/* Header — always clickable */}
      <button
        type="button"
        className="w-full px-6 py-5 flex items-center gap-4 text-left focus:outline-none focus:bg-slate-50"
        onClick={() => setOpen(!open)}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0 select-none">
          {frs.emoji || '⚠'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold font-mono text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              {frs.code}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{frs.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{frs.description}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500">{prevent.length} prevention</p>
            <p className="text-xs text-slate-400">{mitigate.length} mitigation</p>
          </div>
          <div className={clsx('p-1.5 rounded-lg transition-colors', open ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500')}>
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <div className="border-t border-slate-100 px-6 py-5 space-y-5 bg-slate-50">
          <p className="text-sm text-slate-600 leading-relaxed">{frs.description}</p>

          {/* Key risks */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle size={12} className="text-amber-600" />
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Key risk events</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {frs.keyRisks.map((r, i) => (
                <span key={i} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Shield size={12} className="text-red-600" />
                <p className="text-[11px] font-bold text-red-700 uppercase tracking-widest">Prevention controls</p>
              </div>
              <div className="space-y-2">
                {prevent.map((c, i) => <ControlPill key={i} control={c.control} type="prevent" />)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <BookOpen size={12} className="text-blue-600" />
                <p className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Mitigation controls</p>
              </div>
              <div className="space-y-2">
                {mitigate.map((c, i) => <ControlPill key={i} control={c.control} type="mitigate" />)}
              </div>
            </div>
          </div>

          {/* Legislation */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200">
            <Scale size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Legislation / standard</p>
              <p className="text-xs text-slate-600">{frs.legislation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ControlsLibrary() {
  const [search,   setSearch]   = useState('')
  const [expanded, setExpanded] = useState(false)

  const frsWithEmoji = FRS_DATA.map((f, i) => ({
    ...f,
    emoji: ['⛰','🚛','💥','⚡','🔥','💧','🏗','📈','🦺','⚙'][i] || '⚠',
  }))

  const filtered = frsWithEmoji.filter((f) =>
    !search ||
    f.title.toLowerCase().includes(search.toLowerCase()) ||
    f.code.toLowerCase().includes(search.toLowerCase()) ||
    f.keyRisks.some((r) => r.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-8 space-y-5">
      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle size={15} className="text-red-700 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-800">
          <span className="font-bold">Critical controls must be verified before work commences.</span>{' '}
          The absence of any prevention control listed below constitutes a stop-work condition under Sibanye-Stillwater's fatal risk management standard.
        </p>
      </div>

      {/* Search + expand all */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by standard name, code, or risk type…"
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex-shrink-0"
        >
          {expanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 py-12 text-center">
            <p className="text-slate-500 font-medium">No standards match "{search}"</p>
            <button onClick={() => setSearch('')} className="mt-2 text-sm text-red-700 hover:underline">Clear search</button>
          </div>
        ) : (
          filtered.map((frs) => <FRSCard key={frs.id} frs={frs} />)
        )}
      </div>
    </div>
  )
}
