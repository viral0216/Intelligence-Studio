import { Database, Server, Briefcase, FileText, Shield, Users, GitBranch, BarChart3, Cpu, Layers } from 'lucide-react'

const navItems = [
  { icon: Database, label: 'Unity Catalog', id: 'catalog' },
  { icon: Server, label: 'Clusters', id: 'clusters' },
  { icon: Briefcase, label: 'Jobs', id: 'jobs' },
  { icon: FileText, label: 'Notebooks', id: 'notebooks' },
  { icon: Layers, label: 'SQL Warehouses', id: 'warehouses' },
  { icon: Users, label: 'Users & Groups', id: 'users' },
  { icon: Shield, label: 'Secrets', id: 'secrets' },
  { icon: GitBranch, label: 'Repos', id: 'repos' },
  { icon: Cpu, label: 'Serving', id: 'serving' },
  { icon: BarChart3, label: 'MLflow', id: 'mlflow' },
]

interface SidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <nav
      className="w-14 flex flex-col items-center py-2 gap-1 border-r"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
    >
      {navItems.map(({ icon: Icon, label, id }) => (
        <button
          key={id}
          title={label}
          onClick={() => onSectionChange?.(id)}
          className="p-2 rounded-lg transition-colors"
          style={{
            backgroundColor: activeSection === id ? 'var(--bg-hover)' : 'transparent',
            color: activeSection === id ? 'var(--accent-primary)' : 'var(--text-muted)',
          }}
          onMouseEnter={(e) => {
            if (activeSection !== id) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
          }}
          onMouseLeave={(e) => {
            if (activeSection !== id) e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </nav>
  )
}
