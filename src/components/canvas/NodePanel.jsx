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

export default function NodePanel({ step, workflow, onClose }) {
  const [activeTool, setActiveTool] = useState(null)

  if (!step) return null

  const cfg = statusMap[step.status] ?? statusMap.manual
  const score = getScore(step.status, step.weeklyHours)
  const bottleneck = workflow?.bottlenecks?.find(b =>
    step.name.toLowerCase().includes(b.step.split(' ')[0].toLowerCase()) ||
    b.step.toLowerCase().includes(step.name.split(' ')[0].toLowerCase())
  )

  // Find data sources that power this step
  const stepSources = dataSources.filter(ds =>
    ds.usedInWorkflows.some(u =>
      u.workflowId === workflow?.id &&
      (u.stepName === step.name || step.name.toLowerCase().includes(u.stepName.split(' ')[0].toLowerCase()))
    )
  )

  const toolDetail = activeTool ? dataSources.find(d => d.name === activeTool || step.tool.includes(d.name.split(' ')[0])) : null

  return (
    <div
      className="absolute top-0 right-0 h-full flex flex-col bg-sidebar border-l border-white/[0.06] z-20 overflow-y-auto"
      style={{ width: 340 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.05]">
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
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] flex items-center justify-center flex-shrink-0 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 px-5 py-4 space-y-5">
        {/* Description */}
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

        {/* Tools used */}
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
                <span className="text-[9px] font-bold text-white/50">
                  {step.tool.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-white/70">{step.tool}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform ${activeTool === step.tool ? 'rotate-180' : ''}`}>
              <path d="M2 4l4 4 4-4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Tool detail expand */}
          {activeTool === step.tool && stepSources.length > 0 && (
            <div className="mt-2 bg-teal/[0.05] border border-teal/15 rounded-xl p-3.5 space-y-2">
              {stepSources.map(src => (
                <div key={src.id}>
                  <p className="text-xs font-semibold text-teal mb-1">{src.name}</p>
                  <p className="text-[10px] text-white/30 mb-2">{src.category}</p>
                  <div className="flex flex-wrap gap-1">
                    {src.dataProvided.map(d => (
                      <span key={d} className="text-[9px] text-white/40 bg-white/[0.04] border border-white/[0.06] rounded px-1.5 py-0.5">
                        {d}
                      </span>
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
                  ['Annual', `$${step.recommendation.annualSaving.toLocaleString()}`],
                  ['Effort', step.recommendation.effort],
                  ['Live in', step.recommendation.timeToLive ?? '—'],
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
    </div>
  )
}
