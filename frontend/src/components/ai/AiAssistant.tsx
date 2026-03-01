import {
  Database,
  Search,
  BarChart3,
  AlertTriangle,
  GitBranch,
  Code,
  FlaskConical,
  BookOpen,
} from 'lucide-react'
import { useAiStore } from '@/stores/aiStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { AiTab } from '@/types/ai'
import DataQATab from './DataQATab'
import FindEndpointTab from './FindEndpointTab'
import AnalyzeResponseTab from './AnalyzeResponseTab'
import ErrorAnalysisTab from './ErrorAnalysisTab'
import WorkflowBuilderTab from './WorkflowBuilderTab'
import CodeGenerationTab from './CodeGenerationTab'
import TestDataTab from './TestDataTab'
import ApiDocsTab from './ApiDocsTab'

interface TabDefinition {
  id: AiTab
  label: string
  icon: React.ReactNode
  featureKey?: keyof ReturnType<typeof useSettingsStore>['features']
}

const tabs: TabDefinition[] = [
  { id: 'data-qa', label: 'Data QA', icon: <Database className="w-3.5 h-3.5" />, featureKey: 'dataQA' },
  { id: 'find-endpoint', label: 'Find Endpoint', icon: <Search className="w-3.5 h-3.5" />, featureKey: 'findEndpoint' },
  { id: 'analyze-response', label: 'Analyze Response', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: 'error-analysis', label: 'Error Analysis', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { id: 'workflow-builder', label: 'Workflow Builder', icon: <GitBranch className="w-3.5 h-3.5" />, featureKey: 'workflowBuilder' },
  { id: 'code-generation', label: 'Code Generation', icon: <Code className="w-3.5 h-3.5" />, featureKey: 'codeGeneration' },
  { id: 'test-data', label: 'Test Data', icon: <FlaskConical className="w-3.5 h-3.5" />, featureKey: 'testDataGenerator' },
  { id: 'api-docs', label: 'API Docs', icon: <BookOpen className="w-3.5 h-3.5" /> },
]

export default function AiAssistant() {
  const { activeTab, setActiveTab } = useAiStore()
  const { features } = useSettingsStore()

  const visibleTabs = tabs.filter(
    (tab) => !tab.featureKey || features[tab.featureKey]
  )

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 border-b overflow-x-auto"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
              title={tab.label}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'data-qa' && <DataQATab />}
        {activeTab === 'find-endpoint' && <FindEndpointTab />}
        {activeTab === 'analyze-response' && <AnalyzeResponseTab />}
        {activeTab === 'error-analysis' && <ErrorAnalysisTab />}
        {activeTab === 'workflow-builder' && <WorkflowBuilderTab />}
        {activeTab === 'code-generation' && <CodeGenerationTab />}
        {activeTab === 'test-data' && <TestDataTab />}
        {activeTab === 'api-docs' && <ApiDocsTab />}
      </div>
    </div>
  )
}
