import { dataSources } from '../../data/mockData'

const statusConfig = {
  connected: { label: 'Connected',  dot: 'bg-teal',       badge: 'bg-teal/10 text-teal border-teal/20' },
  syncing:   { label: 'Syncing',    dot: 'bg-amber-400',  badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  error:     { label: 'Error',      dot: 'bg-red-400',    badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

export default function DataSourcesTab({ workflowId }) {
  // Sources used in this workflow
  const wfSources = dataSources.filter(ds =>
    ds.usedInWorkflows.some(u => u.workflowId === workflowId)
  )
  // Other sources (connected globally but not in this workflow)
  const otherSources = dataSources.filter(ds =>
    !ds.usedInWorkflows.some(u => u.workflowId === workflowId)
  )

  const counts = {
    connected: dataSources.filter(d => d.status === 'connected').length,
    syncing:   dataSources.filter(d => d.status === 'syncing').length,
    error:     dataSources.filter(d => d.status === 'error').length,
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Connected', value: counts.connected, color: 'text-teal' },
          { label: 'Syncing',   value: counts.syncing,   color: 'text-amber-400' },
          { label: 'Error',     value: counts.error,     color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-white/[0.06] rounded-xl px-4 py-3.5">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-1.5">{label}</p>
            <p className={`font-mono text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* This workflow's sources */}
      {wfSources.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">
            Used in this workflow
          </p>
          <div className="space-y-2">
            {wfSources.map(src => <SourceCard key={src.id} src={src} workflowId={workflowId} highlighted />)}
          </div>
        </div>
      )}

      {/* Global sources */}
      {otherSources.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-3">
            Other connected sources
          </p>
          <div className="space-y-2">
            {otherSources.map(src => <SourceCard key={src.id} src={src} workflowId={workflowId} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function SourceCard({ src, workflowId, highlighted }) {
  const sc = statusConfig[src.status] ?? statusConfig.connected
  const steps = src.usedInWorkflows.filter(u => u.workflowId === workflowId)

  return (
    <div className={`border rounded-xl p-4 transition-colors ${
      highlighted
        ? 'bg-white/[0.03] border-white/[0.08]'
        : 'bg-card border-white/[0.04] opacity-60'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Logo placeholder */}
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-bold text-white/50">
              {src.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/80 leading-tight">{src.name}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{src.category}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </span>
          <span className="text-[9px] text-white/20 font-mono">{src.lastSync}</span>
        </div>
      </div>

      {/* Data provided */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {src.dataProvided.map(d => (
          <span key={d} className="text-[9px] text-white/35 bg-white/[0.04] border border-white/[0.05] rounded px-1.5 py-0.5 font-medium">
            {d}
          </span>
        ))}
      </div>

      {/* Steps that use this source */}
      {steps.length > 0 && (
        <div className="pt-2.5 border-t border-white/[0.05]">
          <p className="text-[9px] text-white/20 uppercase tracking-widest font-semibold mb-1.5">Used in</p>
          <div className="flex flex-wrap gap-1.5">
            {steps.map(s => (
              <span key={s.stepName} className="text-[10px] font-medium text-teal bg-teal/[0.08] border border-teal/15 rounded-md px-2 py-0.5">
                {s.stepName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
