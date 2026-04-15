import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dataSources, workflows } from '../data/mockData'

const statusConfig = {
  connected: { label: 'Connected', dot: 'bg-teal',       badge: 'bg-teal/10 text-teal border-teal/20' },
  syncing:   { label: 'Syncing',   dot: 'bg-amber-400',  badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  error:     { label: 'Error',     dot: 'bg-red-400',    badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const FILTERS = ['all', 'connected', 'syncing', 'error']

export default function DataSources() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const counts = {
    connected: dataSources.filter(d => d.status === 'connected').length,
    syncing:   dataSources.filter(d => d.status === 'syncing').length,
    error:     dataSources.filter(d => d.status === 'error').length,
  }

  const visible = filter === 'all' ? dataSources : dataSources.filter(d => d.status === filter)

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-lg font-semibold text-white/90 tracking-tight">Data Sources</h1>
        <p className="text-sm text-white/30 mt-0.5">Connected systems, sync health, and workflow coverage</p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Connected', value: counts.connected, color: 'text-teal',      bg: 'bg-teal/[0.06]',       border: 'border-teal/10' },
          { label: 'Syncing',   value: counts.syncing,   color: 'text-amber-400', bg: 'bg-amber-500/[0.04]',  border: 'border-amber-500/10' },
          { label: 'Error',     value: counts.error,     color: 'text-red-400',   bg: counts.error > 0 ? 'bg-red-500/[0.06]' : 'bg-card', border: counts.error > 0 ? 'border-red-500/15' : 'border-white/[0.06]' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-xl px-5 py-4`}>
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-1.5">{label}</p>
            <p className={`font-mono text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-5">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors capitalize ${
              filter === f
                ? 'bg-teal/10 text-teal'
                : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
            }`}
          >
            {f === 'all' ? `All (${dataSources.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f] ?? 0})`}
          </button>
        ))}
      </div>

      {/* Source grid */}
      <div className="grid grid-cols-2 gap-3">
        {visible.map(src => (
          <SourceCard key={src.id} src={src} navigate={navigate} />
        ))}
      </div>
    </div>
  )
}

function SourceCard({ src, navigate }) {
  const sc = statusConfig[src.status] ?? statusConfig.connected
  const coverageWorkflows = workflows.filter(w =>
    src.usedInWorkflows.some(u => u.workflowId === w.id)
  )

  const confidenceColor = src.confidenceScore >= 80
    ? 'text-teal'
    : src.confidenceScore >= 50
    ? 'text-amber-400'
    : 'text-red-400'

  const confidenceBg = src.confidenceScore >= 80
    ? 'bg-teal/[0.06]'
    : src.confidenceScore >= 50
    ? 'bg-amber-500/[0.06]'
    : 'bg-red-500/[0.06]'

  return (
    <div className={`border rounded-xl p-5 transition-colors ${
      src.status === 'error'
        ? 'bg-red-500/[0.04] border-red-500/15'
        : 'bg-card border-white/[0.06]'
    }`}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white/50">
              {src.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white/85 leading-tight">{src.name}</p>
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

      {/* Confidence + data fields row */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`flex-shrink-0 px-3 py-2 rounded-lg border border-white/[0.06] ${confidenceBg} text-center`} style={{ minWidth: 64 }}>
          <p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Trust</p>
          <p className={`font-mono text-sm font-semibold ${confidenceColor}`}>
            {src.status === 'error' ? 'N/A' : `${src.confidenceScore}%`}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 flex-1">
          {src.dataProvided.map(d => (
            <span key={d} className="text-[9px] text-white/35 bg-white/[0.04] border border-white/[0.05] rounded px-1.5 py-0.5 font-medium">
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Workflow coverage */}
      {coverageWorkflows.length > 0 ? (
        <div className="pt-3.5 border-t border-white/[0.05]">
          <p className="text-[9px] text-white/20 uppercase tracking-widest font-semibold mb-2">Powering workflows</p>
          <div className="flex flex-wrap gap-1.5">
            {coverageWorkflows.map(w => (
              <button
                key={w.id}
                onClick={() => navigate(`/workflows/${w.id}`)}
                className="text-[10px] font-medium text-teal bg-teal/[0.08] border border-teal/15 rounded-md px-2 py-0.5 hover:bg-teal/[0.14] transition-colors"
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-3.5 border-t border-white/[0.05]">
          <p className="text-[10px] text-white/20">Not used in any active workflow</p>
        </div>
      )}

      {src.status === 'error' && (
        <div className="mt-3 flex items-center gap-2 bg-red-500/[0.08] border border-red-500/15 rounded-lg px-3 py-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
            <circle cx="6" cy="6" r="5" stroke="#EF4444" strokeWidth="1.2"/>
            <path d="M6 3.5V6.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="6" cy="8.2" r="0.6" fill="#EF4444"/>
          </svg>
          <p className="text-[10px] text-red-400">Connection error — last successful sync {src.lastSync}</p>
        </div>
      )}
    </div>
  )
}
