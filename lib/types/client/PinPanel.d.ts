/**
 * Pinned-sessions section UI. A hidden sentinel div is registered into the
 * sidebar footer action seat purely to get a DOM anchor; from there we
 * portal the pinned-sessions section to the top of the sidebar's session-list
 * area so pinned sessions appear above the workspace groups.
 *
 * The section matches the native sidebar session-row styling exactly:
 * same height, font sizes, colors, hover states, time labels, and
 * three-dot quick menu.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import type { SessionListState } from "@deepseek-ai/dsh-client-runtime/client";
import type { SnapshotSelectorHook, TranslateNS } from "@deepseek-ai/dsh-client-ui-slots";
import type { PinsRemote } from "./remote.js";
/** The translate seat of this plugin's `pin-sessions` locale namespace. */
export type PanelTranslate = TranslateNS<"pin-sessions">;
/** Owner + injected + framework standard props for the footer action entry. */
export interface PinnedSectionProps {
    /** Sidebar column state: wide row vs collapsed rail icon. */
    wide: boolean;
    /** Injected `remote.pins` handle. */
    pins: PinsRemote;
    /** Injected `open(sessionId)` callback (from ctx.sessions.open). */
    open: (sessionId: string) => void;
    /** Framework standard kit (scope `root`): sessions list snapshot hook. */
    useSessions: SnapshotSelectorHook<SessionListState>;
    /** Framework-injected translate seat (namespace `pin-sessions`). */
    t: PanelTranslate;
}
/**
 * Hidden sentinel component: renders nothing visible in the footer, but
 * provides a DOM ref for portaling the pinned section to the top of the
 * sidebar.
 */
export declare function PinnedSection(props: PinnedSectionProps): import("react").JSX.Element;
