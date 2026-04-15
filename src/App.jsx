import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import WorkflowList from './pages/WorkflowList'
import WorkflowDrillDown from './pages/WorkflowDrillDown'
import ROIDashboard from './pages/ROIDashboard'
import DataSources from './pages/DataSources'

export default function App() {
  const location = useLocation()
  const isCanvas = /^\/workflows\/\d+/.test(location.pathname)

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className={`ml-56 flex-1 ${isCanvas ? 'overflow-hidden' : 'p-8 max-w-[1200px]'}`}>
        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/workflows"      element={<WorkflowList />} />
          <Route path="/workflows/:id"  element={<WorkflowDrillDown />} />
          <Route path="/roi"            element={<ROIDashboard />} />
          <Route path="/data-sources"   element={<DataSources />} />
        </Routes>
      </main>
    </div>
  )
}
