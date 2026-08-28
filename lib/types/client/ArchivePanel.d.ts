/**
 * Archive-sessions settings section. Registered into the `settings.section`
 * slot; shows archived sessions grouped by workspace with batch delete,
 * restore (unarchive), and pagination.
 *
 * Archived session IDs come from the `pins` typert remote (`listArchived`);
 * session metadata comes from the framework's `useSessions` standard hook;
 * workspace metadata comes from `useWorkspaces`.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import type { SessionListState } from "@deepseek-ai/dsh-client-runtime/client";
import type { WorkspaceListState } from "@deepseek-ai/dsh-client-runtime/client";
import type { SnapshotSelectorHook, TranslateNS } from "@deepseek-ai/dsh-client-ui-slots";
import type { PinsRemote } from "./remote.js";
/** The translate seat of this plugin's `pin-sessions` locale namespace. */
export type PanelTranslate = TranslateNS<"pin-sessions">;
/** Owner + injected + framework standard props for the settings section entry. */
export interface ArchiveSectionProps {
    /** Owner prop: close the settings modal. */
    close: () => void;
    /** Injected `remote.pins` handle. */
    pins: PinsRemote;
    /** Framework standard kit (scope `root`): sessions list snapshot hook. */
    useSessions: SnapshotSelectorHook<SessionListState>;
    /** Framework standard kit (scope `root`): workspaces list snapshot hook. */
    useWorkspaces: SnapshotSelectorHook<WorkspaceListState>;
    /** Framework-injected translate seat (namespace `pin-sessions`). */
    t: PanelTranslate;
}
/** Archive-sessions settings section. */
export declare function ArchiveSection(props: ArchiveSectionProps): import("react").JSX.Element;
