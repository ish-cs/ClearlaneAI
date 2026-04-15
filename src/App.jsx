import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import WorkflowList from './pages/WorkflowList'
import WorkflowDrillDown from './pages/WorkflowDrillDown'
import ROIDashboard from './pages/ROIDashboard'

export default function App() {
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="ml-56 flex-1 p-8 max-w-[1200px]">
        <Routes>
          <Route path="/" element={<WorkflowList />} />
          <Route path="/workflows" element={<WorkflowList />} />
          <Route path="/workflows/:id" element={<WorkflowDrillDown />} />
          <Route path="/roi" element={<ROIDashboard />} />
        </Routes>
      </main>
    </div>
  )
}
