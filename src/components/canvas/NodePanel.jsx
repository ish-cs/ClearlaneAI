import { useState } from 'react'
import { dataSources } from '../../data/mockData'

const statusMap = {
  ai:      { label: 'AI-powered',  color: '#00C9A7', bg: 'rgba(0,201,167,0.1)',  border: 'rgba(0,201,167,0.2)'  },
  partial: { label: 'Hybrid',      color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  manual:  { label: 'Manual',      color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'  },
}

function getScore(status, weeklyHours = 4) {
  if (status === 'ai')      return Math.min(96, 80 + Math.round((10 - Math.min(weeklyHours, 10)) * 1.6))
  if (status === 'partial') return Math.min(68, 38 + Math.round((8  - Math.min(weeklyHours, 8))  * 3))
  return Math.max(5, 32 - Math.round(weeklyHours * 1.8))
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-white/35">{label}</span>
      <span className={`text-xs font-mono font-semibold ${accent ? 'text-teal' : 'text-white/70'}`}>{value}</span>
    </div>
  )
}

const inputClass = "w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-teal/40 transition-colors placeholder:text-white/20"
const labelClass = "text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-1.5 block"

export default function NodePanel({ nodeId, step, workflow, onClose, onUpdate }) {
  const isNew = step?.isNew ?? false
  const [editing, setEditing] = useState(isNew)
  const [activeTool, setActiveTool] = useState(null)

  // Edit form state
  const [form, setForm] = useState({
    name:        step?.name        ?? '',
    description: step?.description ?? '',
    tool:        step?.tool        ?? '',
    status:      step?.status      ?? 'manual',
    weeklyHours: step?.weeklyHours ?? 0,
    monthlyCost: step?.monthlyCost ?? '',
    weeklyVolume: step?.weeklyVolume ?? '',
    volumeUnit:  step?.volumeUnit  ?? '',
  })

  if (!step) return null

  const cfg = statusMap[step.status] ?? statusMap.manual
  const score = getScore(step.status, step.weeklyHours)
  const bottleneck = workflow?.bottlenecks?.find(b =>
    step.name.toLowerCase().includes(b.step.split(' ')[0].toLowerCase()) ||
    b.step.toLowerCase().includes(step.name.split(' ')[0].toLowerCase())
  )

  const stepSources = dataSources.filter(ds =>
    ds.usedInWorkflows.some(u =>
      u.workflowId === workflow?.id &&
      (u.stepName === step.name || step.name.toLowerCase().includes(u.stepName.split(' ')[0].toLowerCase()))
    )
  )

  const handleSave = () => {
    onUpdate?.(nodeId, {
      ...form,
      weeklyHours:  Number(form.weeklyHours) || 0,
      monthlyCost:  form.monthlyCost !== '' ? Number(form.monthlyCost) : null,
      weeklyVolume: form.weeklyVolume !== '' ? Number(form.weeklyVolume) : null,
    })
    setEditing(false)
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div
      className="absolute top-0 right-0 h-full flex flex-col bg-sidebar border-l border-white/[0.06] z-20"
      style={{ width: 340 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.05] flex-shrink-0">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
              {cfg.label}
            </span>
            <span className="text-[10px] font-mono font-semibold" style={{ color: cfg.color }}>
              {score} / 100
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white/90 leading-snug">{step.name}</h3>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isNew && (
            <button
              onClick={() => { setEditing(e => !e); setForm({ name: step.name, description: step.description ?? '', tool: step.tool ?? '', status: step.status ?? 'manual', weeklyHours: step.weeklyHours ?? 0, monthlyCost: step.monthlyCost ?? '', weeklyVolume: step.weeklyVolume ?? '', volumeUnit: step.volumeUnit ?? '' }) }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${editing ? 'bg-teal/15 text-teal' : 'bg-white/[0.05] hover:bg-white/[0.08] text-white/40'}`}
              title="Edit step"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {editing ? (
          /* ── EDIT MODE ── */
          <div className="px-5 py-4 space-y-4">
            {isNew && (
              <p className="text-xs text-white/30 bg-teal/[0.06] border border-teal/15 rounded-lg px-3 py-2">
                Fill in the step details below to add it to the workflow.
              </p>
            )}

            <div>
              <label className={labelClass}>Step name</label>
              <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Email Copywriting" />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea className={`${inputClass} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What happens in this step?" />
            </div>

            <div>
              <label className={labelClass}>Tool used</label>
              <input className={inputClass} value={form.tool} onChange={e => set('tool', e.target.value)} placeholder="e.g. Salesforce, Manual, ChatGPT" />
            </div>

            <div>
              <label className={labelClass}>Automation type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'ai',      label: 'AI',     color: '#00C9A7' },
                  { value: 'partial', label: 'Hybrid',  color: '#F59E0B' },
                  { value: 'manual',  label: 'Manual',  color: '#EF4444' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => set('status', opt.value)}
                    className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                      form.status === opt.value
                        ? 'border-current'
                        : 'border-white/[0.08] text-white/30 hover:border-white/20'
                    }`}
                    style={form.status === opt.value ? { color: opt.color, background: `${opt.color}12`, borderColor: `${opt.color}40` } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Hours / week</label>
                <input type="number" min="0" step="0.5" className={inputClass} value={form.weeklyHours} onChange={e => set('weeklyHours', e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>Monthly cost ($)</label>
                <input type="number" min="0" className={inputClass} value={form.monthlyCost} onChange={e => set('monthlyCost', e.target.value)} placeholder="Optional" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Weekly volume</label>
                <input type="number" min="0" className={inputClass} value={form.weeklyVolume} onChange={e => set('weeklyVolume', e.target.value)} placeholder="e.g. 200" />
              </div>
              <div>
                <label className={labelClass}>Volume unit</label>
                <input className={inputClass} value={form.volumeUnit} onChange={e => set('volumeUnit', e.target.value)} placeholder="e.g. leads" />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-teal text-sidebar text-sm font-semibold hover:bg-teal/90 transition-colors"
            >
              {isNew ? 'Add to workflow' : 'Save changes'}
            </button>
            {!isNew && (
              <button onClick={() => setEditing(false)} className="w-full py-2 text-xs text-white/30 hover:text-white/50 transition-colors">
                Cancel
              </button>
            )}
          </div>
        ) : (
          /* ── READ MODE ── */
          <div className="px-5 py-4 space-y-5">
            <p className="text-sm text-white/45 leading-relaxed">{step.description}</p>

            {/* Metrics */}
            <div>
              <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Metrics</p>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-1">
                <Row label="Time spent / week" value={`${step.weeklyHours}h`} />
                {step.weeklyVolume != null && <Row label="Volume / week" value={`${step.weeklyVolume.toLocaleString()} ${step.volumeUnit}`} />}
                {step.monthlyCost != null && <Row label="Monthly cost" value={`$${step.monthlyCost}`} accent />}
                {step.costPerUnit != null && step.costPerUnit > 0 && <Row label="Cost per unit" value={`$${step.costPerUnit.toFixed(2)} ${step.unitLabel}`} />}
                {step.dropoffPct != null && <Row label="Drop-off rate" value={`↓${step.dropoffPct}%`} />}
              </div>
            </div>

            {/* Bottleneck */}
            {bottleneck && (
              <div className="bg-red-500/[0.06] border border-red-500/15 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-widest">Bottleneck detected</p>
                </div>
                <p className="text-sm font-semibold text-white/80 mb-1">{bottleneck.name}</p>
                <p className="text-xs text-white/40">{bottleneck.impact}</p>
              </div>
            )}

            {/* Tool */}
            <div>
              <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Tool</p>
              <button
                onClick={() => setActiveTool(activeTool === step.tool ? null : step.tool)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  activeTool === step.tool
                    ? 'bg-teal/[0.08] border-teal/20'
                    : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white/50">{step.tool?.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-white/70">{step.tool}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className={`transition-transform ${activeTool === step.tool ? 'rotate-180' : ''}`}>
                  <path d="M2 4l4 4 4-4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {activeTool === step.tool && stepSources.length > 0 && (
                <div className="mt-2 bg-teal/[0.05] border border-teal/15 rounded-xl p-3.5 space-y-2">
                  {stepSources.map(src => (
                    <div key={src.id}>
                      <p className="text-xs font-semibold text-teal mb-1">{src.name}</p>
                      <p className="text-[10px] text-white/30 mb-2">{src.category}</p>
                      <div className="flex flex-wrap gap-1">
                        {src.dataProvided.map(d => (
                          <span key={d} className="text-[9px] text-white/40 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5">{d}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendation */}
            {step.recommendation && (
              <div>
                <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2">Recommendation</p>
                <div className="bg-teal/[0.06] border border-teal/15 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-teal">{step.recommendation.tool}</span>
                    {step.recommendation.upliftLabel && (
                      <span className="text-[10px] font-semibold text-teal bg-teal/10 border border-teal/20 rounded-full px-2 py-0.5">
                        {step.recommendation.upliftLabel}
                      </span>
                    )}
                  </div>
                  {step.recommendation.rationale && (
                    <p className="text-xs text-white/40 leading-relaxed">{step.recommendation.rationale}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.05]">
                    {[
                      ['Save/week', `${step.recommendation.hourlySaving}h`],
                      ['Annual',    `$${step.recommendation.annualSaving.toLocaleString()}`],
                      ['Effort',    step.recommendation.effort],
                      ['Live in',   step.recommendation.timeToLive ?? '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[9px] text-white/25 uppercase tracking-wider mb-0.5">{k}</p>
                        <p className="text-xs font-mono font-semibold text-white/70">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
