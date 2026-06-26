import clsx from 'clsx'
import { riskLevel, RISK_CONFIG, STATUS_COLORS } from '../../utils/risk.js'

export function RiskBadge({ score, className }) {
  const lvl = riskLevel(Number(score))
  const cfg = RISK_CONFIG[lvl]
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border', cfg.badge, className)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
      {cfg.label} — {score}
    </span>
  )
}

export function StatusBadge({ status, className }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS['Open']
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border', color, className)}>
      {status}
    </span>
  )
}

export function ControlBadge({ type }) {
  const map = {
    Eliminate:  'bg-red-50 text-red-700 border border-red-200',
    Substitute: 'bg-orange-50 text-orange-700 border border-orange-200',
    Engineer:   'bg-amber-50 text-amber-700 border border-amber-200',
    Admin:      'bg-blue-50 text-blue-700 border border-blue-200',
    PPE:        'bg-green-50 text-green-700 border border-green-200',
  }
  return (
    <span className={clsx('inline-flex px-1.5 py-0.5 rounded text-xs font-semibold flex-shrink-0', map[type] || map.Admin)}>
      {type}
    </span>
  )
}
