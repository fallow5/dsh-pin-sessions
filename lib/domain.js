/**
 * Storage-domain declaration for pinned sessions.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
import { pinRecordSchema } from "./schemas.js";
/** The `pin_sessions` domain declaration. */
export const pinDomain = defineDomain({
    name: "pin_sessions",
    version: 1,
    tables: {
        pins: domainTable(pinRecordSchema),
    },
});
