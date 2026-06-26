import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { useStore } from '../../store/useStore.js'
import clsx from 'clsx'

const CONFIG = {
  success: { icon: CheckCircle2, cls: 'bg-white border-green-300 text-green-800', icon_cls: 'text-green-600' },
  info:    { icon: Info,         cls: 'bg-white border-blue-300  text-blue-800',  icon_cls: 'text-blue-600'  },
  warning: { icon: AlertTriangle,cls: 'bg-white border-amber-300 text-amber-800', icon_cls: 'text-amber-600' },
}

export function Toast() {
  const { toast, dismissToast } = useStore()
  if (!toast) return null

  const { icon: Icon, cls, icon_cls } = CONFIG[toast.type] || CONFIG.info

  return (
    <div className="fixed bottom-6 right-6 z-[200] pointer-events-none">
      <div className={clsx(
        'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-64 max-w-sm',
        cls
      )}>
        <Icon size={16} className={clsx('flex-shrink-0', icon_cls)} />
        <span className="text-sm font-medium flex-1">{toast.message}</span>
        <button onClick={dismissToast} className="text-slate-400 hover:text-slate-600 transition-colors p-0.5">
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
