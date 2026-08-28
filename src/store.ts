/**
 * Durable pin store over the `pin_sessions` domain.
 *
 * Reads are synchronous from the domain's in-memory state; every mutation
 * awaits backend durability first.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */

import type { Context } from "@deepseek-ai/cordis";
import { type Domain, type KvTable } from "@deepseek-ai/dsh-storage-domain";
import type { PinDomain } from "./domain.js";
import type { PinRecord } from "./types.js";

/** Store handle for the pin-sessions domain. */
export class PinsStore {
	private readonly pins: KvTable<string, PinRecord>;

	constructor(
		private readonly ctx: Context,
		domain: Domain<PinDomain>,
	) {
		this.pins = domain.table("pins");
	}

	/** List all pinned sessions IDs. */
	listIds(): string[] {
		return [...this.pins.keys()];
	}

	/** List all pinned sessions, newest-pin first. */
	list(): PinRecord[] {
		const all = [...this.pins.entries()].map(([, record]) => record);
		all.sort((a, b) => b.pinnedAt - a.pinnedAt);
		return all;
	}

	/** Whether a session is pinned. */
	has(sessionId: string): boolean {
		return this.pins.get(sessionId) !== undefined;
	}

	/** Pin a session. Returns the record (idempotent — updates timestamp if already pinned). */
	async pin(sessionId: string): Promise<PinRecord> {
		const record: PinRecord = {
			id: sessionId,
			pinnedAt: Date.now(),
		};
		await this.pins.put(sessionId, record);
		return record;
	}

	/** Unpin a session. Returns whether it was pinned. */
	async unpin(sessionId: string): Promise<boolean> {
		return this.pins.delete(sessionId);
	}

	/** Toggle pin state. Returns the new state. */
	async toggle(sessionId: string): Promise<{ id: string; pinned: boolean }> {
		if (this.pins.get(sessionId) !== undefined) {
			await this.pins.delete(sessionId);
			return { id: sessionId, pinned: false };
		}
		const record: PinRecord = {
			id: sessionId,
			pinnedAt: Date.now(),
		};
		await this.pins.put(sessionId, record);
		return { id: sessionId, pinned: true };
	}
}
