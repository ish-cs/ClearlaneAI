import { useState } from 'react'
import { dataSources } from '../../data/mockData'

const INK   = '#1C1008'
const BROWN = '#7C5234'
const SAGE  = '#4A7062'
const AMBER = '#C4922A'
const RUST  = '#B44040'

const statusMap = {
  ai:      { label: 'AI-powered', color: SAGE,  bg: 'rgba(74,112,98,0.10)',   border: 'rgba(74,112,98,0.22)'   },
  partial: { label: 'Hybrid',     color: AMBER, bg: 'rgba(196,146,42,0.10)',  border: 'rgba(196,146,42,0.22)'  },
  manual:  { label: 'Manual',     color: RUST,  bg: 'rgba(180,64,64,0.10)',   border: 'rgba(180,64,64,0.22)'   },
}

function getScore(status, weeklyHours = 4) {
  if (status === 'ai')      return Math.min(96, 80 + Math.round((10 - Math.min(weeklyHours, 10)) * 1.6))
  if (status === 'partial') return Math.min(68, 38 + Math.round((8  - Math.min(weeklyHours, 8))  * 3))
  return Math.max(5, 32 - Math.round(weeklyHours * 1.8))
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2 last:border-0" style={{ borderBottom: '1px solid rgba(28,16,8,0.06)' }}>
      <span className="text-xs" style={{ color: 'rgba(28,16,8,0.40)' }}>{label}</span>
      <span className="text-xs font-mono font-semibold" style={{ color: accent ? BROWN : 'rgba(28,16,8,0.70)' }}>{value}</span>
    </div>
  )
}

const inputStyle = {
  background: 'rgba(28,16,8,0.03)',
  border: '1px solid rgba(28,16,8,0.10)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 14,
  color: 'rgba(28,16,8,0.80)',
  outline: 'none',
  width: '100%',
  fontFamily: 'DM Sans, sans-serif',
}
const labelStyle = {
  display: 'block',
  fontSize: 9,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.10em',
  color: 'rgba(28,16,8,0.35)',
  marginBottom: 6,
}

