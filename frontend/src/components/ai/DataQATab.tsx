import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Database, Loader2, User, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAiStore } from '@/stores/aiStore'
import { useAuthStore } from '@/stores/authStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { aiDataAssistant } from '@/lib/api'
import type { AiMessage } from '@/types/ai'

export default function DataQATab() {
  const { qaMessages, qaInput, setQaInput, addQaMessage, clearQaMessages, isLoading, setLoading, setLastMetadata } = useAiStore()
  const { host, token } = useAuthStore()
  const { defaultModel, warehouseId, prompts } = useSettingsStore()
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [qaMessages])

  const handleSubmit = async () => {
    const question = qaInput.trim()
    if (!question || isLoading) return

    if (!host || !token) {
      setError('Please configure your Databricks host and token in Settings.')
      return
    }

    setError(null)
    const userMessage: AiMessage = { role: 'user', content: question, timestamp: Date.now() }
    addQaMessage(userMessage)
    setQaInput('')
    setLoading(true)

    try {
      const conversationHistory = qaMessages.map((m) => ({ role: m.role, content: m.content }))
      const result = await aiDataAssistant(
        question,
        host,
        token,
        defaultModel,
        conversationHistory,
        prompts.dataQA || undefined,
        warehouseId || undefined
      )

      const assistantMessage: AiMessage = {
        role: 'assistant',
        content: result.answer,
        timestamp: Date.now(),
      }
      addQaMessage(assistantMessage)

      if (result.metadata) {
        setLastMetadata(result.metadata)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get AI response'
      setError(message)
      addQaMessage({
        role: 'system',
        content: `Error: ${message}`,
        timestamp: Date.now(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {qaMessages.length === 0 && !error && (
          <div className="empty-state" style={{ padding: '48px 16px' }}>
            <Database className="w-12 h-12 empty-state-icon" />
            <p className="text-sm text-center font-medium">
              Ask questions about your data
            </p>
            <p className="text-xs text-center mt-1" style={{ color: 'var(--text-dim)' }}>
              I can generate SQL queries, explain schemas, and more.
            </p>
          </div>
        )}

        {qaMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {msg.role !== 'user' && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: msg.role === 'system'
                    ? 'var(--accent-error)'
                    : 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
                  color: '#fff',
                  boxShadow: msg.role === 'assistant' ? '0 0 12px rgba(20, 184, 166, 0.3)' : undefined,
                }}
              >
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`chat-message max-w-[80%] ${msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'assistant' : ''}`}
              style={msg.role === 'user' ? {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
              } : msg.role === 'system' ? {
                background: 'var(--danger-bg)',
                color: 'var(--accent-error)',
                border: '1px solid var(--accent-error)',
              } : undefined}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              ) : (
                <div className="markdown-content text-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
              {msg.timestamp && (
                <p className="text-[10px] mt-1.5 opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>

            {msg.role === 'user' && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}
              >
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)', color: '#fff' }}
            >
              <Bot className="w-4 h-4" />
            </div>
            <div className="chat-message assistant">
              <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Loader2 className="w-4 h-4 spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && qaMessages.length === 0 && (
          <div className="error-banner text-sm">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3" style={{ borderTop: '1px solid var(--card-border)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-end gap-2">
          <button
            onClick={clearQaMessages}
            className="btn btn-ghost btn-icon flex-shrink-0"
            title="Clear conversation"
            disabled={qaMessages.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <textarea
            ref={inputRef}
            value={qaInput}
            onChange={(e) => setQaInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data..."
            rows={1}
            className="input flex-1 resize-none"
            style={{ maxHeight: '120px', fontSize: '13px', minHeight: '36px' }}
          />

          <button
            onClick={handleSubmit}
            disabled={!qaInput.trim() || isLoading}
            className={`btn flex-shrink-0 ${qaInput.trim() && !isLoading ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '8px' }}
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
