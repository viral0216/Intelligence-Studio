import {
  Database,
  Search,
  BarChart3,
  AlertTriangle,
  GitBranch,
  Code,
  FlaskConical,
  BookOpen,
  Bot,
  Table2,
  LineChart,
  Terminal,
  ScrollText,
} from 'lucide-react'
import { useAiStore } from '@/stores/aiStore'
import { useSettingsStore, type FeatureKey } from '@/stores/settingsStore'
import type { AiTab } from '@/types/ai'
import DataQATab from './DataQATab'
import FindEndpointTab from './FindEndpointTab'
import AnalyzeResponseTab from './AnalyzeResponseTab'
import ErrorAnalysisTab from './ErrorAnalysisTab'
import WorkflowBuilderTab from './WorkflowBuilderTab'
import CodeGenerationTab from './CodeGenerationTab'
import TestDataTab from './TestDataTab'
import ApiDocsTab from './ApiDocsTab'
import PromptManagerTab from './PromptManagerTab'
import AgentView from '@/components/views/AgentView'
import QueryView from '@/components/views/QueryView'
import VisualizationView from '@/components/views/VisualizationView'
import ScriptingView from '@/components/views/ScriptingView'

interface TabDefinition {
  id: AiTab
  label: string
  icon: React.ReactNode
  featureKey?: FeatureKey
  group?: 'ai' | 'tools'
}

const tabs: TabDefinition[] = [
  // AI tabs
  { id: 'data-qa', label: 'Data QA', icon: <Database className="w-3.5 h-3.5" />, featureKey: 'dataQA', group: 'ai' },
  { id: 'find-endpoint', label: 'Find', icon: <Search className="w-3.5 h-3.5" />, featureKey: 'findEndpoint', group: 'ai' },
  { id: 'analyze-response', label: 'Analyze', icon: <BarChart3 className="w-3.5 h-3.5" />, group: 'ai' },
  { id: 'error-analysis', label: 'Errors', icon: <AlertTriangle className="w-3.5 h-3.5" />, group: 'ai' },
  { id: 'workflow-builder', label: 'Workflow', icon: <GitBranch className="w-3.5 h-3.5" />, featureKey: 'workflowBuilder', group: 'ai' },
  { id: 'code-generation', label: 'Code', icon: <Code className="w-3.5 h-3.5" />, featureKey: 'codeGeneration', group: 'ai' },
  { id: 'test-data', label: 'Test Data', icon: <FlaskConical className="w-3.5 h-3.5" />, featureKey: 'testDataGenerator', group: 'ai' },
  { id: 'api-docs', label: 'Docs', icon: <BookOpen className="w-3.5 h-3.5" />, group: 'ai' },
  // Tool tabs
  { id: 'agent-chat', label: 'Agent', icon: <Bot className="w-3.5 h-3.5" />, featureKey: 'agentChat', group: 'tools' },
  { id: 'query-builder', label: 'Query', icon: <Table2 className="w-3.5 h-3.5" />, featureKey: 'queryBuilder', group: 'tools' },
  { id: 'visualization', label: 'Visualize', icon: <LineChart className="w-3.5 h-3.5" />, group: 'tools' },
  { id: 'scripting', label: 'Script', icon: <Terminal className="w-3.5 h-3.5" />, featureKey: 'aiScripting', group: 'tools' },
  { id: 'prompts', label: 'Prompts', icon: <ScrollText className="w-3.5 h-3.5" />, group: 'tools' },
]

export default function AiAssistant() {
  const { activeTab, setActiveTab } = useAiStore()
  const { features } = useSettingsStore()

  const visibleTabs = tabs.filter(
    (tab) => !tab.featureKey || features[tab.featureKey]
  )

  const aiTabs = visibleTabs.filter((t) => t.group === 'ai')
  const toolTabs = visibleTabs.filter((t) => t.group === 'tools')

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="tab-nav" style={{ gap: '2px', padding: '0 8px', flexWrap: 'wrap' }}>
        {aiTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 10px' }}
            title={tab.label}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}

        {toolTabs.length > 0 && (
          <div className="tab-divider" style={{ width: '1px', height: '20px', background: 'var(--border-secondary)', margin: '0 4px', alignSelf: 'center' }} />
        )}

        {toolTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 10px' }}
            title={tab.label}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto animate-fade-in">
        {activeTab === 'data-qa' && <DataQATab />}
        {activeTab === 'find-endpoint' && <FindEndpointTab />}
        {activeTab === 'analyze-response' && <AnalyzeResponseTab />}
        {activeTab === 'error-analysis' && <ErrorAnalysisTab />}
        {activeTab === 'workflow-builder' && <WorkflowBuilderTab />}
        {activeTab === 'code-generation' && <CodeGenerationTab />}
        {activeTab === 'test-data' && <TestDataTab />}
        {activeTab === 'api-docs' && <ApiDocsTab />}
        {activeTab === 'agent-chat' && <AgentView />}
        {activeTab === 'query-builder' && <QueryView />}
        {activeTab === 'visualization' && <VisualizationView />}
        {activeTab === 'scripting' && <ScriptingView />}
        {activeTab === 'prompts' && <PromptManagerTab />}
      </div>
    </div>
  )
}
