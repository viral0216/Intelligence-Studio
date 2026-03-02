import { API_CATALOG, type ApiCategory, type ApiEndpoint } from './apiCatalog'
import { downloadFile } from './exportFormats'

// ── Counts ──

function countEndpoints(categories: ApiCategory[]): number {
  let total = 0
  for (const cat of categories) {
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        total += sub.endpoints.length
      }
    }
    if (cat.endpoints) {
      total += cat.endpoints.length
    }
  }
  return total
}

export function getCatalogEndpointCount(filter?: 'workspace' | 'account'): number {
  const categories = filter
    ? API_CATALOG.filter((c) => (c.audience || 'workspace') === filter)
    : API_CATALOG
  return countEndpoints(categories)
}

// ── Helpers ──

function endpointToPostmanItem(ep: ApiEndpoint) {
  const [pathPart, queryString] = ep.path.split('?')
  const queryParams = queryString
    ? queryString.split('&').map((p) => {
        const [key, value] = p.split('=')
        return { key, value: value || '' }
      })
    : []

  return {
    name: ep.label,
    request: {
      method: ep.method,
      header: [
        { key: 'Authorization', value: 'Bearer {{token}}', type: 'text' },
        { key: 'Content-Type', value: 'application/json', type: 'text' },
      ],
      url: {
        raw: `{{host}}${ep.path}`,
        host: ['{{host}}'],
        path: pathPart.split('/').filter(Boolean),
        ...(queryParams.length > 0 ? { query: queryParams } : {}),
      },
      ...(ep.body
        ? { body: { mode: 'raw', raw: JSON.stringify(ep.body, null, 2), options: { raw: { language: 'json' } } } }
        : {}),
      description: ep.docs?.summary || ep.description || '',
    },
  }
}

function categoryToPostmanFolder(cat: ApiCategory) {
  const items: unknown[] = []

  if (cat.subcategories) {
    for (const sub of cat.subcategories) {
      items.push({
        name: sub.name,
        item: sub.endpoints.map(endpointToPostmanItem),
      })
    }
  }

  if (cat.endpoints) {
    items.push(...cat.endpoints.map(endpointToPostmanItem))
  }

  return {
    name: cat.name,
    item: items,
    ...(cat.audience === 'account'
      ? { description: 'Account-level APIs — use the account console URL (e.g., accounts.azuredatabricks.net)' }
      : {}),
  }
}

// ── Postman Collection v2.1 ──

export function exportCatalogToPostman(filter?: 'workspace' | 'account') {
  const categories = filter
    ? API_CATALOG.filter((c) => (c.audience || 'workspace') === filter)
    : API_CATALOG

  const collection = {
    info: {
      name: filter
        ? `Databricks ${filter === 'account' ? 'Account' : 'Workspace'} APIs`
        : 'Databricks API — Full Catalog',
      description: 'Auto-generated from Intelligence Studio API catalog. Contains all preset API endpoints.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: categories.map(categoryToPostmanFolder),
    variable: [
      { key: 'host', value: 'https://your-workspace.azuredatabricks.net', description: 'Databricks workspace or account console URL' },
      { key: 'token', value: '', description: 'Databricks personal access token' },
    ],
    auth: {
      type: 'bearer',
      bearer: [{ key: 'token', value: '{{token}}', type: 'string' }],
    },
  }

  const suffix = filter ? `-${filter}` : ''
  downloadFile(
    JSON.stringify(collection, null, 2),
    `databricks-api${suffix}.postman_collection.json`,
    'application/json'
  )
}

// ── OpenAPI 3.0 ──

export function exportCatalogToOpenAPI(filter?: 'workspace' | 'account') {
  const categories = filter
    ? API_CATALOG.filter((c) => (c.audience || 'workspace') === filter)
    : API_CATALOG

  const paths: Record<string, Record<string, unknown>> = {}

  const addEndpoint = (ep: ApiEndpoint, tag: string) => {
    const [pathPart, queryString] = ep.path.split('?')
    const method = ep.method.toLowerCase()
    if (!paths[pathPart]) paths[pathPart] = {}

    const parameters: unknown[] = []
    if (queryString) {
      queryString.split('&').forEach((p) => {
        const [name, example] = p.split('=')
        parameters.push({
          name,
          in: 'query',
          schema: { type: 'string' },
          example: example || '',
        })
      })
    }

    // Extract path parameters like {ACCOUNT_ID}, {WORKSPACE_ID} etc.
    const pathParams = pathPart.match(/[A-Z_]{2,}/g) || []
    pathParams.forEach((param) => {
      parameters.push({
        name: param,
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description: param.replace(/_/g, ' ').toLowerCase(),
      })
    })

    paths[pathPart][method] = {
      tags: [tag],
      summary: ep.label,
      description: ep.docs?.summary || ep.description || '',
      ...(ep.docs?.docUrl ? { externalDocs: { url: ep.docs.docUrl } } : {}),
      ...(parameters.length > 0 ? { parameters } : {}),
      ...(ep.body
        ? {
            requestBody: {
              content: {
                'application/json': {
                  schema: { type: 'object' },
                  example: ep.body,
                },
              },
            },
          }
        : {}),
      responses: {
        '200': { description: 'Successful response' },
      },
      security: [{ BearerAuth: [] }],
    }
  }

  for (const cat of categories) {
    const tag = cat.name
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        sub.endpoints.forEach((ep) => addEndpoint(ep, `${tag} > ${sub.name}`))
      }
    }
    if (cat.endpoints) {
      cat.endpoints.forEach((ep) => addEndpoint(ep, tag))
    }
  }

  const spec = {
    openapi: '3.0.3',
    info: {
      title: filter
        ? `Databricks ${filter === 'account' ? 'Account' : 'Workspace'} API`
        : 'Databricks API — Full Catalog',
      description: 'Auto-generated from Intelligence Studio API catalog.',
      version: '1.0.0',
    },
    servers: [
      { url: 'https://your-workspace.azuredatabricks.net', description: 'Databricks workspace' },
      { url: 'https://accounts.azuredatabricks.net', description: 'Databricks account console (Azure)' },
      { url: 'https://accounts.cloud.databricks.com', description: 'Databricks account console (AWS)' },
    ],
    paths,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Databricks personal access token',
        },
      },
    },
  }

  const suffix = filter ? `-${filter}` : ''
  downloadFile(
    JSON.stringify(spec, null, 2),
    `databricks-api${suffix}.openapi.json`,
    'application/json'
  )
}

