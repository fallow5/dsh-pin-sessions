/**
 * Pin-sessions plugin entry: opens the `pin_sessions` storage domain,
 * mounts the pin store, and the `pins` typert service (`ctx.pins`).
 *
 * The host TYPERT face lives in `./typert` (auto-registered by
 * `dsh-typert-loader`); the browser half lives in `./client`.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import { pinDomain } from "./domain.js";
import { PinsRuntime } from "./runtime.js";
import { PinsStore } from "./store.js";
/** Stable cordis plugin name. */
export const name = "pin-sessions";
/** Services required before the domain can open. */
export const inject = ["storageDomain"];
/** Mount the plugin. */
export async function apply(ctx) {
    const domain = await ctx.storageDomain.open(pinDomain);
    const store = new PinsStore(ctx, domain);
    // The TypertRemoteService constructor registers `ctx.pins` itself and
    // unregisters it when this plugin's fiber unloads.
    void new PinsRuntime(ctx, store);
    ctx.effect(() => async () => {
        await domain.close();
    }, "pin-sessions.teardown()");
}
