import { useState } from 'react'

const statusConfig = {
  ai: {
    label: 'AI-powered',
    topBar: 'bg-teal',
    border: 'border-white/[0.06]',
    bg: 'bg-card',
    dot: 'bg-teal',
    textColor: 'text-teal',
  },
  partial: {
    label: 'Partial',
    topBar: 'bg-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/[0.04]',
    dot: 'bg-amber-400',
    textColor: 'text-amber-400',
  },
  manual: {
    label: 'Manual',
    topBar: 'bg-red-500',
    border: 'border-red-500/20',
    bg: 'bg-red-500/[0.05]',
    dot: 'bg-red-400',
    textColor: 'text-red-400',
  },
}

function Connector({ nextStatus, dropoffPct }) {
  const isDanger = nextStatus === 'manual'
  const isWarning = nextStatus === 'partial'
  const color = isDanger ? '#EF4444' : isWarning ? '#F59E0B' : 'rgba(255,255,255,0.12)'
  const dasharray = isDanger || isWarning ? '4 3' : undefined

  return (
    <div className="flex flex-col items-center self-start mt-[42px] flex-shrink-0 px-0.5">
      {dropoffPct != null && (
        <span className="text-[9px] font-mono font-semibold text-red-400 mb-1 whitespace-nowrap">
          ↓{dropoffPct}%
        </span>
      )}
      <svg width="36" height="12" viewBox="0 0 36 12" fill="none">
        <line x1="0" y1="6" x2="28" y2="6" stroke={color} strokeWidth="1.5" strokeDasharray={dasharray} />
        <path d="M26 3l4 3-4 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function StepCard({ step, isLast, nextStatus }) {
  const [open, setOpen] = useState(false)
  const cfg = statusConfig[step.status]

  return (
    <div className="flex items-start">
      <div className={`relative flex-shrink-0 w-48 border rounded-xl overflow-hidden ${cfg.border} ${cfg.bg}`}>
        <div className={`h-0.5 w-full ${cfg.topBar}`} />

        <div className="p-4">
          {/* Status + hours */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.textColor}`}>
                {cfg.label}
              </span>
            </div>
            <span className="font-mono text-[10px] text-white/30">{step.weeklyHours}h/wk</span>
          </div>

          {/* Name + description */}
          <p className="font-semibold text-white/90 text-sm leading-tight mb-1.5">{step.name}</p>
          <p className="text-[11px] text-white/35 leading-relaxed mb-3">{step.description}</p>

          {/* Tool pill */}
          <span className="inline-flex items-center text-[10px] text-white/40 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-1 font-medium mb-2">
            {step.tool}
          </span>

          {/* Cost row */}
          {step.monthlyCost != null && (
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-white/25">${step.monthlyCost}/mo</span>
              {step.costPerUnit > 0 && (
                <span className="text-white/25 font-mono">${step.costPerUnit.toFixed(2)} {step.unitLabel}</span>
              )}
            </div>
          )}

          {/* Volume */}
          {step.weeklyVolume != null && (
            <div className="mt-1.5">
              <span className="text-[10px] font-mono text-white/20">
                {step.weeklyVolume.toLocaleString()} {step.volumeUnit}/wk
              </span>
            </div>
          )}

          {/* Fix / Optimize button */}
          {step.recommendation && (
            <button
              onClick={() => setOpen(!open)}
              className={`mt-3 w-full text-[11px] rounded-lg px-2.5 py-2 font-semibold flex items-center justify-between transition-colors ${
                step.status === 'manual'
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15'
                  : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/15'
              }`}
            >
              <span>{step.status === 'manual' ? 'Fix available' : 'Optimize'}</span>
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`transition-transform ${open ? 'rotate-180' : ''}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {/* Expanded recommendation */}
          {open && step.recommendation && (
            <div className="mt-2 border border-teal/20 bg-teal/[0.06] rounded-lg p-3 space-y-2.5">
              {/* Tool vs current */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-teal">{step.recommendation.tool}</span>
                {step.recommendation.vs && (
                  <>
                    <span className="text-[10px] text-white/20">vs</span>
                    <span className="text-[10px] text-white/35">{step.recommendation.vs}</span>
                  </>
                )}
              </div>

              {/* Uplift badge */}
              {step.recommendation.upliftLabel && (
                <span className="inline-flex items-center text-[10px] font-semibold text-teal bg-teal/10 border border-teal/20 rounded-full px-2 py-0.5">
                  {step.recommendation.upliftLabel}
                </span>
              )}

              {/* Rationale */}
              {step.recommendation.rationale && (
                <p className="text-[10px] text-white/40 leading-relaxed">{step.recommendation.rationale}</p>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-white/[0.05]">
                <div>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">Save / wk</p>
                  <p className="font-mono text-xs font-semibold text-white/70">{step.recommendation.hourlySaving}h</p>
                </div>
                <div>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">Annual</p>
                  <p className="font-mono text-xs font-semibold text-teal">${step.recommendation.annualSaving.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] text-white/25 uppercase tracking-wider">Effort</p>
                  <p className="text-xs font-semibold text-teal">{step.recommendation.effort}</p>
                </div>
                {step.recommendation.timeToLive && (
                  <div>
                    <p className="text-[9px] text-white/25 uppercase tracking-wider">Live in</p>
                    <p className="text-xs font-semibold text-white/60">{step.recommendation.timeToLive}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isLast && <Connector nextStatus={nextStatus} dropoffPct={step.dropoffPct} />}
    </div>
  )
}
