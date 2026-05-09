# Replit Agent Task: MissionControlMobile

## Goal
Upgrade MissionControlMobile (React Native / Expo) with the claude-sonnet-4-6 model reference update and a complete mobile-first responsive redesign that makes the agent monitoring dashboard feel like a real ops tool — not a prototype.

## Tasks
1. **Model update**: search all .ts/.tsx files in the project for any hardcoded Claude model strings ("claude-3", "claude-3-5", "claude-3-sonnet", "claude-3-opus", "claude-3-haiku") and replace with "claude-sonnet-4-6"; update any model display labels in the screens
2. **App shell redesign**: the current App.tsx likely has a basic navigator — upgrade to a bottom tab navigator with 4 tabs: Dashboard (home), Agents, Inbox, Settings; use React Navigation bottom tabs (already in package.json)
3. **Dashboard screen**: status overview with a header "Mission Control" + live clock; 3 summary cards (Active Agents: N, Pending Messages: N, System Status: ONLINE); a scrollable "Recent Activity" feed showing the last 5 agent actions as timeline items with timestamp, agent name, and action description; use mock data
4. **Agents screen**: list of all 7 NYC Tailblazers Claude profiles with status indicator (active/idle — green/gray dot), last active time, current task (one-line string), and a "View Details" row that expands to show full task description; use mock data for current tasks
5. **Inbox screen**: message list matching the MissionControl-Secure inbox — same JSON schema (from, subject, preview, timestamp, priority, read); render as FlatList with swipe-to-mark-read gesture (use react-native-gesture-handler if available, or a simple button fallback); priority color-coded left border on each item
6. **Settings screen**: dark/light mode toggle (use React Native Appearance API), model version display (shows "claude-sonnet-4-6"), notification preferences placeholder, and a "Clear Cache" button (clears AsyncStorage)
7. **Design language**: dark theme (#0d0f14 background, #1a1d26 card surface, #00ff41 neon green accent for active states, white text); match the MissionControl-Secure aesthetic but adapted for native mobile; use StyleSheet — no styled-components needed
8. **Typography**: use Expo's built-in system fonts (San Francisco on iOS, Roboto on Android) or add `expo-font` with a monospace font (Space Mono) for agent data/code display
9. **Safe area**: wrap all screens in SafeAreaView; ensure status bar content style matches dark theme
10. **Mock data file**: create `data/mockData.ts` with TypeScript types and realistic mock data for agents (7 profiles), recent activity (10 items), and inbox messages (5 items) — this allows the UI to be fully functional without a backend

## Tech Stack
- React Native + Expo (existing — expo ~54.0.33)
- TypeScript (existing)
- React Navigation (bottom tabs + native stack — already in package.json)
- AsyncStorage (already in package.json)
- StyleSheet (no external UI library needed)

## Deploy Target
Expo Go for development preview; EAS Build for production (eas.json already present). For web preview: `expo start --web` builds to index.html in root. Never Vercel.

## Done When
- [ ] All Claude model references updated to "claude-sonnet-4-6"
- [ ] Bottom tab navigator with 4 tabs (Dashboard, Agents, Inbox, Settings) renders
- [ ] Dashboard shows 3 summary cards and a recent activity feed with mock data
- [ ] Agents screen lists all 7 profiles with status indicators
- [ ] Inbox renders FlatList with priority borders and mark-as-read interaction
- [ ] Settings screen has working dark/light mode toggle
- [ ] `data/mockData.ts` exists with TypeScript types and realistic data
- [ ] App runs without errors in Expo Go (`expo start`)
- [ ] Dark theme consistent across all 4 screens
