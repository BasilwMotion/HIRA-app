import { Modal } from './Modal.jsx'
import { RiskBadge, StatusBadge, ControlBadge } from './Badge.jsx'
import { riskScore, riskLevel, RISK_CONFIG, LIKELIHOOD_LABELS, CONSEQUENCE_LABELS, isOverdue } from '../../utils/risk.js'
import { useStore } from '../../store/useStore.js'
import { Edit2, Copy, Trash2, CheckCircle2, Clock } from 'lucide-react'
import clsx from 'clsx'

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 w-32 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-800 flex-1">{value}</span>
    </div>
  )
}

function RiskBlock({ label, l, c }) {
  if (!l || !c) return null
  const s   = riskScore(l, c)
  const cfg = RISK_CONFIG[riskLevel(s)]
  return (
    <div className="rounded-xl p-4 border" style={{ background: cfg.cell.bg, borderColor: cfg.cell.border }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: cfg.cell.text }}>{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono" style={{ color: cfg.cell.text }}>{s}</span>
        <span className="text-sm font-semibold" style={{ color: cfg.cell.text }}>{cfg.label}</span>
      </div>
      <p className="text-xs mt-1" style={{ color: cfg.cell.text }}>
        L{l} ({LIKELIHOOD_LABELS[l]?.label}) × C{c} ({CONSEQUENCE_LABELS[c]?.label})
      </p>
    </div>
  )
}

export function AssessmentDetailModal({ open, onClose, assessmentId }) {
  const { assessments, startEdit, deleteAssessment, duplicateAssessment, updateStatus, showToast } = useStore()
  const a = assessments.find((x) => x.id === assessmentId)
  if (!a) return null

  const ood = isOverdue(a)
  const sB  = riskScore(a.lBefore, a.cBefore)
  const sA  = riskScore(a.lAfter, a.cAfter)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assessment detail"
      subtitle={a.id}
      size="lg"
      footer={
        <>
          <button
            onClick={() => { duplicateAssessment(a.id); onClose() }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Copy size={13} /> Duplicate
          </button>
          <button
            onClick={() => { deleteAssessment(a.id); onClose() }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
          <button
            onClick={() => { startEdit(a.id); onClose() }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-700 rounded-lg hover:bg-red-800 transition-colors"
          >
            <Edit2 size={13} /> Edit assessment
          </button>
        </>
      }
    >
      <div className="p-6 space-y-6">
        {/* Hazard statement */}
        <div className={clsx('rounded-xl p-4 border', ood ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200')}>
          <p className={clsx('text-[10px] font-semibold uppercase tracking-widest mb-1', ood ? 'text-red-500' : 'text-slate-400')}>
            {ood ? '⚠ Overdue — ' : ''}Hazard statement
          </p>
          <p className="text-sm font-medium text-slate-900 leading-relaxed">{a.hazard}</p>
        </div>

        {/* Identification */}
        <Section title="Identification">
          <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
            <InfoRow label="Work area"   value={a.area} />
            <InfoRow label="Task"        value={a.task} />
            <InfoRow label="Category"    value={a.category} />
            <InfoRow label="FRS"         value={a.frs && a.frs !== 'Not applicable' ? a.frs : null} />
            <InfoRow label="Who at risk" value={a.who} />
          </div>
        </Section>

        {/* Risk ratings */}
        <Section title="Risk rating">
          <div className="grid grid-cols-2 gap-3">
            <RiskBlock label="Inherent risk (before controls)" l={a.lBefore} c={a.cBefore} />
            <RiskBlock label="Residual risk (after controls)"  l={a.lAfter}  c={a.cAfter} />
          </div>
          {sB > sA && (
            <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 size={13} />
              Controls reduced risk by {sB - sA} points ({RISK_CONFIG[riskLevel(sB)].label} → {RISK_CONFIG[riskLevel(sA)].label})
            </div>
          )}
        </Section>

        {/* Controls */}
        <Section title={`Controls in place (${(a.controls || []).length})`}>
          {(a.controls || []).length === 0 ? (
            <p className="text-sm text-slate-400 italic">No controls recorded.</p>
          ) : (
            <div className="space-y-2">
              {a.controls.map((c, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <ControlBadge type={c.type} />
                  <span className="text-sm text-slate-700 leading-snug">{c.desc}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Actions */}
        <Section title="Action tracking">
          <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100 mb-3">
            <InfoRow label="Owner"       value={a.owner} />
            <InfoRow label="Target date" value={a.date} />
            <InfoRow label="Review date" value={a.reviewDate} />
            <div className="flex items-center gap-3 py-2 px-0">
              <span className="text-xs text-slate-400 w-32 flex-shrink-0">Status</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={ood ? 'Overdue' : a.status} />
                <div className="flex gap-1 ml-2">
                  {['Open', 'In progress', 'Closed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(a.id, s)}
                      className={clsx(
                        'px-2 py-0.5 text-xs rounded border transition-colors',
                        a.status === s
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-800'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Required action banner */}
          <div className="rounded-xl p-3 border text-xs" style={{
            background: RISK_CONFIG[riskLevel(sA)].cell.bg,
            borderColor: RISK_CONFIG[riskLevel(sA)].cell.border,
            color: RISK_CONFIG[riskLevel(sA)].cell.text,
          }}>
            <span className="font-semibold">Required action: </span>
            {RISK_CONFIG[riskLevel(sA)].action}
          </div>
        </Section>
      </div>
    </Modal>
  )
}
