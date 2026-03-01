import type { HttpMethod } from '@/types/api'
import { downloadFile } from './exportFormats'

interface RequestInfo {
  method: HttpMethod
  path: string
  host: string
  token: string
  body?: unknown
}

export function exportToPostman(request: RequestInfo, history?: RequestInfo[]) {
  const items = (history || [request]).map((req, i) => ({
    name: `${req.method} ${req.path}`,
    request: {
      method: req.method,
      header: [
        { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' },
        { key: 'Content-Type', value: 'application/json', type: 'text' },
      ],
      url: {
        raw: `{{host}}${req.path}`,
        host: ['{{host}}'],
        path: req.path.split('/').filter(Boolean),
      },
      ...(req.body ? { body: { mode: 'raw', raw: JSON.stringify(req.body, null, 2) } } : {}),
    },
  }))

  const collection = {
    info: {
      name: 'Intelligence Studio - Databricks API',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: items,
    variable: [
      { key: 'host', value: request.host },
      { key: 'token', value: request.token },
    ],
  }

  downloadFile(JSON.stringify(collection, null, 2), 'databricks-collection.postman_collection.json', 'application/json')
}

export function exportToInsomnia(request: RequestInfo) {
  const collection = {
    _type: 'export',
    __export_format: 4,
    resources: [
      {
        _id: 'wrk_1',
        _type: 'workspace',
        name: 'Intelligence Studio - Databricks',
      },
      {
        _id: 'req_1',
        _type: 'request',
        parentId: 'wrk_1',
        name: `${request.method} ${request.path}`,
        method: request.method,
        url: `${request.host}${request.path}`,
        headers: [
          { name: 'Authorization', value: `Bearer ${request.token}` },
          { name: 'Content-Type', value: 'application/json' },
        ],
        ...(request.body ? { body: { mimeType: 'application/json', text: JSON.stringify(request.body, null, 2) } } : {}),
      },
    ],
  }

  downloadFile(JSON.stringify(collection, null, 2), 'databricks-insomnia.json', 'application/json')
}

export function generateGitHubActionsWorkflow(request: RequestInfo): string {
  const workflow = `name: Databricks API Call
on:
  workflow_dispatch:

jobs:
  api-call:
    runs-on: ubuntu-latest
    steps:
      - name: Call Databricks API
        run: |
          curl -X ${request.method} '${request.host}${request.path}' \\
            -H 'Authorization: Bearer \${{ secrets.DATABRICKS_TOKEN }}' \\
            -H 'Content-Type: application/json'${request.body ? ` \\\n            -d '${JSON.stringify(request.body)}'` : ''}
        env:
          DATABRICKS_TOKEN: \${{ secrets.DATABRICKS_TOKEN }}
`
  downloadFile(workflow, 'databricks-api.yml', 'text/yaml')
  return workflow
}

export function exportAsCurlScript(request: RequestInfo): string {
  let script = '#!/bin/bash\n\n'
  script += `# Databricks API Call\n`
  script += `HOST="${request.host}"\n`
  script += `TOKEN="${request.token}"\n\n`
  script += `curl -X ${request.method} "\${HOST}${request.path}" \\\n`
  script += `  -H "Authorization: Bearer \${TOKEN}" \\\n`
  script += `  -H "Content-Type: application/json"`
  if (request.body) {
    script += ` \\\n  -d '${JSON.stringify(request.body, null, 2)}'`
  }
  script += '\n'
  downloadFile(script, 'databricks-api.sh', 'text/x-shellscript')
  return script
}
