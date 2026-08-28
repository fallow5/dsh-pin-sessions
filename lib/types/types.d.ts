/**
 * Type declarations for the pin-sessions plugin.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
/** One pinned-session record stored in the domain. */
export interface PinRecord {
    /** The pinned session's id. */
    id: string;
    /** Epoch ms when the pin was created. */
    pinnedAt: number;
}
/** Result of a batch session-deletion operation. */
export interface DeleteResult {
    /** Session ids successfully deleted from disk. */
    deleted: string[];
    /** Per-id errors for sessions that could not be deleted. */
    errors: {
        id: string;
        error: string;
    }[];
}
