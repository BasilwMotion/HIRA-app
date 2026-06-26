import { useState } from 'react'
import { useStore } from '../../store/useStore.js'
import { riskScore, riskLevel, RISK_CONFIG, LIKELIHOOD_LABELS, CONSEQUENCE_LABELS } from '../../utils/risk.js'
import { RiskBadge } from '../ui/Badge.jsx'
import { AssessmentDetailModal } from '../ui/AssessmentDetailModal.jsx'
import clsx from 'clsx'

export function RiskMatrix() {
  const { assessments, startNew, startEdit } = useStore()
  const [selected,  setSelected]  = useState(null)
  const [viewingId, setViewingId] = useState(null)

  const atCell = (l, c) => assessments.filter((a) => Number(a.lAfter) === l && Number(a.cAfter) === c)

  const handleCell = (l, c) =>
    setSelected((prev) => prev?.l === l && prev?.c === c ? null : { l, c })

  const selItems = selected ? atCell(selected.l, selected.c) : []

  return (
    <div className="p-8 space-y-5">
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {['low', 'medium', 'high', 'extreme'].map((lv) => {
          const cfg = RISK_CONFIG[lv]
          return (
            <div key={lv} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm">
              <span className="w-3 h-3 rounded flex-shrink-0" style={{ background: cfg.cell.bg, border: `1px solid ${cfg.cell.border}` }} />
              <span className="font-semibold text-slate-700">{cfg.label}</span>
              <span className="text-slate-400 text-xs">{lv === 'low' ? '1–4' : lv === 'medium' ? '5–9' : lv === 'high' ? '10–16' : '17–25'}</span>
            </div>
          )
        })}
        <p className="ml-auto self-center text-xs text-slate-400">Hover a cell to preview · Click to see assessments</p>
      </div>

      {/* Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-[560px]">
          {/* Y label */}
          <div className="flex items-center justify-center w-5 flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Likelihood →
            </span>
          </div>

          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((l) => (
              <div key={l} className="flex gap-2 mb-2 items-center">
                {/* Row label */}
                <div className="w-36 flex-shrink-0 pr-3 text-right">
                  <p className="text-xs font-semibold text-slate-700">L{l} — {LIKELIHOOD_LABELS[l].label}</p>
                  <p className="text-[10px] text-slate-400">{LIKELIHOOD_LABELS[l].desc}</p>
                </div>

                {/* Cells */}
                {[1, 2, 3, 4, 5].map((c) => {
                  const s    = riskScore(l, c)
                  const lv   = riskLevel(s)
                  const cfg  = RISK_CONFIG[lv]
                  const items = atCell(l, c)
                  const isSel = selected?.l === l && selected?.c === c

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCell(l, c)}
                      className={clsx(
                        'relative flex-1 aspect-square min-w-[52px] rounded-xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400',
                        isSel ? 'border-slate-700 shadow-lg scale-105 z-10' : 'border-transparent'
                      )}
                      style={{ background: cfg.cell.bg, borderColor: isSel ? '#1e293b' : cfg.cell.border }}
                      title={`L${l} × C${c} = ${s} (${cfg.label})`}
                    >
                      <span className="text-xl font-bold font-mono leading-none" style={{ color: cfg.cell.text }}>{s}</span>
                      <span className="text-[10px] font-bold" style={{ color: cfg.cell.text }}>{cfg.short}</span>
                      {items.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-800 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-md">
                          {items.length}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}

            {/* X axis */}
            <div className="flex gap-2 ml-[9.5rem]">
              {[1, 2, 3, 4, 5].map((c) => (
                <div key={c} className="flex-1 text-center min-w-[52px]">
                  <p className="text-xs font-semibold text-slate-700">C{c}</p>
                  <p className="text-[10px] text-slate-400">{CONSEQUENCE_LABELS[c].label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Consequence →</p>
          </div>
        </div>
      </div>

      {/* Selected cell panel */}
      {selected && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiskBadge score={riskScore(selected.l, selected.c)} />
              <span className="text-sm text-slate-600">
                L{selected.l} ({LIKELIHOOD_LABELS[selected.l].label}) × C{selected.c} ({CONSEQUENCE_LABELS[selected.c].label})
              </span>
              <span className="text-xs text-slate-400">— {selItems.length} assessment{selItems.length !== 1 ? 's' : ''}</span>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
              Deselect
            </button>
          </div>

          {selItems.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-slate-400 text-sm mb-3">No assessments at this rating.</p>
              <button
                onClick={startNew}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-700 rounded-xl hover:bg-red-800 transition-colors"
              >
                + New assessment at this level
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {selItems.map((a) => (
                <div key={a.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">{a.hazard.slice(0, 80)}{a.hazard.length > 80 ? '…' : ''}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.area} · {a.category}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setViewingId(a.id)} className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                      View
                    </button>
                    <button onClick={() => startEdit(a.id)} className="px-3 py-1.5 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action thresholds */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Required management actions by risk level</p>
        </div>
        <div className="divide-y divide-slate-50">
          {['extreme', 'high', 'medium', 'low'].map((lv) => {
            const cfg = RISK_CONFIG[lv]
            return (
              <div key={lv} className="px-5 py-3 flex items-start gap-4">
                <div className="flex-shrink-0 w-20">
                  <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border', cfg.badge)}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{cfg.action}</p>
              </div>
            )
          })}
        </div>
      </div>

      <AssessmentDetailModal open={!!viewingId} onClose={() => setViewingId(null)} assessmentId={viewingId} />
    </div>
  )
}
