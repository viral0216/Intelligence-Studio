import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Send,
  Loader2,
  Bot,
  User,
  Copy,
  Check,
  Clock,
  Wrench,
  Trash2,
  Sparkles,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAiStore } from '@/stores/aiStore'
import { useAuthStore } from '@/stores/authStore'
import { agentChat } from '@/lib/api'
import type { AgentMessage } from '@/types/ai'

const SUGGESTED_COMMANDS = [
  { label: 'List catalogs', prompt: 'List all catalogs in Unity Catalog' },
  { label: 'Show users', prompt: 'Show all users in the workspace' },
  { label: 'Find groups', prompt: 'Find all groups and their members' },
  { label: 'Tables in catalog', prompt: 'Show all tables in the main catalog' },
]

export default function AgentChat() {
  const {
    agentMessages,
    agentInput,
    isLoading,
    addAgentMessage,
    setAgentInput,
    clearAgentMessages,
    setLoading,
  } = useAiStore()
  const { host, token } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [agentMessages])

  const handleSend = useCallback(async () => {
    const message = agentInput.trim()
    if (!message || isLoading) return

    if (!host || !token) {
      addAgentMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Please configure your Databricks host and token in Settings first.',
        timestamp: Date.now(),
      })
      return
    }

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    }
    addAgentMessage(userMsg)
    setAgentInput('')
    setLoading(true)

    try {
      const history = agentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))
      const result = await agentChat(message, host, token, history)

      const assistantMsg: AgentMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: result.response,
        timestamp: Date.now(),
        metadata: {
          toolsUsed: (result.metadata?.toolsUsed as string[]) || [],
          executionTime: (result.metadata?.executionTime as number) || 0,
          model: (result.metadata?.model as string) || undefined,
          tokenUsage: (result.metadata?.tokenUsage as number) || undefined,
        },
      }
      addAgentMessage(assistantMsg)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Agent request failed'
      addAgentMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${errorMsg}`,
        timestamp: Date.now(),
      })
    } finally {
      setLoading(false)
    }
  }, [agentInput, isLoading, host, token, agentMessages, addAgentMessage, setAgentInput, setLoading])

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSuggestion = (prompt: string) => {
    setAgentInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Agent Chat
          </span>
        </div>
        {agentMessages.length > 0 && (
          <button
            onClick={clearAgentMessages}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Clear conversation"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {agentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <Bot
                className="w-12 h-12 mx-auto mb-3"
                style={{ color: 'var(--accent-primary)', opacity: 0.5 }}
              />
              <h3
                className="text-base font-semibold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Databricks Agent
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Ask me anything about your Databricks workspace
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTED_COMMANDS.map((cmd) => (
                <button
                  key={cmd.prompt}
                  onClick={() => handleSuggestion(cmd.prompt)}
                  className="px-3 py-2 rounded-lg text-xs text-left transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }}
                >
                  <Sparkles
                    className="w-3 h-3 mb-1"
                    style={{ color: 'var(--accent-primary)' }}
                  />
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          agentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.9 }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className="max-w-[80%] rounded-lg px-3 py-2 relative group"
                style={{
                  backgroundColor:
                    msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                }}
              >
                {msg.role === 'assistant' ? (
                  <div className="text-sm prose-sm prose-invert max-w-none [&_p]:m-0 [&_pre]:my-2 [&_code]:text-xs [&_ul]:my-1 [&_ol]:my-1">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Metadata */}
                {msg.role === 'assistant' && msg.metadata && (
                  <div
                    className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t"
                    style={{ borderColor: 'var(--border-secondary)' }}
                  >
                    {msg.metadata.toolsUsed && msg.metadata.toolsUsed.length > 0 && (
                      <span
                        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Wrench className="w-3 h-3" />
                        {msg.metadata.toolsUsed.join(', ')}
                      </span>
                    )}
                    {msg.metadata.executionTime !== undefined && msg.metadata.executionTime > 0 && (
                      <span
                        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Clock className="w-3 h-3" />
                        {msg.metadata.executionTime}ms
                      </span>
                    )}
                  </div>
                )}

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  title="Copy message"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3" style={{ color: 'var(--accent-success)' }} />
                  ) : (
                    <Copy className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  )}
                </button>
              </div>
              {msg.role === 'user' && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-primary)', opacity: 0.9 }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div
              className="rounded-lg px-3 py-2"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-2">
                <Loader2
                  className="w-4 h-4 animate-spin"
                  style={{ color: 'var(--accent-primary)' }}
                />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="p-3 border-t"
        style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={agentInput}
            onChange={(e) => setAgentInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask the agent anything..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none disabled:opacity-50"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !agentInput.trim()}
            className="p-2 rounded-lg transition-colors disabled:opacity-30"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
