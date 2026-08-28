/**
 * Pin-sessions plugin entry: opens the `pin_sessions` storage domain,
 * mounts the pin store, and the `pins` typert service (`ctx.pins`).
 *
 * The host TYPERT face lives in `./typert` (auto-registered by
 * `dsh-typert-loader`); the browser half lives in `./client`.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import type { Context } from "@deepseek-ai/cordis";
/** Stable cordis plugin name. */
export declare const name = "pin-sessions";
/** Services required before the domain can open. */
export declare const inject: string[];
/** Mount the plugin. */
export declare function apply(ctx: Context): Promise<void>;
