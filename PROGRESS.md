# TrailBlazer Build Progress

This file tracks what's been built, what's in progress, and what's remaining.
Updated after each wave/commit. Used for resuming after context interruptions.

## Wave 0: Project Scaffold [COMPLETE]
- [x] Vite + React + TS + TailwindCSS v4
- [x] GitHub Actions deploy workflow
- [x] HashRouter for GitHub Pages
- [x] Service registry pattern
- [x] All page placeholders with lazy loading

## Wave 1: Foundation Layer [COMPLETE]
- [x] 9 domain type files (race, runner, results, tracking, registration, crew, auth, streaming)
- [x] 8 service interfaces with full method signatures
- [x] 16 UI components (Button, Card, Badge, Avatar, Modal, Tabs, StatCard, Input, Select, Checkbox, Stepper, Skeleton, EmptyState, ProgressBar, Tooltip, SearchInput)
- [x] Layout components (AppShell, PageHeader)
- [x] 6 utility modules (time, distance, elevation/GAP, performance index, interpolation, formatting)

## Wave 2: Mock Data + Services [COMPLETE]
- [x] Race data (src/data/races.ts) - 6 races defined
- [x] Course data: Western States, UTMB, Hardrock 100, Leadville 100
- [x] Course data: index.ts barrel export with getCourseData()
- [x] Runner PRNG (src/data/runners/prng.ts)
- [x] Runner name pool (src/data/runners/name-pool.ts)
- [x] Runner generator (src/data/runners/generator.ts) - 200 runners, fatigue/DNF models
- [x] Auth mock service (src/services/mock/auth.mock.ts)
- [x] Race mock service (src/services/mock/race.mock.ts)
- [x] Runner mock service (src/services/mock/runner.mock.ts)
- [x] Results mock service (src/services/mock/results.mock.ts)
- [x] Registration mock service (src/services/mock/registration.mock.ts)
- [x] Crew mock service (src/services/mock/crew.mock.ts)
- [x] Streaming mock service (src/services/mock/streaming.mock.ts)
- [x] Tracking mock service (src/services/mock/tracking.mock.ts)
- [x] Wire up init.ts to use real mock classes

## Wave 3: Map + Chart Components [COMPLETE]
- [x] CourseMap.tsx (Leaflet with aid station + runner markers)
- [x] ElevationProfile.tsx (SVG-based)
- [x] AidStationMarker.tsx
- [x] RunnerMarker.tsx
- [x] PerformanceIndexChart.tsx (Recharts)
- [x] SplitComparisonChart.tsx
- [x] PaceChart.tsx
- [x] ElevationGainChart.tsx
- [x] RaceHistoryTimeline.tsx
- [x] Barrel exports for maps/ and charts/

## Wave 4: Stores + Hooks [COMPLETE]
- [x] auth.store.ts, race.store.ts, tracking.store.ts, registration.store.ts, streaming.store.ts, ui.store.ts
- [x] stores/index.ts barrel
- [x] useAuth, useRace, useRunner, useTracking, useResults, useCrew, useRegistration
- [x] useCountdown, useMediaQuery, useElevationProfile
- [x] hooks/index.ts barrel

## Wave 5: Feature Pages Batch 1 [COMPLETE]
- [x] LandingPage.tsx (hero, featured races, search, filters, live now banner)
- [x] RaceDetailPage.tsx (course map, elevation, info tabs, registration CTA)
- [x] LoginPage.tsx + RegisterPage.tsx (auth forms with demo credentials)
- [x] RunnerProfilePage.tsx (stats, race history timeline, PI chart)

## Wave 6: Feature Pages Batch 2 [COMPLETE]
- [x] LiveTrackingPage.tsx (map with runners, leaderboard, events feed, playback controls)
- [x] ResultsPage.tsx (searchable results table, splits, analysis)
- [x] RegistrationPage.tsx (6-step multi-step form with stepper)
- [x] CrewPortalPage.tsx (runner ETAs, aid station info, checklists)

## Wave 7: Tracking Engine + Streaming [NOT STARTED]
- [ ] LiveStreamPage.tsx (embedded video placeholder + chat)
- [ ] GPS replay engine improvements (animate runner movement)
- [ ] Live event generator enhancements

## Wave 8: Polish + Deploy [NOT STARTED]
- [ ] Loading states and error boundaries
- [ ] Mobile responsiveness pass
- [ ] Cross-page navigation polish
- [ ] Final build + deploy to GitHub Pages
- [ ] README with screenshots
