/**
 * Zod schemas shared between the server and client bundles.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import { z } from "zod";
/** Schema for one pinned-session record. */
export declare const pinRecordSchema: z.ZodObject<{
    id: z.ZodString;
    pinnedAt: z.ZodNumber;
}, z.core.$strip>;
/** Schema for the pin/unpin result. */
export declare const pinResultSchema: z.ZodObject<{
    id: z.ZodString;
    pinned: z.ZodBoolean;
}, z.core.$strip>;
/** Schema for the list result (array of pin records). */
export declare const pinListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    pinnedAt: z.ZodNumber;
}, z.core.$strip>>;
/** Schema for the toggle result. */
export declare const toggleResultSchema: z.ZodObject<{
    id: z.ZodString;
    pinned: z.ZodBoolean;
}, z.core.$strip>;
/** Schema for one session-deletion error row. */
export declare const deleteErrorSchema: z.ZodObject<{
    id: z.ZodString;
    error: z.ZodString;
}, z.core.$strip>;
/** Schema for the batch delete-sessions result. */
export declare const deleteResultSchema: z.ZodObject<{
    deleted: z.ZodArray<z.ZodString>;
    errors: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        error: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
