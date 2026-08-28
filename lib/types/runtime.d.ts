/**
 * The `pins` typert host service. Registered as `ctx.pins` by the plugin
 * body; the gateway dispatches `pins/*` endpoints here.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import type { Context } from "@deepseek-ai/cordis";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import type { PinsStore } from "./store.js";
import type { DeleteResult, PinRecord } from "./types.js";
/** Host service backing the `pins` typert namespace. */
export declare class PinsRuntime extends TypertRemoteService {
    private readonly store;
    constructor(ctx: Context, store: PinsStore);
    /** List all pinned sessions, newest-pin first. */
    list(): PinRecord[];
    /** Pin a session. */
    pin(sessionId: string): Promise<PinRecord>;
    /** Unpin a session. */
    unpin(sessionId: string): Promise<boolean>;
    /** Toggle pin state. Returns the new state. */
    toggle(sessionId: string): Promise<{
        id: string;
        pinned: boolean;
    }>;
    /** Whether a session is pinned. */
    isPinned(sessionId: string): boolean;
    /** List all archived session IDs from the workspace registry. */
    listArchived(): string[];
    /** Unarchive a session (restore it to the workspace list). Also unpins if pinned. */
    unarchiveSession(sessionId: string): Promise<boolean>;
    /**
     * Delete sessions from disk by session id. Performs full cleanup:
     * stops agents, detaches live sessions, deletes session directories,
     * removes projection cache, removes workspace accounting, and unpins.
     * Returns one outcome row per requested id.
     */
    deleteSessions(sessionIds: string[]): Promise<DeleteResult>;
}
