/**
 * Client TYPERT_REMOTE face: installs the `pins` namespace on the client
 * through `ctx.remote.$mount(...)`, mirroring the host TYPERT manifest
 * one-to-one so both directions validate with the same strict codecs.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import type { TypertRemoteContribution } from "@deepseek-ai/dsh-typert-protocol";
/** Remote contribution consumed by `ctx.remote.$mount(...)`. */
export declare const TYPERT_REMOTE: TypertRemoteContribution;
