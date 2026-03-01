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
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <Database className="w-10 h-10 opacity-30" />
            <p className="text-sm text-center">
              Ask questions about your data in natural language.
              <br />
              I can generate SQL queries, explain schemas, and more.
            </p>
          </div>
        )}

        {qaMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: msg.role === 'system' ? 'var(--accent-error)' : 'var(--accent-primary)',
                  color: '#fff',
                }}
              >
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className="max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm"
              style={{
                backgroundColor: msg.role === 'user'
                  ? 'var(--accent-primary)'
                  : msg.role === 'system'
                    ? 'rgba(248, 81, 73, 0.1)'
                    : 'var(--bg-card)',
                color: msg.role === 'user'
                  ? '#fff'
                  : msg.role === 'system'
                    ? 'var(--accent-error)'
                    : 'var(--text-primary)',
                border: msg.role === 'assistant' ? '1px solid var(--border-primary)' : 'none',
              }}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
              {msg.timestamp && (
                <p
                  className="text-[10px] mt-1.5 opacity-60"
                  style={{ color: msg.role === 'user' ? '#fff' : 'var(--text-muted)' }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>

            {msg.role === 'user' && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
            >
              <Bot className="w-4 h-4" />
            </div>
            <div
              className="rounded-lg px-3.5 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
            >
              <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && qaMessages.length === 0 && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: 'var(--accent-error)', border: '1px solid var(--accent-error)' }}
          >
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="border-t p-3"
        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
      >
        <div className="flex items-end gap-2">
          <button
            onClick={clearQaMessages}
            className="p-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-tertiary)' }}
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
            className="flex-1 resize-none rounded-lg px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              maxHeight: '120px',
            }}
          />

          <button
            onClick={handleSubmit}
            disabled={!qaInput.trim() || isLoading}
            className="p-2 rounded-lg transition-colors flex-shrink-0"
            style={{
              backgroundColor: qaInput.trim() && !isLoading ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: qaInput.trim() && !isLoading ? '#fff' : 'var(--text-muted)',
            }}
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