// ── Insomnia v4 ──

export function exportCatalogToInsomnia(filter?: 'workspace' | 'account') {
  const categories = filter
    ? API_CATALOG.filter((c) => (c.audience || 'workspace') === filter)
    : API_CATALOG

  let idCounter = 1
  const nextId = (prefix: string) => `${prefix}_${idCounter++}`

  const resources: unknown[] = []

  const wsId = nextId('wrk')
  resources.push({
    _id: wsId,
    _type: 'workspace',
    name: filter
      ? `Databricks ${filter === 'account' ? 'Account' : 'Workspace'} APIs`
      : 'Databricks API — Full Catalog',
    description: 'Auto-generated from Intelligence Studio API catalog.',
  })

  const envId = nextId('env')
  resources.push({
    _id: envId,
    _type: 'environment',
    parentId: wsId,
    name: 'Databricks',
    data: {
      host: 'https://your-workspace.azuredatabricks.net',
      token: '',
    },
  })

  for (const cat of categories) {
    const catId = nextId('fld')
    resources.push({
      _id: catId,
      _type: 'request_group',
      parentId: wsId,
      name: cat.name,
    })

    const addEndpointRequest = (ep: ApiEndpoint, parentId: string) => {
      resources.push({
        _id: nextId('req'),
        _type: 'request',
        parentId,
        name: ep.label,
        method: ep.method,
        url: `{{ _.host }}${ep.path}`,
        headers: [
          { name: 'Authorization', value: 'Bearer {{ _.token }}' },
          { name: 'Content-Type', value: 'application/json' },
        ],
        ...(ep.body
          ? { body: { mimeType: 'application/json', text: JSON.stringify(ep.body, null, 2) } }
          : {}),
        description: ep.docs?.summary || ep.description || '',
      })
    }

    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        const subId = nextId('fld')
        resources.push({
          _id: subId,
          _type: 'request_group',
          parentId: catId,
          name: sub.name,
        })
        sub.endpoints.forEach((ep) => addEndpointRequest(ep, subId))
      }
    }

    if (cat.endpoints) {
      cat.endpoints.forEach((ep) => addEndpointRequest(ep, catId))
    }
  }

  const insomniaExport = {
    _type: 'export',
    __export_format: 4,
    __export_date: new Date().toISOString(),
    __export_source: 'intelligence-studio',
    resources,
  }

  const suffix = filter ? `-${filter}` : ''
  downloadFile(
    JSON.stringify(insomniaExport, null, 2),
    `databricks-api${suffix}.insomnia.json`,
    'application/json'
  )
}
