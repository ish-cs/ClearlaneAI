import { useNavigate } from 'react-router-dom'
import { workflows, workflowSteps, roiSummary, recentAlerts, topOpportunities } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'

const severityConfig = {
  high:   { color: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/20',   dot: 'bg-red-400'   },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  low:    { color: 'text-white/30',  bg: 'bg-white/[0.04]', border: 'border-white/[0.08]', dot: 'bg-white/25'  },
}

const trendConfig = {
  improving: { icon: '↑', color: 'text-teal' },
  stable:    { icon: '→', color: 'text-white/30' },
  worsening: { icon: '↓', color: 'text-red-400' },
}

const deptColors = {
  Sales: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  Finance: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Operations: 'bg-teal/10 text-teal border-teal/20',
  Marketing: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Support: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  HR: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
}

function impactTier(saving) {
  if (saving >= 20000) return { label: 'High Impact', color: 'text-teal', bg: 'bg-teal/10', border: 'border-teal/20' }
  if (saving >= 8000)  return { label: 'Med Impact',  color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
  return { label: 'Low Impact', color: 'text-white/30', bg: 'bg-white/[0.04]', border: 'border-white/[0.08]' }
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
      <div className="mb-7">
        <h1 className="text-lg font-semibold text-white/90 tracking-tight">Dashboard</h1>
        <p className="text-sm text-white/30 mt-0.5">RevOps command center — Acme Corp</p>
      </div>

      {/* Hero metrics */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-teal/[0.08] border border-teal/15 rounded-xl px-5 py-4">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">Annual savings potential</p>
          <p className="font-mono text-2xl font-semibold text-teal leading-none">
            ${(roiSummary.annualSavingsPotential / 1000).toFixed(0)}k
          </p>
          <p className="text-[10px] text-white/25 mt-1.5">if all recommendations applied</p>
        </div>
        <div className="bg-card border border-white/[0.06] rounded-xl px-5 py-4">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2.5">Avg AI adoption</p>
          <p className="font-mono text-2xl font-semibold text-white/90 leading-none">{avgScore}%</p>
          <p className="text-[10px] text-white/25 mt-1.5">across {workflows.length} workflows</p>
        </div>
        <div className="bg-card border border-white/[0.06] rounded-xl px-5 py-4">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2.5">Manual hrs / week</p>
          <p className="font-mono text-2xl font-semibold text-white/90 leading-none">{totalManualHrs}h</p>
          <p className="text-[10px] text-white/25 mt-1.5">across all workflow steps</p>
        </div>
        <div className={`border rounded-xl px-5 py-4 ${criticalAlerts > 0 ? 'bg-red-500/[0.06] border-red-500/15' : 'bg-card border-white/[0.06]'}`}>
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2.5">Active alerts</p>
          <p className={`font-mono text-2xl font-semibold leading-none ${criticalAlerts > 0 ? 'text-red-400' : 'text-white/90'}`}>
            {recentAlerts.length}
          </p>
          <p className="text-[10px] text-white/25 mt-1.5">{criticalAlerts} critical</p>
        </div>
      </div>

      {/* Needs attention */}
      {needsAttention.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">
              Needs attention — {needsAttention.length} workflow{needsAttention.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {needsAttention.map(w => {
              const steps = workflowSteps[w.id] || []
              const manualHrs = steps.filter(s => s.status === 'manual').reduce((s, st) => s + st.weeklyHours, 0)
              const trend = trendConfig[w.trend] ?? trendConfig.stable
              const deptClass = deptColors[w.department] ?? 'bg-white/5 text-white/40 border-white/10'
              return (
                <button
                  key={w.id}
                  onClick={() => navigate(`/workflows/${w.id}`)}
                  className="text-left bg-red-500/[0.04] border border-red-500/15 rounded-xl p-4 hover:border-red-500/30 hover:bg-red-500/[0.07] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide mb-1.5 ${deptClass}`}>
                        {w.department}
                      </span>
                      <p className="text-sm font-semibold text-white/90">{w.name}</p>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono">
                    <span className="text-red-400 font-semibold">{w.aiScore}% AI</span>
                    <span className="text-white/30">{w.bottlenecks?.length ?? 0} bottlenecks</span>
                    <span className="text-white/30">{manualHrs}h manual/wk</span>
                    <span className={`ml-auto font-semibold ${trend.color}`}>{trend.icon} {w.trend}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottlenecks + Opportunities */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Top Bottlenecks */}
        <div className="bg-card border border-white/[0.06] rounded-xl p-5">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-4">Top bottlenecks</p>
          <div className="space-y-2">
            {allBottlenecks.slice(0, 5).map((b, i) => {
              const sc = severityConfig[b.severity] ?? severityConfig.low
              return (
                <button
                  key={i}
                  onClick={() => navigate(`/workflows/${b.workflowId}`)}
                  className="w-full flex items-start gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] transition-colors text-left"
                >
                  <span className={`font-mono text-xs font-semibold text-white/15 w-4 flex-shrink-0 mt-0.5`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/80 leading-tight">{b.name}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{b.workflow} · {b.impact}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${sc.bg} ${sc.color} ${sc.border}`}>
                    {b.severity}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Top Opportunities */}
        <div className="bg-card border border-white/[0.06] rounded-xl p-5">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-4">Top opportunities</p>
          <div className="space-y-2">
            {topOpportunities.slice(0, 5).map((opp, i) => {
              const tier = impactTier(opp.annualSaving)
              const wfId = opp.workflowId
              return (
                <button
                  key={i}
                  onClick={() => navigate(`/workflows/${wfId}`)}
                  className="w-full flex items-start gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] transition-colors text-left"
                >
                  <span className="font-mono text-xs font-semibold text-white/15 w-4 flex-shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-white/80 leading-tight">{opp.stepName}</p>
                    </div>
                    <p className="text-[10px] text-white/30">{opp.workflow} · Replace with {opp.tool}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-mono text-sm font-semibold text-teal">${(opp.annualSaving / 1000).toFixed(0)}k/yr</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${tier.bg} ${tier.color} ${tier.border}`}>
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
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Workflow health</p>
        <div className="grid grid-cols-3 gap-3">
          {workflows.map(w => {
            const steps = workflowSteps[w.id] || []
            const manualHrs = steps.filter(s => s.status === 'manual').reduce((s, st) => s + st.weeklyHours, 0)
            const trend = trendConfig[w.trend] ?? trendConfig.stable
            const scoreColor = w.aiScore >= 70 ? 'text-teal' : w.aiScore >= 40 ? 'text-amber-400' : 'text-red-400'
            const deptClass = deptColors[w.department] ?? 'bg-white/5 text-white/40 border-white/10'
            return (
              <button
                key={w.id}
                onClick={() => navigate(`/workflows/${w.id}`)}
                className="text-left bg-card border border-white/[0.06] rounded-xl p-4 hover:border-teal/30 hover:bg-card-2 transition-all"
              >
                <div className="flex items-start justify-between mb-2.5">
                  <div>
                    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide mb-1.5 ${deptClass}`}>
                      {w.department}
                    </span>
                    <p className="text-sm font-semibold text-white/90 leading-tight">{w.name}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className={`font-semibold ${scoreColor}`}>{w.aiScore}%</span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/30">{w.bottlenecks?.length ?? 0} issues</span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/30">{manualHrs}h manual</span>
                  <span className={`ml-auto font-semibold text-xs ${trend.color}`}>{trend.icon}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mt-6">
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">Recent alerts</p>
        <div className="bg-card border border-white/[0.06] rounded-xl divide-y divide-white/[0.04]">
          {recentAlerts.map(alert => {
            const sc = severityConfig[alert.severity] ?? severityConfig.low
            return (
              <button
                key={alert.id}
                onClick={() => navigate(`/workflows/${alert.workflowId}`)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors text-left"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-white/70 font-medium">{alert.workflow}</span>
                  <span className="text-white/20 mx-2 text-xs">·</span>
                  <span className="text-xs text-white/45">{alert.message}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-white/25 font-mono">{alert.timestamp}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
