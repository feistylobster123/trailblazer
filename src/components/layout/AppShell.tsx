import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Races' },
  { to: '/races/western-states-100/live', label: 'Live' },
  { to: '/runners/runner-001', label: 'Profile' },
]

function Navbar() {
  const location = useLocation()
  return (
    <header className="bg-primary text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
          <span className="text-xl">🏔️</span>
          <span>TrailBlazer</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-accent-light ${
                location.pathname === link.to ? 'text-accent-light' : 'text-white/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="text-sm font-medium bg-accent hover:bg-accent-dark px-4 py-1.5 rounded-full transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  )
}

function MobileNav() {
  const location = useLocation()
  const tabs = [
    { to: '/', label: 'Races', icon: '🏃' },
    { to: '/races/western-states-100/live', label: 'Live', icon: '📡' },
    { to: '/runners/runner-001', label: 'Profile', icon: '👤' },
    { to: '/login', label: 'More', icon: '☰' },
  ]
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      <div className="flex justify-around items-center h-14">
        {tabs.map(tab => (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              location.pathname === tab.to ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-primary-dark text-white/60 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        <p className="font-bold text-white/80 mb-2">🏔️ TrailBlazer</p>
        <p>The ultimate endurance race platform. Built for runners, by runners.</p>
        <p className="mt-4 text-xs text-white/40">Demo MVP - Mock data only</p>
      </div>
    </footer>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </>
  )
}
