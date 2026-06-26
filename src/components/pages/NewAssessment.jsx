import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, ChevronLeft, Plus, Trash2, Check, AlertTriangle, Info } from 'lucide-react'
import { useStore } from '../../store/useStore.js'
import {
  riskScore, riskLevel, RISK_CONFIG,
  LIKELIHOOD_LABELS, CONSEQUENCE_LABELS,
  HAZARD_CATEGORIES, FRS_OPTIONS, CONTROL_TYPES, CONTROL_COLORS,
} from '../../utils/risk.js'
import clsx from 'clsx'

const STEPS = [
  { label: 'Identification',       desc: 'Area, task, hazard' },
  { label: 'Inherent risk',        desc: 'Before controls' },
  { label: 'Controls',             desc: 'Hierarchy of controls' },
  { label: 'Residual risk',        desc: 'After controls + actions' },
]

const BLANK = {
  area: '', task: '', hazard: '', category: '', frs: '', who: '',
  lBefore: null, cBefore: null,
  controls: [{ type: 'Admin', desc: '' }],
  lAfter: null, cAfter: null,
  owner: '', date: '', status: 'Open', reviewDate: '',
}

/* ── Step indicator ── */
function StepBar({ current }) {
  return (
    <div className="flex items-start mb-8">
      {STEPS.map((s, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                done   ? 'bg-green-600  border-green-600  text-white'  :
                active ? 'bg-red-700   border-red-700   text-white'  :
                         'bg-white border-slate-200 text-slate-400'
              )}>
                {done ? <Check size={13} /> : i + 1}
              </div>
              <div className="text-center">
                <p className={clsx('text-[11px] font-semibold leading-tight', active ? 'text-red-700' : done ? 'text-green-700' : 'text-slate-400')}>{s.label}</p>
                <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">{s.desc}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('flex-1 h-0.5 mx-2 mt-4', i < current ? 'bg-green-400' : 'bg-slate-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Rating selector ── */
function RatingSelector({ label, caption, value, onChange, options }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">{label}</p>
      {caption && <p className="text-xs text-slate-400 mb-3">{caption}</p>}
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={clsx(
              'flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all select-none',
              value === n
                ? 'border-red-400 bg-red-50 ring-2 ring-red-200 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            )}
          >
            <span className="text-lg font-bold text-slate-800 leading-none">{n}</span>
            <span className="text-[10px] font-semibold text-slate-600 leading-tight">{options[n].label}</span>
            <span className="text-[9px] text-slate-400 leading-tight">{options[n].desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Risk score display ── */
function ScoreCard({ l, c, label }) {
  if (!l || !c) return (
    <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-sm text-slate-400">
      Select both likelihood and consequence to see the score.
    </div>
  )
  const s   = riskScore(l, c)
  const cfg = RISK_CONFIG[riskLevel(s)]
  return (
    <div className="mt-4 p-4 rounded-xl border" style={{ background: cfg.cell.bg, borderColor: cfg.cell.border }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: cfg.cell.text }}>{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono" style={{ color: cfg.cell.text }}>{s}</span>
            <span className="text-sm font-bold" style={{ color: cfg.cell.text }}>{cfg.label}</span>
          </div>
          <p className="text-xs mt-1" style={{ color: cfg.cell.text }}>L{l} × C{c} = {s}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <AlertTriangle size={24} style={{ color: cfg.cell.text }} />
        </div>
      </div>
      <div className="mt-3 p-2.5 rounded-lg text-xs leading-relaxed" style={{ background: 'rgba(0,0,0,0.06)', color: cfg.cell.text }}>
        <span className="font-bold">Required action: </span>{cfg.action}
      </div>
    </div>
  )
}

/* ── Field wrapper ── */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle size={11} />{error}</p>}
    </div>
  )
}

const input = (err) => clsx(
  'w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 transition-all',
  err
    ? 'border-red-400 focus:ring-red-200'
    : 'border-slate-200 focus:border-red-400 focus:ring-red-200'
)

/* ── Main component ── */
export function NewAssessment() {
  const { assessments, editingId, addAssessment, updateAssessment, setPage } = useStore()
  const existing = editingId ? assessments.find((a) => a.id === editingId) : null

  const [step,   setStep]   = useState(0)
  const [form,   setForm]   = useState(existing ? { ...existing } : { ...BLANK })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const src = editingId ? assessments.find((a) => a.id === editingId) : null
    setForm(src ? { ...src } : { ...BLANK })
    setStep(0)
    setErrors({})
  }, [editingId]) // eslint-disable-line react-hooks/exhaustive-deps

  const setField = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), [])

  const addControl = () => setForm((f) => ({ ...f, controls: [...f.controls, { type: 'Admin', desc: '' }] }))

  const removeControl = (i) => setForm((f) => ({ ...f, controls: f.controls.filter((_, idx) => idx !== i) }))

  const updateControl = (i, key, val) => setForm((f) => ({
    ...f, controls: f.controls.map((c, idx) => idx === i ? { ...c, [key]: val } : c),
  }))

  const validate = () => {
    const e = {}
    if (step === 0) {
      if (!form.area.trim())   e.area    = 'Work area is required'
      if (!form.task.trim())   e.task    = 'Task is required'
      if (!form.hazard.trim()) e.hazard  = 'Hazard description is required'
      if (!form.category)      e.category= 'Select a hazard category'
    }
    if (step === 1) {
      if (!form.lBefore) e.lBefore = 'Select a likelihood rating'
      if (!form.cBefore) e.cBefore = 'Select a consequence rating'
    }
    if (step === 3) {
      if (!form.lAfter) e.lAfter = 'Select a likelihood rating'
      if (!form.cAfter) e.cAfter = 'Select a consequence rating'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate()) setStep((s) => s + 1) }
  const back = () => { setStep((s) => s - 1); setErrors({}) }

  const submit = () => {
    if (!validate()) return
    const payload = {
      ...form,
      lBefore: Number(form.lBefore), cBefore: Number(form.cBefore),
      lAfter:  Number(form.lAfter),  cAfter:  Number(form.cAfter),
      controls: form.controls.filter((c) => c.desc.trim()),
    }
    if (editingId) updateAssessment(editingId, payload)
    else           addAssessment(payload)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {editingId ? 'Edit assessment' : 'New hazard assessment'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
            </div>
            {editingId && (
              <span className="text-[11px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded">
                ID: {editingId}
              </span>
            )}
          </div>
          <StepBar current={step} />
        </div>

        <div className="px-6 py-6">
          {/* ── Step 0: Identification ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Work area / location" required error={errors.area}>
                  <input value={form.area} onChange={(e) => setField('area', e.target.value)}
                    placeholder="e.g. Level 66 — West panel stope" className={input(errors.area)} />
                </Field>
                <Field label="Task / activity" required error={errors.task}>
                  <input value={form.task} onChange={(e) => setField('task', e.target.value)}
                    placeholder="e.g. Scaling and support installation" className={input(errors.task)} />
                </Field>
              </div>
              <Field label="Hazard description" required error={errors.hazard}>
                <textarea rows={3} value={form.hazard} onChange={(e) => setField('hazard', e.target.value)}
                  placeholder="Describe the hazard clearly — what could go wrong and why…"
                  className={input(errors.hazard)} style={{ resize: 'vertical' }} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Hazard category" required error={errors.category}>
                  <select value={form.category} onChange={(e) => setField('category', e.target.value)} className={input(errors.category)}>
                    <option value="">Select category</option>
                    {HAZARD_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Fatal risk standard">
                  <select value={form.frs} onChange={(e) => setField('frs', e.target.value)} className={input()}>
                    <option value="">Select FRS (optional)</option>
                    {FRS_OPTIONS.map((f) => <option key={f}>{f}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Who / what could be harmed?">
                <input value={form.who} onChange={(e) => setField('who', e.target.value)}
                  placeholder="e.g. Stope miners, rock drill operators, visitors"
                  className={input()} />
              </Field>
            </div>
          )}

          {/* ── Step 1: Inherent risk ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <Info size={15} className="flex-shrink-0 mt-0.5" />
                Rate the risk <strong className="mx-1">before</strong> any controls are applied — worst-case scenario.
              </div>
              <RatingSelector label="Likelihood (L)" caption="How often could this hazard lead to harm?" value={form.lBefore} onChange={(v) => setField('lBefore', v)} options={LIKELIHOOD_LABELS} />
              {errors.lBefore && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={11}/>{errors.lBefore}</p>}
              <RatingSelector label="Consequence (C)" caption="What is the worst credible outcome if the hazard is realised?" value={form.cBefore} onChange={(v) => setField('cBefore', v)} options={CONSEQUENCE_LABELS} />
              {errors.cBefore && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={11}/>{errors.cBefore}</p>}
              <ScoreCard l={form.lBefore} c={form.cBefore} label="Inherent risk score" />
            </div>
          )}

          {/* ── Step 2: Controls ── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Hierarchy header */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Hierarchy of controls — most effective first</p>
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {CONTROL_TYPES.map((t) => (
                    <div key={t} className={clsx('text-center py-1.5 px-1 rounded-lg text-[11px] font-bold border', CONTROL_COLORS[t])}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Control rows */}
              <div className="space-y-2">
                {form.controls.map((ctrl, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <select
                      value={ctrl.type}
                      onChange={(e) => updateControl(i, 'type', e.target.value)}
                      className="px-2.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-200 w-32 flex-shrink-0"
                    >
                      {CONTROL_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <input
                      value={ctrl.desc}
                      onChange={(e) => updateControl(i, 'desc', e.target.value)}
                      placeholder="Describe the control measure in detail…"
                      className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeControl(i)}
                      disabled={form.controls.length === 1}
                      className="p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addControl}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-500 border border-dashed border-slate-300 rounded-xl hover:border-red-400 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <Plus size={14} /> Add control measure
              </button>
            </div>
          )}

          {/* ── Step 3: Residual risk + actions ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
                <Info size={15} className="flex-shrink-0 mt-0.5" />
                Rate the risk <strong className="mx-1">after</strong> all controls are in place. This residual score drives the required management action.
              </div>
              <RatingSelector label="Likelihood after controls (L)" value={form.lAfter} onChange={(v) => setField('lAfter', v)} options={LIKELIHOOD_LABELS} />
              {errors.lAfter && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={11}/>{errors.lAfter}</p>}
              <RatingSelector label="Consequence after controls (C)" value={form.cAfter} onChange={(v) => setField('cAfter', v)} options={CONSEQUENCE_LABELS} />
              {errors.cAfter && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle size={11}/>{errors.cAfter}</p>}
              <ScoreCard l={form.lAfter} c={form.cAfter} label="Residual risk score" />

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                <Field label="Responsible person">
                  <input value={form.owner} onChange={(e) => setField('owner', e.target.value)}
                    placeholder="Full name of owner" className={input()} />
                </Field>
                <Field label="Target close date">
                  <input type="date" value={form.date} onChange={(e) => setField('date', e.target.value)} className={input()} />
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setField('status', e.target.value)} className={input()}>
                    <option>Open</option>
                    <option>In progress</option>
                    <option>Closed</option>
                  </select>
                </Field>
                <Field label="Next review date">
                  <input type="date" value={form.reviewDate} onChange={(e) => setField('reviewDate', e.target.value)} className={input()} />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={step === 0 ? () => setPage('register') : back}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-white hover:border-slate-300 transition-colors"
          >
            <ChevronLeft size={15} />
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex items-center gap-2">
            {/* Progress dots */}
            {STEPS.map((_, i) => (
              <span key={i} className={clsx('w-1.5 h-1.5 rounded-full transition-all', i === step ? 'bg-red-700 w-4' : i < step ? 'bg-green-500' : 'bg-slate-300')} />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-700 rounded-xl hover:bg-red-800 active:scale-95 transition-all"
            >
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-700 rounded-xl hover:bg-red-800 active:scale-95 transition-all"
            >
              <Check size={15} />
              {editingId ? 'Save changes' : 'Save to register'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
