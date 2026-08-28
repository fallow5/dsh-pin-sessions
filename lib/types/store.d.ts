/**
 * Durable pin store over the `pin_sessions` domain.
 *
 * Reads are synchronous from the domain's in-memory state; every mutation
 * awaits backend durability first.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import type { Context } from "@deepseek-ai/cordis";
import { type Domain } from "@deepseek-ai/dsh-storage-domain";
import type { PinDomain } from "./domain.js";
import type { PinRecord } from "./types.js";
/** Store handle for the pin-sessions domain. */
export declare class PinsStore {
    private readonly ctx;
    private readonly pins;
    constructor(ctx: Context, domain: Domain<PinDomain>);
    /** List all pinned sessions IDs. */
    listIds(): string[];
    /** List all pinned sessions, newest-pin first. */
    list(): PinRecord[];
    /** Whether a session is pinned. */
    has(sessionId: string): boolean;
    /** Pin a session. Returns the record (idempotent — updates timestamp if already pinned). */
    pin(sessionId: string): Promise<PinRecord>;
    /** Unpin a session. Returns whether it was pinned. */
    unpin(sessionId: string): Promise<boolean>;
    /** Toggle pin state. Returns the new state. */
    toggle(sessionId: string): Promise<{
        id: string;
        pinned: boolean;
    }>;
}
