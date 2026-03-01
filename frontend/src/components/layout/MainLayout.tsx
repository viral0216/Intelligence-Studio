import { useSettingsStore } from '@/stores/settingsStore'
import { useCatalogStore } from '@/stores/catalogStore'
import PresetSidebar from '@/components/catalog/PresetSidebar'
import NaturalLanguageInput from '@/components/common/NaturalLanguageInput'
import RequestComposer from '@/components/request/RequestComposer'
import ResponsePanel from '@/components/request/ResponsePanel'
import HistoryPanel from '@/components/history/HistoryPanel'
import AiAssistant from '@/components/ai/AiAssistant'
import IntegrationExportPanel from '@/components/export/IntegrationExportPanel'
import ApiDocPanel from '@/components/catalog/ApiDocPanel'

export default function MainLayout() {
  const { showHistory, showAiAssistant, showIntegrationExport, uiComponents } = useSettingsStore()
  const { selectedEndpoint } = useCatalogStore()

  return (
    <div className="main-content-layout">
      {/* AI Assistant: full-width replacement */}
      {showAiAssistant ? (
        <div className="main-panel">
          <AiAssistant />
        </div>
      ) : (
        <>
          {/* Left: Preset Sidebar */}
          <PresetSidebar />

          {/* Center: Main panel */}
          <div className="main-panel">
            {uiComponents.naturalLanguageToApi && <NaturalLanguageInput />}
            <RequestComposer />
            <ResponsePanel />
          </div>

          {/* Right side panels */}
          {selectedEndpoint && !showHistory && !showIntegrationExport && (
            <div className="side-panel animate-slide-in-right" style={{ width: '340px' }}>
              <ApiDocPanel />
            </div>
          )}

          {showHistory && (
            <div className="side-panel animate-slide-in-right" style={{ width: '320px' }}>
              <HistoryPanel />
            </div>
          )}

          {showIntegrationExport && (
            <div className="side-panel animate-slide-in-right" style={{ width: '320px' }}>
              <IntegrationExportPanel />
            </div>
          )}
        </>
      )}
    </div>
  )
}
