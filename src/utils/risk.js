export const riskScore = (l, c) => Number(l) * Number(c)

export const riskLevel = (score) => {
  if (score >= 17) return 'extreme'
  if (score >= 10) return 'high'
  if (score >= 5)  return 'medium'
  return 'low'
}

export const RISK_CONFIG = {
  extreme: {
    label: 'Extreme', short: 'E', priority: 4,
    badge: 'bg-red-100 text-red-800 border border-red-200',
    dot: 'bg-red-600',
    cell: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
    bar: '#DC2626',
    action: 'Stop work immediately. Senior management authorisation required before resuming.',
  },
  high: {
    label: 'High', short: 'H', priority: 3,
    badge: 'bg-orange-100 text-orange-800 border border-orange-200',
    dot: 'bg-orange-500',
    cell: { bg: '#FFEDD5', text: '#9A3412', border: '#FED7AA' },
    bar: '#EA580C',
    action: 'Additional controls required. Manager sign-off before work continues.',
  },
  medium: {
    label: 'Medium', short: 'M', priority: 2,
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
    dot: 'bg-amber-500',
    cell: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    bar: '#D97706',
    action: 'Controls must be implemented. Supervisor review required.',
  },
  low: {
    label: 'Low', short: 'L', priority: 1,
    badge: 'bg-green-100 text-green-800 border border-green-200',
    dot: 'bg-green-500',
    cell: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
    bar: '#16A34A',
    action: 'Manage through routine procedures and monitoring.',
  },
}

export const LIKELIHOOD_LABELS = {
  1: { label: 'Rare',           desc: 'Once in > 10 years' },
  2: { label: 'Unlikely',       desc: 'Once in 3–10 years' },
  3: { label: 'Possible',       desc: 'Once per year' },
  4: { label: 'Likely',         desc: 'Monthly' },
  5: { label: 'Almost certain', desc: 'Weekly / daily' },
}

export const CONSEQUENCE_LABELS = {
  1: { label: 'Insignificant', desc: 'First aid only' },
  2: { label: 'Minor',         desc: 'Medical treatment' },
  3: { label: 'Moderate',      desc: 'Lost time injury' },
  4: { label: 'Major',         desc: 'Permanent disability' },
  5: { label: 'Catastrophic',  desc: 'Fatality / multiple' },
}

export const HAZARD_CATEGORIES = [
  'Fall of ground',
  'Trackless mobile machinery',
  'Electricity',
  'Explosives and blasting',
  'Fire',
  'Flooding / inrush',
  'Material handling',
  'Occupational health (dust / noise / gas)',
  'Seismicity',
  'Shaft and hoisting',
  'Struck by / caught in',
  'Working at height',
  'Slips, trips and falls',
  'Chemical exposure',
  'Ergonomics',
  'Other',
]

export const FRS_OPTIONS = [
  'FRS 1 — Fall of ground',
  'FRS 2 — TMM and surface mobile',
  'FRS 3 — Explosives',
  'FRS 4 — Electricity',
  'FRS 5 — Fire',
  'FRS 6 — Inrush / flooding',
  'FRS 7 — Shaft and hoisting',
  'FRS 8 — Seismicity',
  'FRS 9 — Working at height',
  'FRS 10 — Machinery and equipment',
  'Not applicable',
]

export const CONTROL_TYPES = ['Eliminate', 'Substitute', 'Engineer', 'Admin', 'PPE']

export const CONTROL_COLORS = {
  Eliminate:  'bg-red-50 text-red-700 border-red-200',
  Substitute: 'bg-orange-50 text-orange-700 border-orange-200',
  Engineer:   'bg-amber-50 text-amber-700 border-amber-200',
  Admin:      'bg-blue-50 text-blue-700 border-blue-200',
  PPE:        'bg-green-50 text-green-700 border-green-200',
}

export const STATUS_COLORS = {
  'Open':        'bg-slate-100 text-slate-700 border-slate-200',
  'In progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Closed':      'bg-green-100 text-green-700 border-green-200',
  'Overdue':     'bg-red-100 text-red-700 border-red-200',
}

export const STATUS_OPTIONS = ['Open', 'In progress', 'Closed']

export function isOverdue(a) {
  if (!a.date || a.status === 'Closed') return false
  return a.date < new Date().toISOString().split('T')[0]
}

export function exportToCSV(assessments) {
  const headers = [
    'ID','Area','Task','Hazard','Category','FRS','Who',
    'L (before)','C (before)','Inherent Score','Inherent Level',
    'Controls',
    'L (after)','C (after)','Residual Score','Residual Level',
    'Owner','Target Date','Status',
  ]
  const rows = assessments.map((a) => {
    const sB = riskScore(a.lBefore, a.cBefore)
    const sA = riskScore(a.lAfter, a.cAfter)
    return [
      a.id,
      `"${(a.area   || '').replace(/"/g,'""')}"`,
      `"${(a.task   || '').replace(/"/g,'""')}"`,
      `"${(a.hazard || '').replace(/"/g,'""')}"`,
      a.category || '',
      a.frs      || '',
      `"${(a.who   || '').replace(/"/g,'""')}"`,
      a.lBefore, a.cBefore, sB, RISK_CONFIG[riskLevel(sB)]?.label || '',
      `"${(a.controls||[]).map(c=>`[${c.type}] ${c.desc}`).join('; ').replace(/"/g,'""')}"`,
      a.lAfter, a.cAfter, sA, RISK_CONFIG[riskLevel(sA)]?.label || '',
      a.owner || '', a.date || '', a.status || '',
    ].join(',')
  })
  const csv  = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `HIRA_Register_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
