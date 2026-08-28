/**
 * The `pins` typert host service. Registered as `ctx.pins` by the plugin
 * body; the gateway dispatches `pins/*` endpoints here.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */

import { rm } from "node:fs/promises";
import { dirname } from "node:path";
import type { Context } from "@deepseek-ai/cordis";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import type { PinsStore } from "./store.js";
import type { DeleteResult, PinRecord } from "./types.js";

/** One session header from the persistence store. */
interface SessionHeader {
	id: string;
	cwd?: string;
	origin?: string;
}

/** Minimal workspace-registry face for archive/unarchive. */
interface WorkspaceRegistryLike {
	archiveSession(sessionId: string): Promise<void>;
	archivedSessionIds: string[];
	list?: () => Iterable<{ sessionIds: readonly string[]; detachSession?: (id: string) => Promise<void> }>;
}

/** Minimal session-store face for live-session checks and detach. */
interface SessionsLike {
	get?: (id: string) => unknown;
	store?: { get?: (id: string) => unknown; delete?: (id: string) => void };
	detachEntered?: (entry: unknown) => void;
	flush?: (session: unknown) => Promise<void>;
}

/** Minimal agent face for stopping a running agent before deletion. */
interface AgentLike {
	cancel?: (cause: { kind: string }, options?: { keepInbox?: boolean }) => void;
	whenIdle?: () => Promise<void>;
}

/** Minimal agents-service face. */
interface AgentsLike {
	get?: (id: string) => AgentLike | undefined;
}

/** Minimal storage-domain face for projection-cache cleanup. */
interface StorageDomainLike {
	get?: (name: string) => {
		table?: (name: string) => { get?: (id: string) => unknown; delete?: (id: string) => Promise<void> } | undefined;
		global?: { get?: () => unknown; set?: (state: unknown) => Promise<void> };
	} | undefined;
}

/** Host service backing the `pins` typert namespace. */
export class PinsRuntime extends TypertRemoteService {
	constructor(
		ctx: Context,
		private readonly store: PinsStore,
	) {
		super(ctx, "pins");
	}

	/** List all pinned sessions, newest-pin first. */
	@Remote
	list(): PinRecord[] {
		return this.store.list();
	}

	/** Pin a session. */
	@Remote
	async pin(sessionId: string): Promise<PinRecord> {
		return this.store.pin(sessionId);
	}

	/** Unpin a session. */
	@Remote
	async unpin(sessionId: string): Promise<boolean> {
		return this.store.unpin(sessionId);
	}

	/** Toggle pin state. Returns the new state. */
	@Remote
	async toggle(sessionId: string): Promise<{ id: string; pinned: boolean }> {
		if (this.store.has(sessionId)) {
			await this.unpin(sessionId);
			return { id: sessionId, pinned: false };
		}
		await this.pin(sessionId);
		return { id: sessionId, pinned: true };
	}

	/** Whether a session is pinned. */
	@Remote
	isPinned(sessionId: string): boolean {
		return this.store.has(sessionId);
	}

	/** List all archived session IDs from the workspace registry. */
	@Remote
	listArchived(): string[] {
		const registry = this.ctx.get("workspaceRegistry") as WorkspaceRegistryLike | undefined;
		return registry?.archivedSessionIds ?? [];
	}

	/** Unarchive a session (restore it to the workspace list). Also unpins if pinned. */
	@Remote
	async unarchiveSession(sessionId: string): Promise<boolean> {
		const registry = this.ctx.get("workspaceRegistry") as
			| (WorkspaceRegistryLike & {
					enqueueOperation?: (fn: () => Promise<void>) => Promise<void>;
					requireState?: () => { archivedSessionIds: string[] };
					setState?: (state: { archivedSessionIds: string[]; [k: string]: unknown }) => Promise<void>;
			  })
			| undefined;
		if (registry === undefined) return false;

		const archived = registry.archivedSessionIds;
		if (!archived.includes(sessionId)) return false;

		// Also unpin if the session was pinned (pinning archives as a side effect).
		await this.store.unpin(sessionId);

		try {
			// Use the registry's internal operation queue to safely mutate state.
			if (typeof registry.enqueueOperation === "function" && typeof registry.requireState === "function" && typeof registry.setState === "function") {
				await registry.enqueueOperation(async () => {
					const state = registry.requireState!();
					const next = state.archivedSessionIds.filter((id: string) => id !== sessionId);
					await registry.setState!({ ...state, archivedSessionIds: next });
				});
				return true;
			}
		} catch {
			// Best-effort — the session stays archived if the mutation fails.
		}
		return false;
	}

