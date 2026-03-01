import { useState, useCallback } from 'react'

interface GraphNode {
  id: string
  label: string
  type: string
}

interface GraphEdge {
  source: string
  target: string
  label?: string
}

export function useDependencyGraph() {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])

  const addNode = useCallback((node: GraphNode) => {
    setNodes((prev) => {
      if (prev.find((n) => n.id === node.id)) return prev
      return [...prev, node]
    })
  }, [])

  const addEdge = useCallback((edge: GraphEdge) => {
    setEdges((prev) => {
      if (prev.find((e) => e.source === edge.source && e.target === edge.target)) return prev
      return [...prev, edge]
    })
  }, [])

  const clear = useCallback(() => {
    setNodes([])
    setEdges([])
  }, [])

  const buildFromCatalog = useCallback((catalog: string, schemas: string[], tables: string[]) => {
    const catalogNode: GraphNode = { id: catalog, label: catalog, type: 'catalog' }
    addNode(catalogNode)

    for (const schema of schemas) {
      const schemaId = `${catalog}.${schema}`
      addNode({ id: schemaId, label: schema, type: 'schema' })
      addEdge({ source: catalog, target: schemaId })

      for (const table of tables) {
        const tableId = `${schemaId}.${table}`
        addNode({ id: tableId, label: table, type: 'table' })
        addEdge({ source: schemaId, target: tableId })
      }
    }
  }, [addNode, addEdge])

  return { nodes, edges, addNode, addEdge, clear, buildFromCatalog }
}