export default function NodePanel({ nodeId, step, workflow, onClose, onUpdate }) {
  const isNew = step?.isNew ?? false
  const [editing, setEditing] = useState(isNew)
  const [activeTool, setActiveTool] = useState(null)

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
  const canSave = form.name.trim() !== ''

  return (
    <div
      className="absolute top-0 right-0 h-full flex flex-col z-20"
      style={{ width: 340, background: '#F4F0E8', borderLeft: '1px solid rgba(28,16,8,0.10)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(28,16,8,0.09)' }}>
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              {cfg.label}
            </span>
            <span className="text-[10px] font-mono font-semibold" style={{ color: cfg.color }}>
              {score} / 100
            </span>
          </div>
          <h3 className="font-serif text-sm font-semibold leading-snug" style={{ color: INK }}>{step.name}</h3>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isNew && (
            <button
              onClick={() => {
                setEditing(e => !e)
                setForm({
                  name: step.name,
                  description: step.description ?? '',
                  tool: step.tool ?? '',
                  status: step.status ?? 'manual',
                  weeklyHours: step.weeklyHours ?? 0,
                  monthlyCost: step.monthlyCost ?? '',
                  weeklyVolume: step.weeklyVolume ?? '',
                  volumeUnit: step.volumeUnit ?? '',
                })
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={editing
                ? { background: 'rgba(124,82,52,0.12)', color: BROWN }
                : { background: 'rgba(28,16,8,0.05)', color: 'rgba(28,16,8,0.40)' }
              }
              title="Edit step"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgba(28,16,8,0.05)', color: 'rgba(28,16,8,0.40)' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="rgba(28,16,8,0.40)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {editing ? (
          <div className="px-5 py-4 space-y-4">
            {isNew && (
              <p className="text-xs rounded-lg px-3 py-2" style={{ color: 'rgba(28,16,8,0.55)', background: 'rgba(124,82,52,0.06)', border: '1px solid rgba(124,82,52,0.14)' }}>
                Fill in the step details below to add it to the workflow.
              </p>
            )}

            <div>
              <label style={labelStyle}>Step name</label>
              <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Email Copywriting" />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What happens in this step?" />
            </div>

            <div>
              <label style={labelStyle}>Tool used</label>
              <input style={inputStyle} value={form.tool} onChange={e => set('tool', e.target.value)} placeholder="e.g. Salesforce, Manual, ChatGPT" />
            </div>

            <div>
              <label style={labelStyle}>Automation type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'ai',      label: 'AI',     color: SAGE  },
                  { value: 'partial', label: 'Hybrid', color: AMBER },
                  { value: 'manual',  label: 'Manual', color: RUST  },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => set('status', opt.value)}
                    className="py-2 rounded-lg text-xs font-semibold transition-all"
                    style={form.status === opt.value
                      ? { color: opt.color, background: `${opt.color}18`, border: `1px solid ${opt.color}50` }
                      : { color: 'rgba(28,16,8,0.40)', background: 'rgba(28,16,8,0.03)', border: '1px solid rgba(28,16,8,0.09)' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Hours / week</label>
                <input type="number" min="0" step="0.5" style={inputStyle} value={form.weeklyHours} onChange={e => set('weeklyHours', e.target.value)} placeholder="0" />
              </div>
              <div>
                <label style={labelStyle}>Monthly cost ($)</label>
                <input type="number" min="0" style={inputStyle} value={form.monthlyCost} onChange={e => set('monthlyCost', e.target.value)} placeholder="Optional" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Weekly volume</label>
                <input type="number" min="0" style={inputStyle} value={form.weeklyVolume} onChange={e => set('weeklyVolume', e.target.value)} placeholder="e.g. 200" />
              </div>
              <div>
                <label style={labelStyle}>Volume unit</label>
                <input style={inputStyle} value={form.volumeUnit} onChange={e => set('volumeUnit', e.target.value)} placeholder="e.g. leads" />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
              style={canSave
                ? { background: '#3C2410', color: '#EDE9E2' }
                : { background: 'rgba(28,16,8,0.05)', color: 'rgba(28,16,8,0.25)', cursor: 'not-allowed' }
              }
            >
              {isNew ? 'Add to workflow' : 'Save changes'}
            </button>
            {!isNew && (
              <button
                onClick={() => setEditing(false)}
                className="w-full py-2 text-xs transition-colors"
                style={{ color: 'rgba(28,16,8,0.35)' }}
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div className="px-5 py-4 space-y-5">
            {step.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(28,16,8,0.50)' }}>{step.description}</p>
            )}

            {step.recommendation && (
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(28,16,8,0.35)' }}>Recommendation</p>
                <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(124,82,52,0.06)', border: '1px solid rgba(124,82,52,0.14)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: BROWN }}>{step.recommendation.tool}</span>
                    {step.recommendation.upliftLabel && (
                      <span className="text-[9px] font-semibold rounded-full px-2 py-0.5"
                        style={{ color: BROWN, background: 'rgba(124,82,52,0.10)', border: '1px solid rgba(124,82,52,0.20)' }}>
                        {step.recommendation.upliftLabel}
                      </span>
                    )}
                  </div>
                  {step.recommendation.rationale && (
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(28,16,8,0.50)' }}>{step.recommendation.rationale}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-2" style={{ borderTop: '1px solid rgba(28,16,8,0.08)' }}>
                    {[
                      ['Save/week', `${step.recommendation.hourlySaving}h`],
                      ['Annual',    `$${step.recommendation.annualSaving?.toLocaleString() ?? '—'}`],
                      ['Effort',    step.recommendation.effort],
                      ['Live in',   step.recommendation.timeToLive ?? '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(28,16,8,0.30)' }}>{k}</p>
                        <p className="text-xs font-mono font-semibold" style={{ color: 'rgba(28,16,8,0.70)' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(28,16,8,0.35)' }}>Metrics</p>
              <div className="rounded-xl px-4 py-1" style={{ background: 'rgba(28,16,8,0.02)', border: '1px solid rgba(28,16,8,0.06)' }}>
                <Row label="Time spent / week" value={`${step.weeklyHours}h`} />
                {step.weeklyVolume != null && <Row label="Volume / week" value={`${step.weeklyVolume.toLocaleString()} ${step.volumeUnit}`} />}
                {step.monthlyCost != null && <Row label="Monthly cost" value={`$${step.monthlyCost}`} accent />}
                {step.costPerUnit != null && step.costPerUnit > 0 && <Row label="Cost per unit" value={`$${step.costPerUnit.toFixed(2)} ${step.unitLabel}`} />}
                {step.dropoffPct != null && <Row label="Drop-off rate" value={`↓${step.dropoffPct}%`} />}
              </div>
            </div>

            {bottleneck && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(180,64,64,0.06)', border: '1px solid rgba(180,64,64,0.14)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: RUST }} />
                  <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: RUST }}>Bottleneck detected</p>
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: INK }}>{bottleneck.name}</p>
                <p className="text-xs" style={{ color: 'rgba(28,16,8,0.45)' }}>{bottleneck.impact}</p>
              </div>
            )}

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(28,16,8,0.35)' }}>Tool</p>
              <button
                onClick={() => setActiveTool(activeTool === step.tool ? null : step.tool)}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-colors"
                style={activeTool === step.tool
                  ? { background: 'rgba(124,82,52,0.08)', border: '1px solid rgba(124,82,52,0.20)' }
                  : { background: 'rgba(28,16,8,0.03)', border: '1px solid rgba(28,16,8,0.08)' }
                }
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(28,16,8,0.06)' }}>
                    <span className="text-[9px] font-bold" style={{ color: 'rgba(28,16,8,0.50)' }}>{step.tool?.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'rgba(28,16,8,0.70)' }}>{step.tool}</span>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className={`transition-transform ${activeTool === step.tool ? 'rotate-180' : ''}`}>
                  <path d="M2 4l4 4 4-4" stroke="rgba(28,16,8,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {activeTool === step.tool && (
                <div className="mt-2">
                  {stepSources.length > 0 ? (
                    <div className="rounded-xl p-3.5 space-y-2" style={{ background: 'rgba(124,82,52,0.05)', border: '1px solid rgba(124,82,52,0.14)' }}>
                      {stepSources.map(src => (
                        <div key={src.id}>
                          <p className="text-xs font-semibold mb-1" style={{ color: BROWN }}>{src.name}</p>
                          <p className="text-[10px] mb-2" style={{ color: 'rgba(28,16,8,0.40)' }}>{src.category}</p>
                          <div className="flex flex-wrap gap-1">
                            {src.dataProvided.map(d => (
                              <span key={d} className="text-[9px] rounded px-1.5 py-0.5"
                                style={{ color: 'rgba(28,16,8,0.50)', background: 'rgba(28,16,8,0.04)', border: '1px solid rgba(28,16,8,0.07)' }}>{d}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl p-3.5 text-center" style={{ background: 'rgba(28,16,8,0.02)', border: '1px solid rgba(28,16,8,0.06)' }}>
                      <p className="text-xs" style={{ color: 'rgba(28,16,8,0.30)' }}>No connected data source for this tool</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
