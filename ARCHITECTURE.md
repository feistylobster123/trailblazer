# TrailBlazer Architecture Guide

This document is the source of truth for all code in this project. Every agent/contributor MUST read this before writing code.

## Tech Stack
- React 18 + TypeScript (strict mode)
- Vite with @tailwindcss/vite plugin
- TailwindCSS v4 (CSS-first config via @theme in src/styles/index.css)
- React Router v6 with HashRouter (for GitHub Pages)
- Leaflet + react-leaflet for maps
- Recharts for charts
- Zustand for state management
- Path alias: `@/` maps to `src/`

## Design System

### Colors (CSS custom properties defined in src/styles/index.css)
- `--color-primary`: #1B4332 (deep forest green)
- `--color-primary-light`: #2D6A4F
- `--color-accent`: #E76F51 (burnt orange)
- `--color-accent-light`: #F4A261 (sunset amber)
- `--color-bg`: #FAFAF5 (warm off-white)
- `--color-surface`: #FFFFFF
- `--color-text`: #2D3436 (charcoal)
- `--color-text-secondary`: #636E72
- `--color-border`: #E5E1DA (warm gray)
- `--color-success`: #52B788 (trail green)
- `--color-warning`: #F4A261 (sunset amber)
- `--color-danger`: #E63946 (red rock)

### Typography
- Font: system-ui stack
- Headings: font-bold or font-extrabold
- Body: text-base (16px)

### Spacing
- Use Tailwind spacing scale (p-4, gap-6, etc.)
- Page max width: max-w-7xl mx-auto
- Section spacing: py-8 or py-12
- Card padding: p-4 or p-6

### Components
- All UI components accept `className` prop for extension
- Use Tailwind classes directly, no CSS modules
- Mobile-first: design for 375px, then add md: and lg: breakpoints

## Data Flow
```
Component -> Hook -> Store -> Service (via registry) -> Mock Implementation
```
- Components NEVER import mock services directly
- Components use hooks (useAuth, useRace, etc.)
- Hooks wrap Zustand stores
- Stores call services via getService() registry
- Mock implementations use localStorage + seeded PRNG

## File Conventions
- Feature pages: `src/features/{feature-name}/{ComponentName}.tsx`
- Shared UI: `src/components/ui/{ComponentName}.tsx`
- Types: `src/types/{domain}.ts` (no logic, pure types)
- Services: `src/services/interfaces/{domain}.service.ts` (interfaces only)
- Mock services: `src/services/mock/{domain}.mock.ts`
- Each component file exports a single default or named export matching the filename

## Import Order
1. React/external libraries
2. @/ absolute imports (types, services, hooks, components)
3. Relative imports (sibling components)

## Key Constraints
- NO server-side code. Everything runs in the browser.
- All data is mocked. Service layer abstracts this so real APIs can be swapped in.
- HashRouter is used (URLs look like /#/races/western-states-100)
- GitHub Pages base path is /trailblazer/
- Keep bundle size reasonable - lazy load feature pages
- TailwindCSS v4 uses CSS-based configuration, NOT tailwind.config.js
