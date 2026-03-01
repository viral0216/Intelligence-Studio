import { useState } from 'react'
import { Bot, Wrench } from 'lucide-react'
import AgentChat from '@/components/agent/AgentChat'
import CustomAgentBuilder from '@/components/agent/CustomAgentBuilder'

type AgentTab = 'chat' | 'builder'

export default function AgentView() {
  const [tab, setTab] = useState<AgentTab>('chat')

  return (
    <div className="view-container">
      {/* Sub-tabs */}
      <div className="view-sub-tabs">
        <button
          onClick={() => setTab('chat')}
          className={`view-sub-tab ${tab === 'chat' ? 'active' : ''}`}
        >
          <Bot className="w-3.5 h-3.5" />
          Agent Chat
        </button>
        <button
          onClick={() => setTab('builder')}
          className={`view-sub-tab ${tab === 'builder' ? 'active' : ''}`}
        >
          <Wrench className="w-3.5 h-3.5" />
          Custom Agents
        </button>
      </div>

      {/* Content */}
      <div className="view-content">
        {tab === 'chat' && <AgentChat />}
        {tab === 'builder' && <CustomAgentBuilder />}
      </div>
    </div>
  )
}
