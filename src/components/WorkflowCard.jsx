import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

const deptColors = {
  Sales: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Finance: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Operations: 'bg-teal/10 text-teal border-teal/20',
  Marketing: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Support: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  HR: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
}

// Half-arc (speedometer) gauge
function GaugeScore({ score }) {
  const r = 26
  const cx = 32
  const cy = 32
  // Semicircle from left to right, opening upward
  const halfCirc = Math.PI * r // ≈ 81.68
  const filled = (score / 100) * halfCirc
  const color = score >= 70 ? '#00C9A7' : score >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col items-center">
      <svg width="64" height="38" viewBox="0 0 64 38">
        {/* Track */}
        <path
          d={`M 6 32 A 26 26 0 0 1 58 32`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M 6 32 A 26 26 0 0 1 58 32`}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${halfCirc}`}
        />
        {/* Score label */}
        <text
          x="32"
          y="29"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize="11"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="600"
        >
          {score}%
        </text>
      </svg>
    </div>
  )
}

export default function WorkflowCard({ workflow }) {
  const navigate = useNavigate()
  const { id, name, department, aiScore, weeklyHours, savingsPotential, steps, manualSteps, status } = workflow
  const deptClass = deptColors[department] ?? 'bg-white/5 text-white/40 border-white/10'

  return (
    <div
      onClick={() => navigate(`/workflows/${id}`)}
      className="bg-card border border-white/[0.06] rounded-xl p-5 cursor-pointer hover:border-teal/30 hover:bg-card-2 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide mb-2 ${deptClass}`}>
            {department}
          </span>
          <h3 className="font-semibold text-white/90 text-sm leading-snug group-hover:text-white transition-colors">
            {name}
          </h3>
        </div>
        <GaugeScore score={aiScore} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Weekly hrs</p>
          <p className="font-mono text-sm font-semibold text-white/80">{weeklyHours}h</p>
        </div>
        <div className="bg-teal/[0.05] border border-teal/10 rounded-lg px-3 py-2.5">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Savings / yr</p>
          <p className="font-mono text-sm font-semibold text-teal">
            ${(savingsPotential / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-white/40">{steps} steps</span>
          {manualSteps > 0 && (
            <>
              <span className="text-white/15">·</span>
              <span className="text-red-400/80">{manualSteps} manual</span>
            </>
          )}
        </div>
        <StatusBadge status={status} />
      </div>
    </div>
  )
}
