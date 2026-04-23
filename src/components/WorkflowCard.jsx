import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { workflowSteps } from '../data/mockData'

const deptColors = {
  Sales:      { bg: 'rgba(124,82,52,0.08)',  color: '#7C5234',  border: 'rgba(124,82,52,0.18)' },
  Finance:    { bg: 'rgba(61,96,128,0.08)',  color: '#3D6080',  border: 'rgba(61,96,128,0.18)' },
  Operations: { bg: 'rgba(74,112,98,0.08)',  color: '#4A7062',  border: 'rgba(74,112,98,0.18)' },
  Marketing:  { bg: 'rgba(180,64,64,0.08)',  color: '#B44040',  border: 'rgba(180,64,64,0.18)' },
  Support:    { bg: 'rgba(196,146,42,0.08)', color: '#C4922A',  border: 'rgba(196,146,42,0.18)' },
  HR:         { bg: 'rgba(100,80,140,0.08)', color: '#64508C',  border: 'rgba(100,80,140,0.18)' },
}

const trendConfig = {
  improving: { icon: '↑', color: '#4A7062' },
  stable:    { icon: '→', color: 'rgba(28,16,8,0.30)' },
  worsening: { icon: '↓', color: '#B44040' },
}

function impactTier(saving) {
  if (saving >= 25000) return { label: 'High Impact', bg: 'rgba(124,82,52,0.08)', color: '#7C5234', border: 'rgba(124,82,52,0.18)' }
  if (saving >= 10000) return { label: 'Med Impact',  bg: 'rgba(196,146,42,0.08)', color: '#C4922A', border: 'rgba(196,146,42,0.18)' }
  return                      { label: 'Low Impact',  bg: 'rgba(28,16,8,0.04)', color: 'rgba(28,16,8,0.35)', border: 'rgba(28,16,8,0.08)' }
}

function GaugeScore({ score }) {
  const r = 26
  const halfCirc = Math.PI * r
  const filled = (score / 100) * halfCirc
  const color = score >= 70 ? '#4A7062' : score >= 40 ? '#C4922A' : '#B44040'
  const track = 'rgba(28,16,8,0.07)'

  return (
    <div className="flex flex-col items-center">
      <svg width="64" height="38" viewBox="0 0 64 38">
        <path d="M 6 32 A 26 26 0 0 1 58 32" fill="none" stroke={track} strokeWidth="5" strokeLinecap="round" />
        <path d="M 6 32 A 26 26 0 0 1 58 32" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${filled} ${halfCirc}`} />
        <text x="32" y="29" textAnchor="middle" dominantBaseline="middle" fill={color}
          fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="600">
          {score}%
        </text>
      </svg>
    </div>
  )
}

export default function WorkflowCard({ workflow }) {
  const navigate = useNavigate()
  const { id, name, department, aiScore, weeklyHours, savingsPotential, steps, manualSteps, status, bottlenecks, trend } = workflow
  const dept    = deptColors[department] ?? deptColors.Sales
  const trendCfg = trendConfig[trend] ?? trendConfig.stable
  const tier     = impactTier(savingsPotential)

  const wfSteps = workflowSteps[id] ?? []
  const topOpp  = wfSteps
    .filter(s => s.recommendation)
    .sort((a, b) => b.recommendation.annualSaving - a.recommendation.annualSaving)[0]

  const criticalBottlenecks = (bottlenecks ?? []).filter(b => b.severity === 'high').length

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/workflows/${id}`)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/workflows/${id}`) }}
      className="bg-card border rounded-xl p-5 cursor-pointer transition-all group focus:outline-none"
      style={{ borderColor: 'rgba(28,16,8,0.09)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,82,52,0.30)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(28,16,8,0.06)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(28,16,8,0.09)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="inline-flex items-center text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: dept.bg, color: dept.color, border: `1px solid ${dept.border}` }}>
              {department}
            </span>
            <span className="inline-flex items-center text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
              {tier.label}
            </span>
          </div>
          <h3 className="font-serif font-semibold text-ink text-base leading-snug">
            {name}
          </h3>
        </div>
        <GaugeScore score={aiScore} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(28,16,8,0.04)', border: '1px solid rgba(28,16,8,0.07)' }}>
          <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'rgba(28,16,8,0.35)' }}>Weekly hrs</p>
          <p className="font-mono text-sm font-semibold" style={{ color: 'rgba(28,16,8,0.75)' }}>{weeklyHours}h</p>
        </div>
        <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(124,82,52,0.06)', border: '1px solid rgba(124,82,52,0.12)' }}>
          <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'rgba(28,16,8,0.35)' }}>Savings / yr</p>
          <p className="font-mono text-sm font-semibold" style={{ color: '#7C5234' }}>
            ${(savingsPotential / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {topOpp && (
        <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(124,82,52,0.04)', border: '1px solid rgba(124,82,52,0.10)' }}>
          <p className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'rgba(28,16,8,0.25)' }}>Top opportunity</p>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium truncate pr-2" style={{ color: 'rgba(28,16,8,0.55)' }}>{topOpp.name} → {topOpp.recommendation.tool}</p>
            <span className="text-[10px] font-mono font-semibold flex-shrink-0" style={{ color: '#7C5234' }}>
              ${(topOpp.recommendation.annualSaving / 1000).toFixed(0)}k/yr
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(28,16,8,0.08)' }}>
        <div className="flex items-center gap-2 text-[11px]">
          <span style={{ color: 'rgba(28,16,8,0.40)' }}>{steps} steps</span>
          {manualSteps > 0 && (
            <>
              <span style={{ color: 'rgba(28,16,8,0.15)' }}>·</span>
              <span style={{ color: '#B44040' }}>{manualSteps} manual</span>
            </>
          )}
          {criticalBottlenecks > 0 && (
            <>
              <span style={{ color: 'rgba(28,16,8,0.15)' }}>·</span>
              <span style={{ color: '#B44040' }}>{criticalBottlenecks} critical</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: trendCfg.color }}>{trendCfg.icon}</span>
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  )
}
