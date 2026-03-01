export interface AzureTenant {
  tenantId: string
  displayName?: string
}

export interface AzureSubscription {
  subscriptionId: string
  displayName: string
  state?: string
}

export interface DatabricksWorkspace {
  id: string
  name: string
  location: string
  workspaceUrl?: string
  properties?: Record<string, unknown>
}
