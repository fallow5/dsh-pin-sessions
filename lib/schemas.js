/**
 * Zod schemas shared between the server and client bundles.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import { z } from "zod";
/** Schema for one pinned-session record. */
export const pinRecordSchema = z.object({
    id: z.string(),
    pinnedAt: z.number(),
});
/** Schema for the pin/unpin result. */
export const pinResultSchema = z.object({
    id: z.string(),
    pinned: z.boolean(),
});
/** Schema for the list result (array of pin records). */
export const pinListSchema = z.array(pinRecordSchema);
/** Schema for the toggle result. */
export const toggleResultSchema = z.object({
    id: z.string(),
    pinned: z.boolean(),
});
/** Schema for one session-deletion error row. */
export const deleteErrorSchema = z.object({
    id: z.string(),
    error: z.string(),
});
/** Schema for the batch delete-sessions result. */
export const deleteResultSchema = z.object({
    deleted: z.array(z.string()),
    errors: z.array(deleteErrorSchema),
});
