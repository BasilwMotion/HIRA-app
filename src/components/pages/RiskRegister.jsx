import { useState } from 'react'
import { Search, Trash2, Edit2, ChevronDown, ChevronUp, X, Eye, Copy, CheckCheck, PlusCircle } from 'lucide-react'
import { useStore } from '../../store/useStore.js'
import { riskScore, riskLevel, RISK_CONFIG, isOverdue, STATUS_OPTIONS } from '../../utils/risk.js'
import { RiskBadge, StatusBadge, ControlBadge } from '../ui/Badge.jsx'
import { ConfirmModal } from '../ui/Modal.jsx'
import { AssessmentDetailModal } from '../ui/AssessmentDetailModal.jsx'
import clsx from 'clsx'

const LEVEL_FILTERS  = [{ v: '', l: 'All levels' }, { v: 'extreme', l: 'Extreme' }, { v: 'high', l: 'High' }, { v: 'medium', l: 'Medium' }, { v: 'low', l: 'Low' }]
const STATUS_FILTERS = ['All statuses', 'Open', 'In progress', 'Closed', 'Overdue']

function Row({ a, onView, onEdit, onDelete, onDuplicate, onStatusChange }) {
  const [open, setOpen] = useState(false)
  const sB  = riskScore(a.lBefore, a.cBefore)
  const sA  = riskScore(a.lAfter,  a.cAfter)
  const lvl = riskLevel(sA)
  const ood = isOverdue(a)
  const cfg = RISK_CONFIG[lvl]

  return (
    <div className={clsx('bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-sm', ood ? 'border-red-200' : 'border-slate-200')}>
      {/* Main row */}
      <div className="flex items-start gap-0">
        {/* Level stripe */}
        <div className="w-1 self-stretch rounded-l-xl flex-shrink-0" style={{ background: cfg.bar }} />

        <div className="flex-1 px-5 py-4 min-w-0">
          <div className="flex items-start justify-between gap-3">
            {/* Left: text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 leading-snug">{a.hazard}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-400">
                {a.area     && <span>{a.area}</span>}
                {a.task     && <><span>·</span><span>{a.task}</span></>}
                {a.category && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{a.category}</span>}
                {a.frs && a.frs !== 'Not applicable' && (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-medium">{a.frs}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 mt-2 text-xs text-slate-400">
                {a.who   && <span>Exposed: <span className="text-slate-600">{a.who}</span></span>}
                {a.owner && <span>Owner: <span className="text-slate-600">{a.owner}</span></span>}
                {a.date  && <span>Due: <span className={clsx('font-medium', ood ? 'text-red-600' : 'text-slate-600')}>{a.date}</span></span>}
              </div>
            </div>

            {/* Right: badges + actions */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono hidden sm:block">{sB} → {sA}</span>
                <RiskBadge score={sA} />
              </div>
              <StatusBadge status={ood ? 'Overdue' : a.status} />
            </div>
          </div>
        </div>

        {/* Action buttons column */}
        <div className="flex flex-col border-l border-slate-100 flex-shrink-0">
          <button onClick={() => onView(a.id)}    title="View detail"  className="px-3 py-2.5 text-slate-400 hover:text-blue-600  hover:bg-blue-50  transition-colors border-b border-slate-100"><Eye   size={14} /></button>
          <button onClick={() => onEdit(a.id)}    title="Edit"         className="px-3 py-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50  transition-colors border-b border-slate-100"><Edit2 size={14} /></button>
          <button onClick={() => onDuplicate(a.id)} title="Duplicate"  className="px-3 py-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50  transition-colors border-b border-slate-100"><Copy  size={14} /></button>
          <button onClick={() => onDelete(a)}     title="Delete"       className="px-3 py-2.5 text-slate-400 hover:text-red-600   hover:bg-red-50    transition-colors border-b border-slate-100"><Trash2 size={14} /></button>
          <button onClick={() => setOpen(!open)}  title="Expand"       className="px-3 py-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50  transition-colors">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-slate-100 px-6 py-5 bg-slate-50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Risk scores */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Risk rating</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Inherent (before controls)</span>
                  <RiskBadge score={sB} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Residual (after controls)</span>
                  <RiskBadge score={sA} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Risk reduction</span>
                  <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">↓ {Math.max(0, sB - sA)} pts</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Controls ({(a.controls || []).length})</p>
              {(a.controls || []).length === 0 ? (
                <p className="text-sm text-slate-400 italic">No controls recorded.</p>
              ) : (
                <ul className="space-y-1.5">
                  {a.controls.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ControlBadge type={c.type} />
                      <span className="text-slate-600 leading-snug">{c.desc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Status change */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Update status:</span>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(a.id, s)}
                  className={clsx(
                    'flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors',
                    a.status === s
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800 bg-white'
                  )}
                >
                  {a.status === s && <CheckCheck size={11} />}
                  {s}
                </button>
              ))}
            </div>

            {/* Required action */}
            <div className="ml-auto text-xs rounded-lg px-3 py-1.5 border font-medium"
              style={{ background: cfg.cell.bg, borderColor: cfg.cell.border, color: cfg.cell.text }}>
              {cfg.label}: {cfg.action.split('.')[0]}.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function RiskRegister() {
  const { assessments, deleteAssessment, startEdit, updateStatus, duplicateAssessment, startNew } = useStore()
  const [search,       setSearch]      = useState('')
  const [levelFilter,  setLevelFilter] = useState('')
  const [statusFilter, setStatusFilter]= useState('')
  const [sortBy,       setSortBy]      = useState('score-desc')
  const [deleteTarget, setDeleteTarget]= useState(null)
  const [viewingId,    setViewingId]   = useState(null)

  const filtered = assessments
    .filter((a) => {
      const sA  = riskScore(a.lAfter, a.cAfter)
      const ood = isOverdue(a)
      const effectiveStatus = ood ? 'Overdue' : a.status
      if (levelFilter  && riskLevel(sA) !== levelFilter) return false
      if (statusFilter && statusFilter !== 'All statuses' && effectiveStatus !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          a.hazard.toLowerCase().includes(q) ||
          (a.area  || '').toLowerCase().includes(q) ||
          (a.task  || '').toLowerCase().includes(q) ||
          (a.category || '').toLowerCase().includes(q) ||
          (a.owner || '').toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      const sA_a = riskScore(a.lAfter, a.cAfter)
      const sA_b = riskScore(b.lAfter, b.cAfter)
      if (sortBy === 'score-desc') return sA_b - sA_a
      if (sortBy === 'score-asc')  return sA_a - sA_b
      if (sortBy === 'date-asc')   return (a.date || '').localeCompare(b.date || '')
      if (sortBy === 'date-desc')  return (b.date || '').localeCompare(a.date || '')
      return 0
    })

  const hasFilters = search || levelFilter || (statusFilter && statusFilter !== 'All statuses')
  const clearFilters = () => { setSearch(''); setLevelFilter(''); setStatusFilter('') }

  return (
    <div className="p-8">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hazards, area, owner…"
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Level filter */}
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-200 cursor-pointer">
          {LEVEL_FILTERS.map((f) => <option key={f.v} value={f.v}>{f.l}</option>)}
        </select>

        {/* Status filter */}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-200 cursor-pointer">
          {STATUS_FILTERS.map((s) => <option key={s}>{s}</option>)}
        </select>

        {/* Sort */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-200 cursor-pointer">
          <option value="score-desc">Highest risk first</option>
          <option value="score-asc">Lowest risk first</option>
          <option value="date-asc">Due date (soonest)</option>
          <option value="date-desc">Due date (latest)</option>
        </select>

        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <X size={13} /> Clear
          </button>
        )}

        <span className="text-xs text-slate-400 ml-auto font-mono">{filtered.length} / {assessments.length}</span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 py-16 text-center">
          {assessments.length === 0 ? (
            <>
              <p className="text-slate-500 font-medium">No assessments yet</p>
              <p className="text-slate-400 text-sm mt-1 mb-4">Create your first hazard assessment to get started</p>
              <button onClick={startNew} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-700 rounded-lg hover:bg-red-800 transition-colors">
                <PlusCircle size={14} /> New assessment
              </button>
            </>
          ) : (
            <>
              <p className="text-slate-500 font-medium">No results match your filters</p>
              <button onClick={clearFilters} className="mt-3 text-sm text-red-700 hover:underline">Clear filters</button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Row
              key={a.id}
              a={a}
              onView={setViewingId}
              onEdit={startEdit}
              onDelete={setDeleteTarget}
              onDuplicate={duplicateAssessment}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteAssessment(deleteTarget.id)}
        title="Delete assessment"
        message={`This will permanently delete the assessment:\n\n"${deleteTarget?.hazard?.slice(0, 120)}"\n\nThis action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />

      <AssessmentDetailModal
        open={!!viewingId}
        onClose={() => setViewingId(null)}
        assessmentId={viewingId}
      />
    </div>
  )
}
