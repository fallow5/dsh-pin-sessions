/**
 * Client-side remote surface for the `pins` typert namespace.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */

import type { DeleteResult, PinRecord } from "../types.js";

/** One settled wire result. */
export type RpcResult<T> = { ok: true; value: T } | { ok: false; error: { code: string; message: string } };

/** Typed projection of the installed `remote.pins` namespace. */
export interface PinsRemote {
	list(): Promise<RpcResult<PinRecord[]>>;
	pin(sessionId: string): Promise<RpcResult<PinRecord>>;
	unpin(sessionId: string): Promise<RpcResult<boolean>>;
	toggle(sessionId: string): Promise<RpcResult<{ id: string; pinned: boolean }>>;
	isPinned(sessionId: string): Promise<RpcResult<boolean>>;
	deleteSessions(sessionIds: string[]): Promise<RpcResult<DeleteResult>>;
	listArchived(): Promise<RpcResult<string[]>>;
	unarchiveSession(sessionId: string): Promise<RpcResult<boolean>>;
}
