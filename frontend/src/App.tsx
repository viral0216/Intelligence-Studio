import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import HeaderBar from '@/components/layout/HeaderBar'
import MainLayout from '@/components/layout/MainLayout'
import SettingsModal from '@/components/settings/SettingsModal'

export default function App() {
  const theme = useSettingsStore((s) => s.theme)
  const settingsOpen = useSettingsStore((s) => s.settingsOpen)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <HeaderBar />
      <MainLayout />
      {settingsOpen && <SettingsModal />}
    </div>
  )
}
