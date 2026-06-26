import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { AlertTriangle, TrendingUp, CheckCircle2, Clock, ArrowRight, PlusCircle } from 'lucide-react'
import { useStore } from '../../store/useStore.js'
import { riskScore, riskLevel, RISK_CONFIG, isOverdue } from '../../utils/risk.js'
import { RiskBadge, StatusBadge } from '../ui/Badge.jsx'
import { AssessmentDetailModal } from '../ui/AssessmentDetailModal.jsx'
import { useState } from 'react'
import clsx from 'clsx'

const LEVELS = ['extreme', 'high', 'medium', 'low']

function StatCard({ label, value, sub, icon: Icon, iconBg, valueColor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={clsx('text-3xl font-bold mt-1 font-mono', valueColor || 'text-slate-800')}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={clsx('p-2.5 rounded-xl flex-shrink-0', iconBg)}>
        <Icon size={19} className={valueColor || 'text-slate-600'} />
      </div>
    </div>
  )
}

export function Dashboard() {
  const { assessments, setPage, startNew, startEdit } = useStore()
  const [viewingId, setViewingId] = useState(null)

  const counts = { extreme: 0, high: 0, medium: 0, low: 0 }
  assessments.forEach((a) => { counts[riskLevel(riskScore(a.lAfter, a.cAfter))]++ })

  const catMap = {}
  assessments.forEach((a) => { if (a.category) catMap[a.category] = (catMap[a.category] || 0) + 1 })
  const catData = Object.entries(catMap)
    .map(([name, count]) => ({ name: name.length > 24 ? name.slice(0, 22) + '…' : name, count }))
    .sort((a, b) => b.count - a.count).slice(0, 8)

  const pieData = LEVELS.filter((l) => counts[l] > 0).map((l) => ({
    name: RISK_CONFIG[l].label, value: counts[l], color: RISK_CONFIG[l].bar,
  }))

  const overdue = assessments.filter(isOverdue)
  const closed  = assessments.filter((a) => a.status === 'Closed').length
  const recent  = [...assessments].slice(0, 6)

  return (
    <div className="p-8 space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total hazards"   value={assessments.length} sub="all assessments"   icon={TrendingUp}   iconBg="bg-slate-100"  valueColor="text-slate-800" />
        <StatCard label="Extreme risk"    value={counts.extreme}     sub="stop-work items"   icon={AlertTriangle} iconBg="bg-red-50"    valueColor="text-red-700"  />
        <StatCard label="Overdue actions" value={overdue.length}     sub="past target date"  icon={Clock}         iconBg="bg-amber-50"  valueColor="text-amber-600"/>
        <StatCard label="Closed out"      value={closed}             sub={`of ${assessments.length} total`} icon={CheckCircle2} iconBg="bg-green-50" valueColor="text-green-700"/>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Pie */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Residual risk distribution</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {LEVELS.map((l) => (
                  <div key={l} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: RISK_CONFIG[l].bar }} />
                      <span className="text-xs text-slate-500">{RISK_CONFIG[l].label}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800 font-mono">{counts[l]}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-3 text-slate-400">
              <p className="text-sm">No data yet</p>
              <button onClick={startNew} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                <PlusCircle size={12} /> Add first assessment
              </button>
            </div>
          )}
        </div>

        {/* Bar */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-4">Hazards by category</p>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={catData} layout="vertical" margin={{ left: 0, right: 24, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={148} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {catData.map((_, i) => <Cell key={i} fill="#B91C1C" fillOpacity={1 - i * 0.07} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-400 text-sm">No data yet.</div>
          )}
        </div>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle size={14} /> {overdue.length} overdue action{overdue.length !== 1 ? 's' : ''}
            </h3>
            <button onClick={() => setPage('register')} className="text-xs text-red-700 hover:underline flex items-center gap-1 font-medium">
              View all in register <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-2">
            {overdue.slice(0, 3).map((a) => (
              <div key={a.id} className="bg-white rounded-lg border border-red-200 px-4 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.hazard.slice(0, 75)}{a.hazard.length > 75 ? '…' : ''}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.area} · Due {a.date} · {a.owner || 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <RiskBadge score={riskScore(a.lAfter, a.cAfter)} />
                  <button onClick={() => setViewingId(a.id)} className="px-2.5 py-1 text-xs font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                    View
                  </button>
                  <button onClick={() => startEdit(a.id)} className="px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Recent assessments</p>
          <button onClick={() => setPage('register')} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors">
            View all <ArrowRight size={11} />
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400 text-sm mb-3">No assessments yet.</p>
            <button onClick={startNew} className="flex items-center gap-1.5 mx-auto px-4 py-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <PlusCircle size={14} /> Create first assessment
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((a) => {
              const sA = riskScore(a.lAfter, a.cAfter)
              return (
                <div key={a.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setViewingId(a.id)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{a.hazard.slice(0, 70)}{a.hazard.length > 70 ? '…' : ''}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.area} · {a.category}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RiskBadge score={sA} />
                    <StatusBadge status={isOverdue(a) ? 'Overdue' : a.status} />
                    <span className="text-xs text-slate-400 group-hover:text-slate-700 transition-colors hidden sm:block">View →</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AssessmentDetailModal open={!!viewingId} onClose={() => setViewingId(null)} assessmentId={viewingId} />
    </div>
  )
}
