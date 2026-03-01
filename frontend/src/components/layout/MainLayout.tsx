import { useSettingsStore } from '@/stores/settingsStore'
import RequestComposer from '@/components/request/RequestComposer'
import ResponsePanel from '@/components/request/ResponsePanel'
import HistoryPanel from '@/components/history/HistoryPanel'
import AiAssistant from '@/components/ai/AiAssistant'
import IntegrationExportPanel from '@/components/export/IntegrationExportPanel'

export default function MainLayout() {
  const { showHistory, showAiAssistant, showIntegrationExport } = useSettingsStore()

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel: History */}
      {showHistory && (
        <div
          className="w-80 border-r overflow-y-auto flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
        >
          <HistoryPanel />
        </div>
      )}

      {/* Center: Request + Response */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0">
          <RequestComposer />
        </div>
        <div className="flex-1 overflow-auto">
          <ResponsePanel />
        </div>
      </div>

      {/* Right Panel: AI Assistant */}
      {showAiAssistant && (
        <div
          className="w-[480px] border-l overflow-y-auto flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
        >
          <AiAssistant />
        </div>
      )}

      {/* Right Panel: Export */}
      {showIntegrationExport && (
        <div
          className="w-80 border-l overflow-y-auto flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
        >
          <IntegrationExportPanel />
        </div>
      )}
    </div>
  )
}
