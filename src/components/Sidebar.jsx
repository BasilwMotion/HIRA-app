import { LayoutDashboard, ClipboardList, PlusCircle, Grid3X3, ShieldCheck, AlertTriangle, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { riskScore, riskLevel, isOverdue } from '../utils/risk.js'
import clsx from 'clsx'

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'register',   label: 'Risk register',  icon: ClipboardList   },
  { id: 'assessment', label: 'New assessment', icon: PlusCircle      },
  { id: 'matrix',     label: 'Risk matrix',    icon: Grid3X3         },
  { id: 'controls',   label: 'FRS controls',   icon: ShieldCheck     },
]

export function Sidebar() {
  const { currentPage, setPage, startNew, assessments } = useStore()

  const extremeCount = assessments.filter((a) => riskLevel(riskScore(a.lAfter, a.cAfter)) === 'extreme' && a.status !== 'Closed').length
  const overdueCount = assessments.filter(isOverdue).length

  const handleNav = (id) => {
    if (id === 'assessment') startNew()
    else setPage(id)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-slate-900 flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={17} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-tight tracking-tight">HIRA Platform</div>
            <div className="text-slate-500 text-[10px] mt-0.5 font-mono uppercase tracking-widest">
              Sibanye methodology
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(extremeCount > 0 || overdueCount > 0) && (
        <div className="px-3 pt-3 space-y-1.5">
          {extremeCount > 0 && (
            <button
              onClick={() => setPage('register')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/40 border border-red-800/50 text-red-300 text-xs hover:bg-red-900/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              {extremeCount} extreme risk{extremeCount > 1 ? 's' : ''} open
            </button>
          )}
          {overdueCount > 0 && (
            <button
              onClick={() => setPage('register')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-900/30 border border-amber-800/40 text-amber-300 text-xs hover:bg-amber-900/50 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              {overdueCount} overdue action{overdueCount > 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-red-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {active && <ChevronRight size={13} className="opacity-50" />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="text-slate-600 text-[10px] font-mono uppercase tracking-widest">MHSA Compliant · v1.0</div>
        <div className="text-slate-700 text-[10px] mt-0.5">© {new Date().getFullYear()} Sibanye-Stillwater</div>
      </div>
    </aside>
  )
}
