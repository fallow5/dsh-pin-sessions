/**
 * Durable pin store over the `pin_sessions` domain.
 *
 * Reads are synchronous from the domain's in-memory state; every mutation
 * awaits backend durability first.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
/** Store handle for the pin-sessions domain. */
export class PinsStore {
    ctx;
    pins;
    constructor(ctx, domain) {
        this.ctx = ctx;
        this.pins = domain.table("pins");
    }
    /** List all pinned sessions IDs. */
    listIds() {
        return [...this.pins.keys()];
    }
    /** List all pinned sessions, newest-pin first. */
    list() {
        const all = [...this.pins.entries()].map(([, record]) => record);
        all.sort((a, b) => b.pinnedAt - a.pinnedAt);
        return all;
    }
    /** Whether a session is pinned. */
    has(sessionId) {
        return this.pins.get(sessionId) !== undefined;
    }
    /** Pin a session. Returns the record (idempotent — updates timestamp if already pinned). */
    async pin(sessionId) {
        const record = {
            id: sessionId,
            pinnedAt: Date.now(),
        };
        await this.pins.put(sessionId, record);
        return record;
    }
    /** Unpin a session. Returns whether it was pinned. */
    async unpin(sessionId) {
        return this.pins.delete(sessionId);
    }
    /** Toggle pin state. Returns the new state. */
    async toggle(sessionId) {
        if (this.pins.get(sessionId) !== undefined) {
            await this.pins.delete(sessionId);
            return { id: sessionId, pinned: false };
        }
        const record = {
            id: sessionId,
            pinnedAt: Date.now(),
        };
        await this.pins.put(sessionId, record);
        return { id: sessionId, pinned: true };
    }
}
