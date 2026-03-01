import axios from 'axios'
import type { HttpMethod, PlaygroundResponse, ModelCallMetadata } from '@/types/api'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// ===== Proxy =====

export async function sendRequest(
  method: HttpMethod,
  path: string,
  body: unknown,
  host: string,
  token: string
): Promise<PlaygroundResponse> {
  const { data } = await api.post('/proxy', { method, path, body, host, token })
  return data
}

// ===== Health =====

export async function checkHealth(host: string, token: string): Promise<{ ok: boolean; message: string; durationMs: number }> {
  const { data } = await api.post('/health/check', { host, token })
  return data
}

// ===== AI =====

export async function aiRecommendEndpoint(query: string, host: string, token: string, model?: string, customSystemPrompt?: string) {
  const { data } = await api.post('/ai/recommend-endpoint', { query, host, token, model, customSystemPrompt })
  return data as { recommendation: string; metadata: ModelCallMetadata }
}

export async function aiNaturalLanguageToApi(query: string, host: string, token: string, model?: string, systemPrompt?: string) {
  const { data } = await api.post('/ai/natural-language-to-api', { query, host, token, model, systemPrompt })
  return data as { apiCall: string; metadata: ModelCallMetadata }
}

export async function aiSuggestParameters(endpoint: string, method: string, userIntent: string, host: string, token: string, model?: string, customSystemPrompt?: string) {
  const { data } = await api.post('/ai/suggest-parameters', { endpoint, method, userIntent, host, token, model, customSystemPrompt })
  return data as { suggestion: string }
}

export async function aiAnalyzeResponse(endpoint: string, method: string, response: unknown, host: string, token: string, model?: string, customSystemPrompt?: string) {
  const { data } = await api.post('/ai/analyze-response', { endpoint, method, response, host, token, model, customSystemPrompt })
  return data as { analysis: string; metadata: ModelCallMetadata }
}

export async function aiExplainError(endpoint: string, method: string, errorResponse: unknown, host: string, token: string, model?: string, requestBody?: unknown, customSystemPrompt?: string) {
  const { data } = await api.post('/ai/explain-error', { endpoint, method, errorResponse, host, token, model, requestBody, customSystemPrompt })
  return data as { explanation: string }
}

export async function aiDataAssistant(question: string, host: string, token: string, model?: string, conversationHistory?: Array<{ role: string; content: string }>, systemPrompt?: string, warehouseId?: string) {
  const { data } = await api.post('/ai/data-assistant', { question, host, token, model, conversationHistory, systemPrompt, warehouseId })
  return data as { answer: string; metadata: ModelCallMetadata }
}

export async function aiGenerateWorkflow(goal: string, host: string, token: string, model?: string, customSystemPrompt?: string) {
  const { data } = await api.post('/ai/generate-workflow', { goal, host, token, model, customSystemPrompt })
  return data as { workflow: string; metadata: ModelCallMetadata }
}

export async function aiGenerateScript(prompt: string, host: string, token: string, model?: string, category?: string, customSystemPrompt?: string) {
  const { data } = await api.post('/ai/generate-script', { prompt, host, token, model, category, customSystemPrompt })
  return data as { script: string; language: string; metadata: ModelCallMetadata }
}

export async function aiExecuteScript(script: string, host: string, token: string, dryRun?: boolean) {
  const { data } = await api.post('/ai/execute-script', { script, host, token, dryRun })
  return data as { success: boolean; logs: string[]; output: string; error?: string; durationMs: number }
}

export async function aiGenerateTests(endpoint: string, method: string, host: string, token: string, model?: string, customSystemPrompt?: string) {
  const { data } = await api.post('/ai/generate-tests', { endpoint, method, host, token, model, customSystemPrompt })
  return data as { tests: string; metadata: ModelCallMetadata }
}

export async function aiGenerateCode(endpoint: string, method: string, host: string, token: string, body?: unknown, model?: string, customSystemPrompt?: string) {
  const { data } = await api.post('/ai/generate-code', { endpoint, method, host, token, body, model, customSystemPrompt })
  return data as { code: string; metadata: ModelCallMetadata }
}

export async function aiGenerateDocumentation(endpoint: string, method: string, description: string, host: string, token: string, model?: string, customSystemPrompt?: string) {
  const { data } = await api.post('/ai/generate-documentation', { endpoint, method, description, host, token, model, customSystemPrompt })
  return data as { documentation: string }
}

export async function aiPromptExecutor(prompt: string, host: string, token: string, model?: string) {
  const { data } = await api.post('/ai/prompt-executor', { prompt, host, token, model })
  return data as { result: string; content: string; metadata: ModelCallMetadata }
}

