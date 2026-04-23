import { useCallback, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ReactFlow, Background, Controls, MiniMap,
  BackgroundVariant, addEdge, useNodesState, useEdgesState,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { workflows, workflowSteps } from '../data/mockData'
import StatusBadge from '../components/StatusBadge'
import WorkflowNode from '../components/canvas/WorkflowNode'
import NodePanel from '../components/canvas/NodePanel'
import DataSourcesTab from '../components/canvas/DataSourcesTab'

const nodeTypes = { workflowNode: WorkflowNode }

function getScore(status, weeklyHours = 4) {
  if (status === 'ai')      return Math.min(96, 80 + Math.round((10 - Math.min(weeklyHours, 10)) * 1.6))
  if (status === 'partial') return Math.min(68, 38 + Math.round((8  - Math.min(weeklyHours, 8))  * 3))
  return Math.max(5, 32 - Math.round(weeklyHours * 1.8))
}

function edgeColor(status) {
  if (status === 'manual')  return '#B44040'
  if (status === 'partial') return '#C4922A'
  return 'rgba(74,112,98,0.55)'
}

function buildFlow(steps, bottlenecks, onRename, onDelete) {
  const bottleneckStepNames = new Set(bottlenecks?.map(b => b.step) ?? [])

  const nodes = steps.map((step, i) => ({
    id: String(step.id),
    type: 'workflowNode',
    position: { x: i * 290, y: 120 },
    data: {
      ...step,
      isBottleneck: bottleneckStepNames.has(step.name),
      onRename,
      onDelete,
    },
  }))

  const edges = steps.slice(0, -1).map((step, i) => {
    const next = steps[i + 1]
    const color = edgeColor(next.status)
    return {
      id: `e${step.id}-${next.id}`,
      source: String(step.id),
      target: String(next.id),
      animated: step.status === 'ai' && next.status === 'ai',
      label: step.dropoffPct != null ? `↓${step.dropoffPct}%` : undefined,
      labelStyle: { fill: '#B44040', fontSize: 9, fontFamily: 'JetBrains Mono', fontWeight: 600 },
      labelBgStyle: { fill: 'transparent' },
      style: {
        stroke: color,
        strokeWidth: 1.5,
        strokeDasharray: next.status === 'manual' ? '5 4' : undefined,
      },
    }
  })

  return { nodes, edges }
}

let newNodeCounter = 100

export default function WorkflowDrillDown() {
  const { id } = useParams()
  const navigate = useNavigate()
  const workflow = workflows.find(w => w.id === Number(id))
  const rawSteps = workflowSteps[Number(id)] ?? []

  const [activeTab,       setActiveTab]       = useState('canvas')
  const [selectedNodeId,  setSelectedNodeId]  = useState(null)
  const [showBottlenecks, setShowBottlenecks] = useState(false)

  // Fix #12: track drag to suppress click-after-drag
  const draggingRef = useRef(false)

  const handleRename = useCallback((nodeId, newName) => {
    setNodes(ns => ns.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, name: newName } } : n
    ))
  }, [])

  const handleDelete = useCallback((nodeId) => {
    setNodes(ns => ns.filter(n => n.id !== nodeId))
    setEdges(es => es.filter(e => e.source !== nodeId && e.target !== nodeId))
    setSelectedNodeId(null)
  }, [])

  const { nodes: initNodes, edges: initEdges } = useMemo(() =>
    buildFlow(rawSteps, workflow?.bottlenecks, handleRename, handleDelete),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  const visibleNodes = useMemo(() => {
    const bottleneckNames = new Set(workflow?.bottlenecks?.map(b => b.step) ?? [])
    return nodes.map(n => ({
      ...n,
      style: showBottlenecks && !bottleneckNames.has(n.data.name)
        ? { opacity: 0.25, transition: 'opacity 0.2s' }
        : { opacity: 1, transition: 'opacity 0.2s' },
    }))
  }, [nodes, showBottlenecks, workflow])

  const onConnect = useCallback((params) =>
    setEdges(es => addEdge({ ...params, style: { stroke: 'rgba(0,201,167,0.4)', strokeWidth: 1.5 } }, es)),
    [setEdges]
  )

  // Fix #1: resolve selectedStep from live node data, not rawSteps
  const selectedStep = selectedNodeId
    ? nodes.find(n => n.id === selectedNodeId)?.data ?? null
    : null

  const handleUpdate = useCallback((nodeId, updatedData) => {
    setNodes(ns => ns.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...updatedData, isNew: false } } : n
    ))
  }, [setNodes])

  const addNode = useCallback(() => {
    newNodeCounter++
    const nodeId = String(newNodeCounter)
    const lastNode = nodes[nodes.length - 1]
    const x = lastNode ? lastNode.position.x + 290 : 0
    const newNode = {
      id: nodeId,
      type: 'workflowNode',
      position: { x, y: 120 },
      data: {
        name: 'New Step',
        tool: 'Manual',
        status: 'manual',
        weeklyHours: 0,
        description: '',
        isNew: true,
        onRename: handleRename,
        onDelete: handleDelete,
      },
    }
    setNodes(ns => [...ns, newNode])
    setSelectedNodeId(nodeId)
  }, [nodes, handleRename, handleDelete, setNodes])

  if (!workflow) {
    return <div className="flex items-center justify-center h-64" style={{ color: 'rgba(28,16,8,0.35)' }}>Workflow not found.</div>
  }

  // Top opportunities for this workflow
  const workflowOpps = rawSteps
    .filter(s => s.recommendation)
    .map(s => ({ stepName: s.name, ...s.recommendation }))
    .sort((a, b) => b.annualSaving - a.annualSaving)

  // Top metrics
  const manualHrs  = rawSteps.filter(s => s.status === 'manual').reduce((s, st) => s + st.weeklyHours, 0)
  const savedHrs   = rawSteps.filter(s => s.status === 'manual').reduce((s, st) => s + (st.recommendation?.hourlySaving ?? 0), 0)
  const avgScore   = Math.round(rawSteps.reduce((s, st) => s + getScore(st.status, st.weeklyHours), 0) / (rawSteps.length || 1))
  const bottleneckCount = workflow.bottlenecks?.length ?? 0

  return (
    <div className="flex flex-col" style={{ height: '100vh' }}>
      {/* Top bar */}
      <div className="flex-shrink-0 px-8 pt-5 pb-0" style={{ background: '#F4F0E8', borderBottom: '1px solid rgba(28,16,8,0.09)' }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate('/workflows')}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{ color: 'rgba(28,16,8,0.40)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(28,16,8,0.70)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(28,16,8,0.40)'}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Workflows
          </button>
          <span className="text-xs" style={{ color: 'rgba(28,16,8,0.18)' }}>/</span>
          <span className="text-xs font-medium" style={{ color: 'rgba(28,16,8,0.55)' }}>{workflow.name}</span>
        </div>

        {/* Title + tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-end gap-4">
            <div>
              <h1 className="font-serif text-xl font-semibold leading-none mb-1" style={{ color: '#1C1008' }}>
                {workflow.name}
              </h1>
              <p className="text-xs" style={{ color: 'rgba(28,16,8,0.40)' }}>{workflow.department}</p>
            </div>
            <div className="flex items-center gap-1 mb-0.5">
              {['canvas', 'data-sources'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                  style={activeTab === tab
                    ? { background: 'rgba(124,82,52,0.10)', color: '#7C5234' }
                    : { color: 'rgba(28,16,8,0.40)' }
                  }
                  onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.background = 'rgba(28,16,8,0.04)' }}
                  onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.background = 'transparent' }}
                >
                  {tab === 'canvas' ? 'Canvas' : 'Data Sources'}
                </button>
              ))}
            </div>
          </div>
          <StatusBadge status={workflow.status} />
        </div>

        {/* Metrics strip */}
        <div className="flex items-center gap-4 py-3 mt-2" style={{ borderTop: '1px solid rgba(28,16,8,0.07)' }}>
          {[
            { label: 'AI Adoption',    value: `${workflow.aiScore}%`,    accent: true  },
            { label: 'Opt. Score',     value: `${avgScore}/100`,         accent: true  },
            { label: 'Manual hrs/wk',  value: `${manualHrs}h`,           accent: false },
            { label: 'Potential/mo',   value: `${(savedHrs * 4).toFixed(0)}h saved`, accent: false },
            { label: 'Conversion',     value: `${workflow.conversionRate}%`, accent: false },
            { label: 'Cycle time',     value: `${workflow.avgCycleTimeDays}d`, accent: false },
            { label: 'Bottlenecks',    value: bottleneckCount,           accent: bottleneckCount > 0 },
          ].map(({ label, value, accent }) => (
            <div key={label} className="flex items-center gap-2">
              <div>
                <p className="text-[9px] uppercase tracking-widest font-semibold leading-none mb-1" style={{ color: 'rgba(28,16,8,0.30)' }}>{label}</p>
                <p className="font-mono text-sm font-semibold leading-none" style={{ color: accent ? '#7C5234' : 'rgba(28,16,8,0.65)' }}>
                  {value}
                </p>
              </div>
              <div className="w-px h-6 ml-2" style={{ background: 'rgba(28,16,8,0.08)' }} />
            </div>
          ))}

          {/* Filters */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] font-mono" style={{ color: 'rgba(28,16,8,0.28)' }}>Last 30 days</span>
            <div className="w-px h-4" style={{ background: 'rgba(28,16,8,0.09)' }} />
            <button
              onClick={() => setShowBottlenecks(v => !v)}
              className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all"
              style={showBottlenecks
                ? { background: 'rgba(180,64,64,0.08)', color: '#B44040', border: '1px solid rgba(180,64,64,0.18)' }
                : { color: 'rgba(28,16,8,0.40)', border: '1px solid rgba(28,16,8,0.09)' }
              }
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 4v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="6" cy="8.5" r="0.6" fill="currentColor"/>
              </svg>
              Bottlenecks only
            </button>
            <button onClick={addNode}
              className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all"
              style={{ color: 'rgba(28,16,8,0.40)', border: '1px solid rgba(28,16,8,0.09)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,82,52,0.30)'; e.currentTarget.style.color = '#7C5234' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(28,16,8,0.09)'; e.currentTarget.style.color = 'rgba(28,16,8,0.40)' }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add step
            </button>
          </div>
        </div>
      </div>

      {/* Canvas / Data Sources area */}
      <div className="flex-1 relative overflow-hidden">
        {activeTab === 'canvas' ? (
          <>
            <ReactFlow
              nodes={visibleNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onNodeDragStart={() => { draggingRef.current = true }}
              onNodeDragStop={() => { setTimeout(() => { draggingRef.current = false }, 0) }}
              onNodeClick={(_, node) => {
                if (draggingRef.current) return
                setSelectedNodeId(prev => prev === node.id ? null : node.id)
              }}
              onPaneClick={() => setSelectedNodeId(null)}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              minZoom={0.2}
              maxZoom={2}
              deleteKeyCode="Delete"
              style={{ background: 'transparent' }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1}
                color="rgba(28,16,8,0.07)"
              />
              <Controls
                showInteractive={false}
                style={{
                  background: '#F4F0E8',
                  border: '1px solid rgba(28,16,8,0.09)',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              />
              <MiniMap
                nodeColor={n => {
                  const s = n.data?.status
                  return s === 'ai' ? '#4A7062' : s === 'partial' ? '#C4922A' : '#B44040'
                }}
                maskColor="rgba(237,233,226,0.75)"
                style={{
                  background: '#EDE9E2',
                  border: '1px solid rgba(28,16,8,0.09)',
                  borderRadius: 10,
                  bottom: selectedNodeId ? 16 : 16,
                  right: selectedNodeId ? 356 : 16,
                }}
              />

              {/* Fix #11: empty state */}
              {nodes.length === 0 && (
                <Panel position="top-center">
                  <div className="flex flex-col items-center gap-3 mt-20 text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(28,16,8,0.04)', border: '1px solid rgba(28,16,8,0.08)' }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="rgba(28,16,8,0.25)" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M12 8v8M8 12h8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'rgba(28,16,8,0.35)' }}>No steps yet</p>
                    <p className="text-xs" style={{ color: 'rgba(28,16,8,0.25)' }}>Use the "Add step" button above to build your workflow</p>
                  </div>
                </Panel>
              )}

              {/* Top Opportunities floating panel */}
              {workflowOpps.length > 0 && (
                <Panel position="top-left">
                  <div className="bg-sidebar border border-white/[0.08] rounded-xl p-3 shadow-xl mt-2 ml-2" style={{ width: 240 }}>
                    <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest mb-2.5">
                      Top opportunities
                    </p>
                    <div className="space-y-1.5">
                      {workflowOpps.slice(0, 3).map((opp, i) => (
                        <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-white/[0.04] last:border-0">
                          <span className="font-mono text-xs font-semibold text-teal w-12 flex-shrink-0">
                            ${(opp.annualSaving / 1000).toFixed(0)}k/yr
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs text-white/70 font-medium leading-tight truncate">{opp.stepName}</p>
                            <p className="text-[9px] text-white/30 truncate">{opp.tool}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {workflowOpps.length > 3 && (
                      <p className="text-[10px] text-white/20 mt-2">+{workflowOpps.length - 3} more</p>
                    )}
                  </div>
                </Panel>
              )}

              {/* Legend — fix #17: corrected hint text */}
              <Panel position="bottom-center">
                <div className="flex items-center gap-5 px-4 py-2 bg-card border border-white/[0.06] rounded-xl mb-4 text-[10px] text-white/30">
                  {[
                    ['#00C9A7', 'AI-powered'],
                    ['#F59E0B', 'Hybrid'],
                    ['#EF4444', 'Manual'],
                  ].map(([color, label]) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      {label}
                    </div>
                  ))}
                  <span className="text-white/15">·</span>
                  <span>Click to inspect · Double-click to rename · ↓% = drop-off</span>
                </div>
              </Panel>
            </ReactFlow>

            {/* Node detail panel */}
            {selectedNodeId && (
              <NodePanel
                nodeId={selectedNodeId}
                step={selectedStep}
                workflow={workflow}
                onClose={() => setSelectedNodeId(null)}
                onUpdate={handleUpdate}
              />
            )}
          </>
        ) : (
          <DataSourcesTab workflowId={workflow.id} />
        )}
      </div>
    </div>
  )
}
