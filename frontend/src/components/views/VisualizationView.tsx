import { useState } from 'react'
import { BarChart3, LayoutDashboard, GitBranch, Network } from 'lucide-react'
import DataVisualization from '@/components/visualization/DataVisualization'
import DashboardBuilder from '@/components/visualization/DashboardBuilder'
import SchemaVisualizer from '@/components/visualization/SchemaVisualizer'
import DependencyGraph from '@/components/visualization/DependencyGraph'

type VizTab = 'charts' | 'dashboard' | 'schema' | 'dependencies'

export default function VisualizationView() {
  const [tab, setTab] = useState<VizTab>('charts')

  return (
    <div className="view-container">
      {/* Sub-tabs */}
      <div className="view-sub-tabs">
        <button
          onClick={() => setTab('charts')}
          className={`view-sub-tab ${tab === 'charts' ? 'active' : ''}`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Charts
        </button>
        <button
          onClick={() => setTab('dashboard')}
          className={`view-sub-tab ${tab === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Dashboard
        </button>
        <button
          onClick={() => setTab('schema')}
          className={`view-sub-tab ${tab === 'schema' ? 'active' : ''}`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          Schema
        </button>
        <button
          onClick={() => setTab('dependencies')}
          className={`view-sub-tab ${tab === 'dependencies' ? 'active' : ''}`}
        >
          <Network className="w-3.5 h-3.5" />
          Dependencies
        </button>
      </div>

      {/* Content */}
      <div className="view-content" style={{ minHeight: '500px' }}>
        {tab === 'charts' && <DataVisualization />}
        {tab === 'dashboard' && <DashboardBuilder />}
        {tab === 'schema' && <SchemaVisualizer />}
        {tab === 'dependencies' && <DependencyGraph />}
      </div>
    </div>
  )
}
