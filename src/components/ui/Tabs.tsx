import { useState, type ReactNode } from 'react'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab?: string
  onChange?: (tabId: string) => void
  children?: ReactNode
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id ?? '')
  const active = activeTab ?? internalActive

  const handleChange = (tabId: string) => {
    if (onChange) {
      onChange(tabId)
    } else {
      setInternalActive(tabId)
    }
  }

  return (
    <div className={`border-b border-border ${className}`}>
      <nav className="flex gap-0 overflow-x-auto scrollbar-none -mb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer
              ${active === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text hover:border-border'
              }`}
          >
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

interface TabPanelProps {
  tabId: string
  activeTab: string
  children: ReactNode
  className?: string
}

export function TabPanel({ tabId, activeTab, children, className = '' }: TabPanelProps) {
  if (tabId !== activeTab) return null
  return <div className={className}>{children}</div>
}