export async function aiGeneratePrompt(goal: string, host: string, token: string, model?: string, systemPrompt?: string) {
  const { data } = await api.post('/ai/generate-prompt', { goal, host, token, model, systemPrompt })
  return data as { prompt: string; metadata: ModelCallMetadata }
}

export async function aiGenerateQuery(systemPrompt: string, userPrompt: string, host: string, token: string, model?: string) {
  const { data } = await api.post('/ai/generate-query', { systemPrompt, userPrompt, host, token, model })
  return data
}

export async function aiSecurityRecommendations(endpoint: string, method: string, host: string, token: string, model?: string, customSystemPrompt?: string) {
  const { data } = await api.post('/ai/security-recommendations', { endpoint, method, host, token, model, customSystemPrompt })
  return data as { recommendations: string; metadata: ModelCallMetadata }
}

// ===== Models & Pricing =====

export async function listModels(host: string, token: string) {
  const { data } = await api.get('/ai/models', { params: { host, token } })
  return data as { models: string[] }
}

export async function getPricing() {
  const { data } = await api.get('/ai/pricing')
  return data
}

// ===== Query Execution =====

export async function executeQuery(sql: string, warehouseId: string, host: string, token: string) {
  const { data } = await api.post('/ai/execute-query', { sql, warehouseId, host, token })
  return data
}

export async function getQueryResults(queryId: string, page?: number, pageSize?: number) {
  const { data } = await api.get(`/ai/query-results/${queryId}`, { params: { page, pageSize } })
  return data
}

export async function exportQueryResults(queryId: string, format?: string) {
  const { data } = await api.get(`/ai/query-export/${queryId}`, { params: { format } })
  return data
}

export async function listWarehouses(host: string, token: string) {
  const { data } = await api.post('/ai/list-warehouses', { host, token })
  return data as { warehouses: Array<{ id: string; name: string; state: string }> }
}

// ===== Agent =====

export async function agentChat(message: string, host: string, token: string, history?: Array<{ role: string; content: string }>) {
  const { data } = await api.post('/agent/chat', { message, host, token, history, useFoundationModel: true })
  return data as { response: string; metadata: Record<string, unknown> }
}

export async function listAgentHandlers() {
  const { data } = await api.get('/agent/handlers')
  return data as { handlers: Array<{ name: string; description: string }> }
}

// ===== Custom Agents =====

export async function listCustomAgents() {
  const { data } = await api.get('/custom-agents')
  return data
}

export async function createCustomAgent(agent: { name: string; description: string; pattern: string; handler: string; config?: Record<string, unknown>; enabled?: boolean }) {
  const { data } = await api.post('/custom-agents', agent)
  return data
}

export async function updateCustomAgent(id: string, update: Record<string, unknown>) {
  const { data } = await api.put(`/custom-agents/${id}`, update)
  return data
}

export async function deleteCustomAgent(id: string) {
  const { data } = await api.delete(`/custom-agents/${id}`)
  return data
}

// ===== Azure =====

export async function azureLogin() {
  const { data } = await api.post('/azure/auth/login', {}, { timeout: 120000 })
  return data as { access_token: string; user_name: string; user_email: string; method: string; expires_on: string }
}

export async function azureLogout() {
  const { data } = await api.post('/azure/auth/logout')
  return data
}

export async function azureAuthStatus() {
  const { data } = await api.get('/azure/auth/status')
  return data as { authenticated: boolean; user_name: string }
}

export async function azureLoginTenant(tenantId: string) {
  const { data } = await api.post(`/azure/login-tenant?tenant_id=${encodeURIComponent(tenantId)}`)
  return data
}

export async function listAzureTenants() {
  const { data } = await api.get('/azure/tenants')
  return data
}

export async function listAzureSubscriptions() {
  const { data } = await api.get('/azure/subscriptions')
  return data
}

export async function listAzureWorkspaces(subscriptionId: string) {
  const { data } = await api.get('/azure/workspaces', { params: { subscriptionId } })
  return data
}

export async function databricksWorkspaceAccess(resourceId: string) {
  const { data } = await api.post('/azure/databricks-workspace-access', { resource_id: resourceId })
  return data as { workspace_url: string; token: string; name: string }
}

// ===== Notebooks =====

export async function uploadNotebook(path: string, host: string, token: string, notebook?: Record<string, unknown>, script?: string) {
  const { data } = await api.post('/notebooks/upload', { path, host, token, notebook, script })
  return data
}

// ===== Tools =====

export async function generateOpenApiCatalog() {
  const { data } = await api.get('/tools/generate-openapi-catalog')
  return data
}

export async function generateTestData(method: string, path: string, host: string, token: string, model?: string) {
  const { data } = await api.post('/tools/generate-test-data', { method, path, host, token, model })
  return data
}