	/**
	 * Delete sessions from disk by session id. Performs full cleanup:
	 * stops agents, detaches live sessions, deletes session directories,
	 * removes projection cache, removes workspace accounting, and unpins.
	 * Returns one outcome row per requested id.
	 */
	@Remote
	async deleteSessions(sessionIds: string[]): Promise<DeleteResult> {
		const persistence = this.ctx.get("sessionPersistence") as
			| {
					list(): Promise<SessionHeader[]>;
					locate?: (meta: SessionHeader) => { path: string; kind?: string } | undefined;
			  }
			| undefined;
		if (persistence === undefined) {
			return { deleted: [], errors: sessionIds.map((id) => ({ id, error: "session persistence is not configured" })) };
		}

		// Build id → header map from the durable store.
		const headers = await persistence.list();
		const headerById = new Map(headers.map((h: SessionHeader) => [h.id, h]));

		const sessions = this.ctx.get("sessions") as SessionsLike | undefined;
		const agents = this.ctx.get("agents") as AgentsLike | undefined;
		const registry = this.ctx.get("workspaceRegistry") as
			| (WorkspaceRegistryLike & {
					enqueueOperation?: (fn: () => Promise<void>) => Promise<void>;
					requireState?: () => { archivedSessionIds: string[]; [k: string]: unknown };
					setState?: (state: { archivedSessionIds: string[]; [k: string]: unknown }) => Promise<void>;
			  })
			| undefined;
		// storageDomain is a named service on ctx; access via ctx.get().
		const storageDomain = this.ctx.get("storageDomain") as StorageDomainLike | undefined;

		const deleted: string[] = [];
		const errors: { id: string; error: string }[] = [];

		for (const id of sessionIds) {
			const header = headerById.get(id);
			if (header === undefined) {
				errors.push({ id, error: "session not found in durable store" });
				continue;
			}

			// Skip subagent sessions — they can't be deleted directly.
			if (header.origin === "subagent") {
				errors.push({ id, error: "subagent sessions cannot be deleted directly" });
				continue;
			}

			// Resolve the on-disk log path via the backend's locate method.
			const locate = persistence.locate;
			if (typeof locate !== "function") {
				errors.push({ id, error: "persistence backend does not support locate" });
				continue;
			}

			const location = locate(header);
			if (location === undefined || location.path === undefined) {
				errors.push({ id, error: "could not resolve session path" });
				continue;
			}

			try {
				// 1. Stop the running agent if any (cancel + wait for idle).
				const agent = agents?.get?.(id);
				if (agent !== undefined) {
					if (typeof agent.cancel === "function") {
						try { agent.cancel({ kind: "user" }, { keepInbox: true }); } catch { /* best-effort */ }
					}
					if (typeof agent.whenIdle === "function") {
						try {
							await new Promise<void>((resolve) => {
								const timer = setTimeout(resolve, 15_000);
								Promise.resolve(agent.whenIdle!()).then(
									() => { clearTimeout(timer); resolve(); },
									() => { clearTimeout(timer); resolve(); },
								);
							});
						} catch { /* best-effort */ }
					}
				}

				// 2. Detach the live session from the session store.
				if (sessions?.get?.(id) !== undefined) {
					if (typeof sessions.flush === "function") {
						try { await sessions.flush(sessions.get!(id)); } catch { /* best-effort */ }
					}
					const entry = sessions.store?.get?.(id);
					if (entry !== undefined) {
						if (typeof sessions.detachEntered === "function") sessions.detachEntered(entry);
						else sessions.store?.delete?.(id);
					}
				}

				// 3. Delete the session directory (parent of the log file).
				const sessionDir = dirname(location.path);
				await rm(sessionDir, { recursive: true, force: true });

				// 4. Remove projection cache (best-effort).
				try {
					const projDomain = storageDomain?.get?.("session_projcache");
					const projTable = projDomain?.table?.("sessions");
					if (projTable?.get?.(id) !== undefined) {
						await projTable.delete?.(id);
					}
				} catch { /* best-effort */ }

				// 5. Remove from workspace accounting (best-effort).
				try {
					if (registry?.list) {
						for (const ws of registry.list()) {
							if (ws.sessionIds.includes(id) && typeof ws.detachSession === "function") {
								await ws.detachSession(id);
							}
						}
					}
				} catch { /* best-effort */ }

				// 6. Remove from archivedSessionIds (best-effort).
				try {
					if (registry?.archivedSessionIds.includes(id)) {
						if (typeof registry.enqueueOperation === "function" && typeof registry.requireState === "function" && typeof registry.setState === "function") {
							await registry.enqueueOperation(async () => {
								const state = registry.requireState!();
								const next = state.archivedSessionIds.filter((sid: string) => sid !== id);
								await registry.setState!({ ...state, archivedSessionIds: next });
							});
						}
					}
				} catch { /* best-effort */ }

				// 7. Unpin if it was pinned.
				await this.store.unpin(id);

				deleted.push(id);
			} catch (e) {
				errors.push({ id, error: e instanceof Error ? e.message : String(e) });
			}
		}

		return { deleted, errors };
	}
}
