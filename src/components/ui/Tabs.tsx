import { useState, useRef, useEffect, type ReactNode } from 'react'

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
  const indicatorRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const handleChange = (tabId: string) => {
    if (onChange) {
      onChange(tabId)
    } else {
      setInternalActive(tabId)
    }
  }

  // Animate the active tab indicator
  useEffect(() => {
    const activeButton = tabRefs.current.get(active)
    const indicator = indicatorRef.current
    if (activeButton && indicator) {
      const { offsetLeft, offsetWidth } = activeButton
      indicator.style.transform = `translateX(${offsetLeft}px)`
      indicator.style.width = `${offsetWidth}px`
    }
  }, [active])

  return (
    <div className={`relative border-b border-border ${className}`}>
      <nav className="flex gap-0 overflow-x-auto -mb-px" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            ref={(el) => { if (el) tabRefs.current.set(tab.id, el) }}
            onClick={() => handleChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 border-transparent transition-colors cursor-pointer
              ${active === tab.id
                ? 'text-primary'
                : 'text-text-secondary hover:text-text'
              }`}
          >
            {tab.icon && <span className="text-base">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
      {/* Sliding indicator */}
      <div
        ref={indicatorRef}
        className="absolute bottom-0 h-0.5 bg-primary transition-all duration-250"
        style={{ transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)' }}
      />
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
  return <div className={`tab-panel-enter ${className}`}>{children}</div>
}
