import { Bell, Download, PlusCircle } from 'lucide-react'
import { useStore } from '../store/useStore.js'
import { exportToCSV, isOverdue } from '../utils/risk.js'

const META = {
  dashboard:  { title: 'Dashboard',           sub: 'Risk overview and key metrics' },
  register:   { title: 'Risk register',       sub: 'All hazard assessments' },
  assessment: { title: 'Hazard assessment',   sub: 'Complete all four steps' },
  matrix:     { title: 'Risk matrix',         sub: '5×5 likelihood × consequence matrix' },
  controls:   { title: 'Fatal risk controls', sub: 'Critical control library — all 10 FRS' },
}

export function Header() {
  const { currentPage, assessments, startNew } = useStore()
  const meta         = META[currentPage] || META.dashboard
  const overdueCount = assessments.filter(isOverdue).length

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">
      <div>
        <h1 className="text-base font-semibold text-slate-900">{meta.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{meta.sub}</p>
      </div>

      <div className="flex items-center gap-2">
        {currentPage === 'register' && (
          <button
            onClick={() => exportToCSV(assessments)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download size={13} />
            Export CSV
          </button>
        )}

        {currentPage !== 'assessment' && (
          <button
            onClick={startNew}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition-colors"
          >
            <PlusCircle size={13} />
            New assessment
          </button>
        )}

        <div className="relative ml-1">
          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <Bell size={17} />
          </button>
          {overdueCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full" />
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold ml-1">
          SS
        </div>
      </div>
    </header>
  )
}
