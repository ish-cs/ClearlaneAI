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

function Connector({ nextStatus }) {
  const isDanger = nextStatus === 'manual'
  const isWarning = nextStatus === 'partial'
  const color = isDanger ? '#EF4444' : isWarning ? '#F59E0B' : 'rgba(255,255,255,0.12)'
  const dasharray = isDanger || isWarning ? '4 3' : undefined

  return (
    <div className="flex items-center self-start mt-[42px] flex-shrink-0">
      <svg width="36" height="12" viewBox="0 0 36 12" fill="none">
        <line
          x1="0" y1="6" x2="28" y2="6"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray={dasharray}
        />
        <path
          d="M26 3l4 3-4 3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
        {/* Top color bar */}
        <div className={`h-0.5 w-full ${cfg.topBar}`} />

        <div className="p-4">
          {/* Status + hours row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.textColor}`}>
                {cfg.label}
              </span>
            </div>
            <span className="font-mono text-[10px] text-white/30">{step.weeklyHours}h/wk</span>
          </div>

          {/* Step name */}
          <p className="font-semibold text-white/90 text-sm leading-tight mb-1.5">{step.name}</p>

          {/* Description */}
          <p className="text-[11px] text-white/35 leading-relaxed mb-3">{step.description}</p>

          {/* Tool pill */}
          <span className="inline-flex items-center text-[10px] text-white/40 bg-white/[0.04] border border-white/[0.06] rounded-md px-2 py-1 font-medium">
            {step.tool}
          </span>

          {/* Fix / optimize button */}
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

          {open && step.recommendation && (
            <div className="mt-2 border border-teal/20 bg-teal/[0.06] rounded-lg p-3 space-y-2">
              <p className="text-[11px] font-semibold text-teal">{step.recommendation.tool}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/40">Save</span>
                  <span className="font-mono font-medium text-white/70">{step.recommendation.hourlySaving}h/wk</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/40">Annual impact</span>
                  <span className="font-mono font-semibold text-teal">
                    ${step.recommendation.annualSaving.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/40">Effort</span>
                  <span className="font-semibold text-teal">{step.recommendation.effort}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isLast && <Connector nextStatus={nextStatus} />}
    </div>
  )
}
