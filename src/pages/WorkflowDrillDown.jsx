import { useParams, useNavigate } from 'react-router-dom'
import { workflows, workflowSteps } from '../data/mockData'
import StepCard from '../components/StepCard'
import StatusBadge from '../components/StatusBadge'

export default function WorkflowDrillDown() {
  const { id } = useParams()
  const navigate = useNavigate()
  const workflow = workflows.find(w => w.id === Number(id))
  const steps = workflowSteps[Number(id)] ?? []

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-64 text-white/30">
        Workflow not found.
      </div>
    )
  }

  const actionableSteps = steps.filter(s => s.status === 'manual' && s.recommendation)
  const totalAnnualSaving = actionableSteps.reduce((sum, s) => sum + (s.recommendation?.annualSaving ?? 0), 0)
  const totalHourlySaving = actionableSteps.reduce((sum, s) => sum + (s.recommendation?.hourlySaving ?? 0), 0)
  const recommendedTools = [...new Set(actionableSteps.map(s => s.recommendation?.tool).filter(Boolean))]

  const aiCount = steps.filter(s => s.status === 'ai').length
  const partialCount = steps.filter(s => s.status === 'partial').length
  const manualCount = steps.filter(s => s.status === 'manual').length

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-7">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors font-medium"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Workflows
        </button>
        <span className="text-white/15 text-xs">/</span>
        <span className="text-xs text-white/50 font-medium">{workflow.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold text-white/90 tracking-tight">{workflow.name}</h1>
          <p className="text-sm text-white/30 mt-0.5">{workflow.department}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-card border border-white/[0.06] rounded-xl px-5 py-3">
            <div className="text-center">
              <p className="font-mono text-xl font-semibold text-teal leading-none">{workflow.aiScore}%</p>
              <p className="text-[10px] text-white/30 mt-1">AI Adoption</p>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="flex gap-3 text-center">
              <div>
                <p className="font-mono text-sm font-semibold text-teal">{aiCount}</p>
                <p className="text-[10px] text-white/25">AI</p>
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-amber-400">{partialCount}</p>
                <p className="text-[10px] text-white/25">Partial</p>
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-red-400">{manualCount}</p>
                <p className="text-[10px] text-white/25">Manual</p>
              </div>
            </div>
          </div>
          <StatusBadge status={workflow.status} />
        </div>
      </div>

      {/* Pipeline */}
      <div className="bg-card border border-white/[0.06] rounded-xl p-6 mb-5 overflow-x-auto">
        <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-6">
          Pipeline — {steps.length} steps
        </p>
        <div className="flex items-start w-max pb-1">
          {steps.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              isLast={i === steps.length - 1}
              nextStatus={steps[i + 1]?.status}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-5 px-1">
        {[
          { dot: 'bg-teal', label: 'AI-powered' },
          { dot: 'bg-amber-400', label: 'Partial — connector indicates optimization opportunity' },
          { dot: 'bg-red-400', label: 'Manual — dashed connector indicates friction point' },
        ].map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            <span className="text-[11px] text-white/30">{label}</span>
          </div>
        ))}
      </div>

      {/* Recommendations summary */}
      {actionableSteps.length > 0 && (
        <div className="bg-card border border-white/[0.06] rounded-xl p-6">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-5">
            Recommendations summary
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-5 py-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Hours saved / week</p>
              <p className="font-mono text-2xl font-semibold text-white/90">{totalHourlySaving}h</p>
            </div>
            <div className="bg-teal/[0.06] border border-teal/15 rounded-xl px-5 py-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Annual savings</p>
              <p className="font-mono text-2xl font-semibold text-teal">
                ${totalAnnualSaving.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-5 py-4">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Tools recommended</p>
              <p className="font-mono text-2xl font-semibold text-white/90">{recommendedTools.length}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {recommendedTools.map(tool => (
              <span
                key={tool}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal/[0.08] text-teal text-[11px] font-medium rounded-full border border-teal/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
                {tool}
              </span>
            ))}
          </div>

          <button className="w-full py-3 rounded-xl bg-teal text-sidebar text-sm font-semibold hover:bg-teal/90 transition-colors">
            Apply All Recommendations
          </button>
        </div>
      )}
    </div>
  )
}
