import { useNavigate } from 'react-router-dom'
import { workflows, workflowSteps, roiSummary, recentAlerts, topOpportunities } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'

const INK = '#1C1008'
const BROWN = '#7C5234'
const STEEL = '#3D6080'
const SAGE = '#4A7062'
const RUST = '#B44040'
const AMBER = '#C4922A'

const severityConfig = {
  high:   { color: RUST,  bg: 'rgba(180,64,64,0.08)',   border: 'rgba(180,64,64,0.18)',  dot: RUST  },
  medium: { color: AMBER, bg: 'rgba(196,146,42,0.08)',  border: 'rgba(196,146,42,0.18)', dot: AMBER },
  low:    { color: `rgba(${INK},0.3)`, bg: 'rgba(28,16,8,0.04)', border: 'rgba(28,16,8,0.09)', dot: 'rgba(28,16,8,0.25)' },
}

const trendConfig = {
  improving: { icon: '↑', color: SAGE },
  stable:    { icon: '→', color: 'rgba(28,16,8,0.30)' },
  worsening: { icon: '↓', color: RUST },
}

const deptStyle = {
  Sales:      { bg: 'rgba(124,82,52,0.08)',  color: BROWN, border: 'rgba(124,82,52,0.18)' },
  Finance:    { bg: 'rgba(61,96,128,0.08)',  color: STEEL, border: 'rgba(61,96,128,0.18)' },
  Operations: { bg: 'rgba(74,112,98,0.08)',  color: SAGE,  border: 'rgba(74,112,98,0.18)' },
  Marketing:  { bg: 'rgba(180,64,64,0.08)',  color: RUST,  border: 'rgba(180,64,64,0.18)' },
  Support:    { bg: 'rgba(196,146,42,0.08)', color: AMBER, border: 'rgba(196,146,42,0.18)' },
  HR:         { bg: 'rgba(100,80,140,0.08)', color: '#64508C', border: 'rgba(100,80,140,0.18)' },
}

function impactTier(saving) {
  if (saving >= 20000) return { label: 'High Impact', color: SAGE,  bg: 'rgba(74,112,98,0.08)',  border: 'rgba(74,112,98,0.18)'  }
  if (saving >= 8000)  return { label: 'Med Impact',  color: AMBER, bg: 'rgba(196,146,42,0.08)', border: 'rgba(196,146,42,0.18)' }
  return                      { label: 'Low Impact',  color: 'rgba(28,16,8,0.35)', bg: 'rgba(28,16,8,0.04)', border: 'rgba(28,16,8,0.09)' }
}

function Eyebrow({ children }) {
  return <p className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'rgba(28,16,8,0.35)' }}>{children}</p>
}

function SectionLabel({ children }) {
  return <p className="text-[9px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(28,16,8,0.35)', letterSpacing: '0.12em' }}>{children}</p>
}

