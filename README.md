# DSH Pin-Sessions Plugin

A [DeepSeek Harness](https://github.com/deepseek-ai/dsh) (DSH) web plugin that lets users **pin sessions** to a dedicated sidebar section for quick access to recurring workflows, and provides an **archive-sessions** settings panel with batch delete, restore, workspace grouping, and pagination.

## Features

- **Pin / Unpin sessions** — Pin sessions to the top of the sidebar, hidden from their workspace browser
- **Archive panel** — Settings panel for managing archived sessions with batch delete, per-row restore, workspace grouping, and 20-per-page pagination
- **Context menu integration** — Right-click pin/unpin via `@baihejiangnan/dsh-session-context-menu`
- **Pin = Archive** — Pinning archives the session from the workspace browser; unpinning restores it

## Architecture

Standard DSH plugin split: **host half** (Cordis loader entry + TYPERT manifest) + **client half** (`window.__ModuleLoader__.load` wrapper).

### Host Side

| File | Responsibility |
|------|---------------|
| `src/index.ts` | Opens `pin_sessions` storage domain, creates `PinsStore` + `PinsRuntime` |
| `src/runtime.ts` | `PinsRuntime extends TypertRemoteService` — 8 TYPERT methods |
| `src/typert.ts` | Host TYPERT manifest (must match client) |
| `src/store.ts` | Durable pin store over the `pin_sessions` domain |
| `src/domain.ts` | `pin_sessions` domain declaration |
| `src/schemas.ts` | Zod schemas for pin records |

#### TYPERT Methods

`list`, `pin`, `unpin`, `toggle`, `isPinned`, `deleteSessions`, `listArchived`, `unarchiveSession`

#### Key Design: Pin = Archive

Pinning calls `workspaceRegistry.archiveSession(sessionId)` to hide the session from the workspace browser. Unpinning calls `unarchiveSession()` which removes the ID from `archivedSessionIds`. This triggers `domain/changed` → `host/archived-sessions-changed` frame → client auto-updates.

### Client Side

| File | Responsibility |
|------|---------------|
| `src/client/index.ts` | Registers locale, mounts TYPERT_REMOTE, context-menu extensions, portals PinnedSection + ArchiveSection |
| `src/client/PinPanel.tsx` | Pinned section portaled to top of sidebar |
| `src/client/ArchivePanel.tsx` | Settings panel with workspace grouping, pagination, batch delete, restore |
| `src/client/styles.ts` | CSS mirroring native DSH classes |
| `src/client/locales.ts` | i18n strings |
| `src/client/remote.ts` | TYPERT remote interface |
| `src/client/typert-remote.ts` | Client TYPERT manifest (must match host) |

## Build & Install

```bash
# Build
cd dsh-pin-sessions
pnpm install
pnpm run build        # tsc + tsdown + wrap-client.mjs

# Typecheck
pnpm run typecheck

# Install into DSH
dsh plugin --profile web add /path/to/dsh-pin-sessions
```

- Host-side changes require DSH server restart
- Client-side changes require browser refresh

## Key Service Access Patterns

| Service | Usage |
|---------|-------|
| `ctx.get("workspaceRegistry")` | `archiveSession()`, `archivedSessionIds`, `list()`, `enqueueOperation()`, `setState()` |
| `ctx.get("sessionPersistence")` | `list()` returns headers with `{id, cwd?, origin?}` |
| `ctx.get("sessions")` | `get(id)` returns live session or undefined |
| `ctx.get("agents")` | `get(id)` returns agent with `cancel()` and `whenIdle()` |
| `ctx.get("storageDomain")` | `get("session_projcache")` for projection cache |
| `GlobalStandardProps` | Auto-injects `useSessions` and `useWorkspaces` hooks |

## Context Menu Integration

`@baihejiangnan/dsh-session-context-menu` exposes a global registry at `Symbol.for("dsh.session-context-menu.extensions")` with `.register(entry)`. The plugin may load after us, so we poll every 500ms until the registry appears.

Entries: `{id, label, order?, visible?, run}`. The context menu's `isAction()` checks for "会话"+"操作" or "session"+"action" in `aria-label`; `titleFrom()` extracts the quoted title.

## License

MIT
