import { useCallback, useMemo, useState } from 'react'
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
  if (status === 'manual')  return '#EF4444'
  if (status === 'partial') return '#F59E0B'
  return 'rgba(0,201,167,0.45)'
}

function buildFlow(steps, bottlenecks, showBottlenecks, onRename, onDelete) {
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
    style: showBottlenecks && !bottleneckStepNames.has(step.name)
      ? { opacity: 0.3 } : {},
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
      labelStyle: { fill: '#EF4444', fontSize: 9, fontFamily: 'JetBrains Mono', fontWeight: 600 },
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

  // Rename handler — updates node data.name in place
  const handleRename = useCallback((nodeId, newName) => {
    setNodes(ns => ns.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, name: newName } } : n
    ))
  }, [])

  // Delete handler
  const handleDelete = useCallback((nodeId) => {
    setNodes(ns => ns.filter(n => n.id !== nodeId))
    setEdges(es => es.filter(e => e.source !== nodeId && e.target !== nodeId))
    setSelectedNodeId(null)
  }, [])

  const { nodes: initNodes, edges: initEdges } = useMemo(() =>
    buildFlow(rawSteps, workflow?.bottlenecks, false, handleRename, handleDelete),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  // Re-apply bottleneck filter when toggle changes
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
    return <div className="flex items-center justify-center h-64 text-white/30">Workflow not found.</div>
  }

  const selectedStep = selectedNodeId
    ? rawSteps.find(s => String(s.id) === selectedNodeId) ??
      nodes.find(n => n.id === selectedNodeId)?.data
    : null

  // Top metrics
  const manualHrs = rawSteps.filter(s => s.status === 'manual').reduce((s, st) => s + st.weeklyHours, 0)
  const savedHrs  = rawSteps.filter(s => s.status === 'manual').reduce((s, st) => s + (st.recommendation?.hourlySaving ?? 0), 0)
  const avgScore  = Math.round(rawSteps.reduce((s, st) => s + getScore(st.status, st.weeklyHours), 0) / (rawSteps.length || 1))
  const bottleneckCount = workflow.bottlenecks?.length ?? 0

  return (
    <div className="flex flex-col" style={{ height: '100vh' }}>
      {/* Top bar */}
      <div className="flex-shrink-0 px-8 pt-5 pb-0 bg-base border-b border-white/[0.05]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors font-medium">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Workflows
          </button>
          <span className="text-white/15 text-xs">/</span>
          <span className="text-xs text-white/50 font-medium">{workflow.name}</span>
        </div>

        {/* Title + tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-end gap-4">
            <div>
              <h1 className="text-lg font-semibold text-white/90 tracking-tight leading-none mb-1">
                {workflow.name}
              </h1>
              <p className="text-xs text-white/30">{workflow.department}</p>
            </div>
            <div className="flex items-center gap-1 mb-0.5">
              {['canvas', 'data-sources'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-teal/10 text-teal'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                  }`}>
                  {tab === 'canvas' ? 'Canvas' : 'Data Sources'}
                </button>
              ))}
            </div>
          </div>
          <StatusBadge status={workflow.status} />
        </div>

        {/* Metrics strip */}
        <div className="flex items-center gap-4 py-3 mt-2 border-t border-white/[0.04]">
          {[
            { label: 'AI Adoption',     value: `${workflow.aiScore}%`,    accent: true  },
            { label: 'Opt. Score',      value: `${avgScore}/100`,         accent: true  },
            { label: 'Manual hrs/wk',   value: `${manualHrs}h`,           accent: false },
            { label: 'Hrs saved/mo',    value: `${(savedHrs * 4).toFixed(0)}h`, accent: false },
            { label: 'Conversion',      value: `${workflow.conversionRate}%`, accent: false },
            { label: 'Cycle time',      value: `${workflow.avgCycleTimeDays}d`, accent: false },
            { label: 'Bottlenecks',     value: bottleneckCount,           accent: bottleneckCount > 0 },
          ].map(({ label, value, accent }) => (
            <div key={label} className="flex items-center gap-2">
              <div>
                <p className="text-[9px] text-white/25 uppercase tracking-widest font-semibold leading-none mb-1">{label}</p>
                <p className={`font-mono text-sm font-semibold leading-none ${accent ? 'text-teal' : 'text-white/70'}`}>
                  {value}
                </p>
              </div>
              <div className="w-px h-6 bg-white/[0.06] ml-2" />
            </div>
          ))}

          {/* Filters */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] text-white/20 font-mono">Last 30 days</span>
            <div className="w-px h-4 bg-white/[0.06]" />
            <button
              onClick={() => setShowBottlenecks(v => !v)}
              className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                showBottlenecks
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'text-white/30 border-white/[0.08] hover:border-white/20 hover:text-white/50'
              }`}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 4v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="6" cy="8.5" r="0.6" fill="currentColor"/>
              </svg>
              Bottlenecks only
            </button>
            <button onClick={addNode}
              className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-white/30 hover:border-teal/30 hover:text-teal transition-all">
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
              onNodeClick={(_, node) => setSelectedNodeId(prev => prev === node.id ? null : node.id)}
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
                color="rgba(255,255,255,0.06)"
              />
              <Controls
                showInteractive={false}
                style={{
                  background: '#141720',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                  overflow: 'hidden',
                }}
              />
              <MiniMap
                nodeColor={n => {
                  const s = n.data?.status
                  return s === 'ai' ? '#00C9A7' : s === 'partial' ? '#F59E0B' : '#EF4444'
                }}
                maskColor="rgba(13,15,20,0.8)"
                style={{
                  background: '#141720',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10,
                }}
              />

              {/* Legend */}
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
                  <span>Dbl-click node to rename · Drag to reposition · ↓% = drop-off</span>
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