export default function Dashboard() {
  const navigate = useNavigate()

  const totalManualHrs = Object.values(workflowSteps).flat()
    .filter(s => s.status === 'manual')
    .reduce((sum, s) => sum + s.weeklyHours, 0)

  const criticalAlerts = recentAlerts.filter(a => a.severity === 'high').length

  const needsAttention = workflows
    .filter(w => w.status === 'needs-attention' || w.aiScore < 40)
    .sort((a, b) => a.aiScore - b.aiScore)

  const allBottlenecks = workflows
    .flatMap(w => (w.bottlenecks || []).map(b => ({ ...b, workflow: w.name, dept: w.department, workflowId: w.id })))
    .sort((a, b) => ({ high: 3, medium: 2, low: 1 }[b.severity] - ({ high: 3, medium: 2, low: 1 }[a.severity])))

  const avgScore = Math.round(workflows.reduce((s, w) => s + w.aiScore, 0) / workflows.length)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: BROWN, letterSpacing: '0.14em' }}>Command Center</p>
        <h1 className="font-serif text-3xl font-semibold" style={{ color: INK }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(28,16,8,0.45)' }}>RevOps intelligence — Acme Corp</p>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-4 gap-3 mb-7">
        <div className="rounded-xl px-5 py-4 border" style={{ background: 'rgba(124,82,52,0.07)', borderColor: 'rgba(124,82,52,0.18)' }}>
          <Eyebrow>Annual savings potential</Eyebrow>
          <p className="font-mono text-2xl font-semibold leading-none mt-2.5" style={{ color: BROWN }}>
            ${(roiSummary.annualSavingsPotential / 1000).toFixed(0)}k
          </p>
          <p className="text-[10px] mt-1.5" style={{ color: 'rgba(28,16,8,0.35)' }}>if all recommendations applied</p>
        </div>
        <div className="bg-card border rounded-xl px-5 py-4">
          <Eyebrow>Avg AI adoption</Eyebrow>
          <p className="font-mono text-2xl font-semibold leading-none mt-2.5" style={{ color: INK }}>{avgScore}%</p>
          <p className="text-[10px] mt-1.5" style={{ color: 'rgba(28,16,8,0.35)' }}>across {workflows.length} workflows</p>
        </div>
        <div className="bg-card border rounded-xl px-5 py-4">
          <Eyebrow>Manual hrs / week</Eyebrow>
          <p className="font-mono text-2xl font-semibold leading-none mt-2.5" style={{ color: INK }}>{totalManualHrs}h</p>
          <p className="text-[10px] mt-1.5" style={{ color: 'rgba(28,16,8,0.35)' }}>across all workflow steps</p>
        </div>
        <div className="rounded-xl px-5 py-4 border" style={{
          background: criticalAlerts > 0 ? 'rgba(180,64,64,0.06)' : '#FAFAF8',
          borderColor: criticalAlerts > 0 ? 'rgba(180,64,64,0.18)' : 'rgba(28,16,8,0.09)',
        }}>
          <Eyebrow>Active alerts</Eyebrow>
          <p className="font-mono text-2xl font-semibold leading-none mt-2.5" style={{ color: criticalAlerts > 0 ? RUST : INK }}>
            {recentAlerts.length}
          </p>
          <p className="text-[10px] mt-1.5" style={{ color: 'rgba(28,16,8,0.35)' }}>{criticalAlerts} critical</p>
        </div>
      </div>

      {/* Needs attention */}
      {needsAttention.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: RUST }} />
            <SectionLabel>Needs attention — {needsAttention.length} workflow{needsAttention.length > 1 ? 's' : ''}</SectionLabel>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {needsAttention.map(w => {
              const steps = workflowSteps[w.id] || []
              const manualHrs = steps.filter(s => s.status === 'manual').reduce((s, st) => s + st.weeklyHours, 0)
              const trend = trendConfig[w.trend] ?? trendConfig.stable
              const dept = deptStyle[w.department] ?? deptStyle.Sales
              return (
                <button
                  key={w.id}
                  onClick={() => navigate(`/workflows/${w.id}`)}
                  className="text-left rounded-xl p-4 transition-all border"
                  style={{ background: 'rgba(180,64,64,0.04)', borderColor: 'rgba(180,64,64,0.15)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(180,64,64,0.28)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(180,64,64,0.15)'}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="inline-flex items-center text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide mb-1.5"
                        style={{ background: dept.bg, color: dept.color, border: `1px solid ${dept.border}` }}>
                        {w.department}
                      </span>
                      <p className="font-serif text-sm font-semibold" style={{ color: INK }}>{w.name}</p>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono">
                    <span className="font-semibold" style={{ color: RUST }}>{w.aiScore}% AI</span>
                    <span style={{ color: 'rgba(28,16,8,0.35)' }}>{w.bottlenecks?.length ?? 0} bottlenecks</span>
                    <span style={{ color: 'rgba(28,16,8,0.35)' }}>{manualHrs}h manual/wk</span>
                    <span className="ml-auto font-semibold" style={{ color: trend.color }}>{trend.icon} {w.trend}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottlenecks + Opportunities */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        <div className="bg-card border rounded-xl p-5">
          <SectionLabel>Top bottlenecks</SectionLabel>
          <div className="space-y-2">
            {allBottlenecks.slice(0, 5).map((b, i) => {
              const sc = severityConfig[b.severity] ?? severityConfig.low
              return (
                <button
                  key={i}
                  onClick={() => navigate(`/workflows/${b.workflowId}`)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left border"
                  style={{ background: 'rgba(28,16,8,0.02)', borderColor: 'rgba(28,16,8,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(28,16,8,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(28,16,8,0.02)'}
                >
                  <span className="font-mono text-xs font-semibold w-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(28,16,8,0.18)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight" style={{ color: 'rgba(28,16,8,0.80)' }}>{b.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(28,16,8,0.35)' }}>{b.workflow} · {b.impact}</p>
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    {b.severity}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5">
          <SectionLabel>Top opportunities</SectionLabel>
          <div className="space-y-2">
            {topOpportunities.slice(0, 5).map((opp, i) => {
              const tier = impactTier(opp.annualSaving)
              return (
                <button
                  key={i}
                  onClick={() => navigate(`/workflows/${opp.workflowId}`)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left border"
                  style={{ background: 'rgba(28,16,8,0.02)', borderColor: 'rgba(28,16,8,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(28,16,8,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(28,16,8,0.02)'}
                >
                  <span className="font-mono text-xs font-semibold w-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(28,16,8,0.18)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-tight" style={{ color: 'rgba(28,16,8,0.80)' }}>{opp.stepName}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(28,16,8,0.35)' }}>{opp.workflow} · Replace with {opp.tool}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-mono text-sm font-semibold" style={{ color: BROWN }}>${(opp.annualSaving / 1000).toFixed(0)}k/yr</span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: tier.bg, color: tier.color, border: `1px solid ${tier.border}` }}>
                      {tier.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Workflow Health Grid */}
      <div>
        <SectionLabel>Workflow health</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          {workflows.map(w => {
            const steps = workflowSteps[w.id] || []
            const manualHrs = steps.filter(s => s.status === 'manual').reduce((s, st) => s + st.weeklyHours, 0)
            const trend = trendConfig[w.trend] ?? trendConfig.stable
            const scoreColor = w.aiScore >= 70 ? SAGE : w.aiScore >= 40 ? AMBER : RUST
            const dept = deptStyle[w.department] ?? deptStyle.Sales
            return (
              <button
                key={w.id}
                onClick={() => navigate(`/workflows/${w.id}`)}
                className="text-left bg-card border rounded-xl p-4 transition-all"
                style={{ borderColor: 'rgba(28,16,8,0.09)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,82,52,0.28)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(28,16,8,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(28,16,8,0.09)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <span className="inline-flex text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide mb-1.5"
                      style={{ background: dept.bg, color: dept.color, border: `1px solid ${dept.border}` }}>
                      {w.department}
                    </span>
                    <p className="font-serif text-sm font-semibold leading-tight" style={{ color: INK }}>{w.name}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="font-semibold" style={{ color: scoreColor }}>{w.aiScore}%</span>
                  <span style={{ color: 'rgba(28,16,8,0.15)' }}>·</span>
                  <span style={{ color: 'rgba(28,16,8,0.35)' }}>{w.bottlenecks?.length ?? 0} issues</span>
                  <span style={{ color: 'rgba(28,16,8,0.15)' }}>·</span>
                  <span style={{ color: 'rgba(28,16,8,0.35)' }}>{manualHrs}h manual</span>
                  <span className="ml-auto font-semibold text-xs" style={{ color: trend.color }}>{trend.icon}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mt-7">
        <SectionLabel>Recent alerts</SectionLabel>
        <div className="bg-card border rounded-xl divide-y" style={{ borderColor: 'rgba(28,16,8,0.09)', '--tw-divide-opacity': 1 }}>
          {recentAlerts.map(alert => {
            const sc = severityConfig[alert.severity] ?? severityConfig.low
            return (
              <button
                key={alert.id}
                onClick={() => navigate(`/workflows/${alert.workflowId}`)}
                className="w-full flex items-center gap-4 px-5 py-3.5 transition-colors text-left"
                style={{ borderColor: 'rgba(28,16,8,0.06)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(28,16,8,0.02)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.dot }} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium" style={{ color: 'rgba(28,16,8,0.70)' }}>{alert.workflow}</span>
                  <span className="mx-2 text-xs" style={{ color: 'rgba(28,16,8,0.18)' }}>·</span>
                  <span className="text-xs" style={{ color: 'rgba(28,16,8,0.45)' }}>{alert.message}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(28,16,8,0.28)' }}>{alert.timestamp}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
