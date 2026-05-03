# Replit Agent Task Spec — MissionControlMobile

## Instructions for Replit Agent
Read this file carefully before touching any code.
Commit all changes with prefix "replit: " and push to main when done.

## Stack Rules
- TypeScript / React Native / Expo
- AI → claude-sonnet-4-6 (set in src/config.ts)
- No Vercel
- Commit and push every change

## Context
MissionControl Mobile is a React Native/Expo dashboard app showing 8 squads of
specialized AI agents. CHAT button was previously a stub (just showed an alert).
Claude integration has now been added:
- src/config.ts — model constants (claude-sonnet-4-6, API URL, storage key)
- screens/AgentChatScreen.tsx — full chat screen with Anthropic streaming
- App.tsx — AgentChat screen added to navigator
- screens/SquadDetailScreen.tsx — CHAT button now navigates to AgentChatScreen

## Tasks for Replit Agent

### Task 1 — Install dependencies
```bash
npm install
```
Verify `@react-native-async-storage/async-storage` installs correctly (already in package.json).

### Task 2 — Add API Key Settings Screen
Create `screens/SettingsScreen.tsx`:
- Input for Anthropic API key (stored via AsyncStorage key `mc_anthropic_api_key`)
- Show/hide toggle, Save button
- Test connection button that sends a test message and shows "✅ Connected" or error
- Wire to App.tsx as 'Settings' screen
- Add ⚙️ button in DashboardScreen header → navigate to Settings

### Task 3 — Add Streaming Support to AgentChatScreen
Currently AgentChatScreen uses non-streaming (waits for full response).
Add streaming using the same SSE pattern from hermes-agent-iris providers.ts:
- Add `anthropic-beta: prompt-caching-2024-07-31` header
- Parse `data:` SSE events and update message content token by token
- Show typing indicator while streaming

### Task 4 — AgentChatScreen Polish
- Persist conversation history per agent in AsyncStorage (key: `mc_chat_{agentName}`)
- Add a "Clear Chat" button in the header
- Add timestamp to each message bubble

### Task 5 — EAS Build Setup
Verify `eas.json` is configured for iOS and Android builds.
Add `expo-build-properties` if needed for the AsyncStorage native module.

## Model Reference
- Model: claude-sonnet-4-6 (defined in src/config.ts)
- This is the current Anthropic Sonnet model — do NOT change it

## Do NOT touch
- src/config.ts — model constants are set correctly
- screens/AgentChatScreen.tsx — core chat logic is correct
- data/roster.ts — agent data is complete
