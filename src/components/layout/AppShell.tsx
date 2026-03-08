import type { ReactNode } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'

// SVG Icons

function IconGrid({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function IconSignal({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12a10 10 0 0 1 20 0" />
      <path d="M6 12a6 6 0 0 1 12 0" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconMountain({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3L3 21h18L14 3z" />
      <path d="M11 9l-3 12" />
      <path d="M13 9l3 12" />
    </svg>
  )
}

// Types

interface NavLink {
  to: string
  label: string
  matchPrefix?: string
}

interface UserInfo {
  name: string
  avatar?: string
}

// Helpers

const navLinks: NavLink[] = [
  { to: '/', label: 'Races', matchPrefix: '/' },
  { to: '/races/western-states-100/live', label: 'Live', matchPrefix: '/races' },
  { to: '/races/western-states-100/results/2025', label: 'Results', matchPrefix: '/races' },
  { to: '/runners/runner-001', label: 'Profile', matchPrefix: '/runners' },
]

function isActive(link: NavLink, pathname: string): boolean {
  // Exact match for root
  if (link.to === '/') return pathname === '/'
  // Prefix match for nested routes
  return pathname.startsWith(link.to) || (link.matchPrefix !== undefined && link.matchPrefix !== '/' && pathname.startsWith(link.matchPrefix) && link.to.startsWith(link.matchPrefix))
}

function getUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem('trailblazer_user')
    if (!raw) return null
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

// Navbar

function Navbar({ onMenuToggle, menuOpen }: { onMenuToggle: () => void; menuOpen: boolean }) {
  const location = useLocation()
  const user = getUser()

  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight shrink-0">
          <IconMountain className="w-5 h-5 text-accent-light" />
          <span>TrailBlazer</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-accent-light ${
                isActive(link, location.pathname) ? 'text-accent-light underline underline-offset-4' : 'text-white/80'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-2 text-sm font-medium">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-white/30" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold uppercase">
                  {user.name.charAt(0)}
                </span>
              )}
              <span className="text-white/90">{user.name}</span>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium bg-accent hover:bg-accent-dark px-4 py-1.5 rounded-full transition-colors"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          {menuOpen ? <IconX className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile slide-out menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="px-4 pb-4 flex flex-col gap-1 border-t border-white/10">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onMenuToggle}
              className={`px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                isActive(link, location.pathname)
                  ? 'bg-white/10 text-accent-light'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-white/10">
            {user ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-white/30" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold uppercase">
                    {user.name.charAt(0)}
                  </span>
                )}
                <span className="text-white/90 font-medium">{user.name}</span>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={onMenuToggle}
                className="block px-3 py-2 rounded-md text-sm font-medium bg-accent hover:bg-accent-dark text-white transition-colors text-center"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

// MobileNav

function MobileNav() {
  const location = useLocation()

  const tabs = [
    { to: '/', label: 'Races', icon: IconGrid, matchPrefix: '/' },
    { to: '/races/western-states-100/live', label: 'Live', icon: IconSignal, matchPrefix: '/races' },
    { to: '/runners/runner-001', label: 'Profile', icon: IconUser, matchPrefix: '/runners' },
    { to: '/login', label: 'Menu', icon: IconMenu, matchPrefix: '/login' },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => {
          const active = tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.matchPrefix) && tab.matchPrefix !== '/'
          const Icon = tab.icon
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors min-w-[3.5rem] py-2 ${
                active ? 'text-primary' : 'text-text-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Footer

function Footer() {
  const raceLinks = [
    { label: 'All Races', to: '/' },
    { label: 'Live Tracking', to: '/races/western-states-100/live' },
    { label: 'Results', to: '/races/western-states-100/results/2025' },
  ]

  const accountLinks = [
    { label: 'My Profile', to: '/runners/runner-001' },
    { label: 'Sign In', to: '/login' },
  ]

  return (
    <footer className="bg-primary-dark text-white/60 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        {/* Two-column on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-extrabold text-white/90 text-base mb-2">
              <IconMountain className="w-4 h-4 text-accent-light" />
              <span>TrailBlazer</span>
            </div>
            <p className="text-sm leading-relaxed">
              The ultimate endurance race platform. Built for runners, by runners.
            </p>
            <p className="mt-3 text-xs text-white/30">Demo MVP — Mock data only</p>
          </div>

          {/* Races links */}
          <div>
            <h3 className="text-white/80 font-semibold text-sm mb-3 uppercase tracking-wide">Races</h3>
            <ul className="flex flex-col gap-2">
              {raceLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/50 hover:text-white/80 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account links */}
          <div>
            <h3 className="text-white/80 font-semibold text-sm mb-3 uppercase tracking-wide">Account</h3>
            <ul className="flex flex-col gap-2">
              {accountLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/50 hover:text-white/80 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} TrailBlazer. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

// AppShell

export function AppShell({ children, className }: { children: ReactNode } & { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), [])

  return (
    <div className={className}>
      <Navbar onMenuToggle={toggleMenu} menuOpen={menuOpen} />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
