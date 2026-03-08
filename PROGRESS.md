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

## Wave 2: Mock Data + Services [PARTIAL]
- [x] Race data (src/data/races.ts) - 6 races defined
- [x] Course data: Western States (src/data/courses/western-states.ts)
- [x] Course data: UTMB (src/data/courses/utmb.ts)
- [ ] Course data: Hardrock 100 (src/data/courses/hardrock.ts)
- [ ] Course data: Leadville 100 (src/data/courses/leadville.ts)
- [ ] Course data: index.ts barrel export with getCourseData()
- [x] Runner PRNG (src/data/runners/prng.ts)
- [x] Runner name pool (src/data/runners/name-pool.ts)
- [ ] Runner generator (src/data/runners/generator.ts) - the big one
- [x] Auth mock service (src/services/mock/auth.mock.ts)
- [x] Race mock service (src/services/mock/race.mock.ts)
- [ ] Runner mock service (src/services/mock/runner.mock.ts)
- [ ] Results mock service (src/services/mock/results.mock.ts)
- [ ] Registration mock service (src/services/mock/registration.mock.ts)
- [ ] Crew mock service (src/services/mock/crew.mock.ts)
- [ ] Streaming mock service (src/services/mock/streaming.mock.ts)
- [ ] Tracking mock service (src/services/mock/tracking.mock.ts)
- [ ] Wire up init.ts to use real mocks instead of stubs

## Wave 3: Map + Chart Components [COMPLETE]
- [x] ElevationProfile.tsx (SVG-based)
- [x] AidStationMarker.tsx
- [x] RunnerMarker.tsx
- [x] PerformanceIndexChart.tsx (Recharts)
- [x] SplitComparisonChart.tsx
- [x] PaceChart.tsx
- [x] ElevationGainChart.tsx
- [x] RaceHistoryTimeline.tsx
Note: CourseMap.tsx (Leaflet) and MapControls.tsx were NOT created

## Wave 4: Stores + Hooks [COMPLETE]
- [x] auth.store.ts
- [x] race.store.ts
- [x] tracking.store.ts
- [x] registration.store.ts
- [x] streaming.store.ts
- [ ] ui.store.ts (missing - has unit/theme preferences)
- [ ] stores/index.ts barrel
- [x] useAuth.ts
- [x] useRace.ts
- [x] useRunner.ts
- [x] useTracking.ts
- [x] useResults.ts
- [ ] useCrew.ts
- [ ] useRegistration.ts
- [ ] useCountdown.ts
- [ ] useMediaQuery.ts
- [ ] useElevationProfile.ts
- [ ] hooks/index.ts barrel

## Wave 5: Feature Pages Batch 1 [NOT STARTED]
- [ ] LandingPage.tsx (hero, featured races, search)
- [ ] RaceDetailPage.tsx (course map, elevation, info, registration CTA)
- [ ] LoginPage.tsx + RegisterPage.tsx
- [ ] RunnerProfilePage.tsx (stats, history, PI chart)

## Wave 6: Feature Pages Batch 2 [NOT STARTED]
- [ ] LiveTrackingPage.tsx (map with runners, leaderboard, events feed)
- [ ] ResultsPage.tsx (searchable results table, splits, analysis)
- [ ] RegistrationPage.tsx (multi-step form with stepper)
- [ ] CrewPortalPage.tsx (runner ETAs, aid station info, checklists)

## Wave 7: Tracking Engine + Streaming [NOT STARTED]
- [ ] GPS replay engine (simulates runner movement along course)
- [ ] Live event generator (aid station arrivals, DNFs, finishes)
- [ ] Tracking mock service with real simulation
- [ ] LiveStreamPage.tsx (embedded video placeholder + chat)
- [ ] Streaming mock service

## Wave 8: Polish + Deploy [NOT STARTED]
- [ ] Loading states and error boundaries
- [ ] Mobile responsiveness pass
- [ ] Cross-page navigation polish
- [ ] Final build + deploy to GitHub Pages
- [ ] README with screenshots
