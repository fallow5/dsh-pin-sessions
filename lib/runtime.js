/**
 * The `pins` typert host service. Registered as `ctx.pins` by the plugin
 * body; the gateway dispatches `pins/*` endpoints here.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { rm } from "node:fs/promises";
import { dirname } from "node:path";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
/** Host service backing the `pins` typert namespace. */
let PinsRuntime = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _list_decorators;
    let _pin_decorators;
    let _unpin_decorators;
    let _toggle_decorators;
    let _isPinned_decorators;
    let _listArchived_decorators;
    let _unarchiveSession_decorators;
    let _deleteSessions_decorators;
    return class PinsRuntime extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _list_decorators = [Remote];
            _pin_decorators = [Remote];
            _unpin_decorators = [Remote];
            _toggle_decorators = [Remote];
            _isPinned_decorators = [Remote];
            _listArchived_decorators = [Remote];
            _unarchiveSession_decorators = [Remote];
            _deleteSessions_decorators = [Remote];
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _pin_decorators, { kind: "method", name: "pin", static: false, private: false, access: { has: obj => "pin" in obj, get: obj => obj.pin }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _unpin_decorators, { kind: "method", name: "unpin", static: false, private: false, access: { has: obj => "unpin" in obj, get: obj => obj.unpin }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _toggle_decorators, { kind: "method", name: "toggle", static: false, private: false, access: { has: obj => "toggle" in obj, get: obj => obj.toggle }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _isPinned_decorators, { kind: "method", name: "isPinned", static: false, private: false, access: { has: obj => "isPinned" in obj, get: obj => obj.isPinned }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _listArchived_decorators, { kind: "method", name: "listArchived", static: false, private: false, access: { has: obj => "listArchived" in obj, get: obj => obj.listArchived }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _unarchiveSession_decorators, { kind: "method", name: "unarchiveSession", static: false, private: false, access: { has: obj => "unarchiveSession" in obj, get: obj => obj.unarchiveSession }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _deleteSessions_decorators, { kind: "method", name: "deleteSessions", static: false, private: false, access: { has: obj => "deleteSessions" in obj, get: obj => obj.deleteSessions }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        store = __runInitializers(this, _instanceExtraInitializers);
        constructor(ctx, store) {
            super(ctx, "pins");
            this.store = store;
        }
        /** List all pinned sessions, newest-pin first. */
        list() {
            return this.store.list();
        }
        /** Pin a session. */
        async pin(sessionId) {
            return this.store.pin(sessionId);
        }
        /** Unpin a session. */
        async unpin(sessionId) {
            return this.store.unpin(sessionId);
        }
        /** Toggle pin state. Returns the new state. */
        async toggle(sessionId) {
            if (this.store.has(sessionId)) {
                await this.unpin(sessionId);
                return { id: sessionId, pinned: false };
            }
            await this.pin(sessionId);
            return { id: sessionId, pinned: true };
        }
        /** Whether a session is pinned. */
        isPinned(sessionId) {
            return this.store.has(sessionId);
        }
        /** List all archived session IDs from the workspace registry. */
        listArchived() {
            const registry = this.ctx.get("workspaceRegistry");
            return registry?.archivedSessionIds ?? [];
        }
        /** Unarchive a session (restore it to the workspace list). Also unpins if pinned. */
        async unarchiveSession(sessionId) {
            const registry = this.ctx.get("workspaceRegistry");
            if (registry === undefined)
                return false;
            const archived = registry.archivedSessionIds;
            if (!archived.includes(sessionId))
                return false;
            // Also unpin if the session was pinned (pinning archives as a side effect).
            await this.store.unpin(sessionId);
            try {
                // Use the registry's internal operation queue to safely mutate state.
                if (typeof registry.enqueueOperation === "function" && typeof registry.requireState === "function" && typeof registry.setState === "function") {
                    await registry.enqueueOperation(async () => {
                        const state = registry.requireState();
                        const next = state.archivedSessionIds.filter((id) => id !== sessionId);
                        await registry.setState({ ...state, archivedSessionIds: next });
                    });
                    return true;
                }
            }
            catch {
                // Best-effort — the session stays archived if the mutation fails.
            }
            return false;
        }
        /**
         * Delete sessions from disk by session id. Performs full cleanup:
         * stops agents, detaches live sessions, deletes session directories,
         * removes projection cache, removes workspace accounting, and unpins.
         * Returns one outcome row per requested id.
         */
        async deleteSessions(sessionIds) {
            const persistence = this.ctx.get("sessionPersistence");
            if (persistence === undefined) {
                return { deleted: [], errors: sessionIds.map((id) => ({ id, error: "session persistence is not configured" })) };
            }
            // Build id → header map from the durable store.
            const headers = await persistence.list();
            const headerById = new Map(headers.map((h) => [h.id, h]));
            const sessions = this.ctx.get("sessions");
            const agents = this.ctx.get("agents");
            const registry = this.ctx.get("workspaceRegistry");
            // storageDomain is a named service on ctx; access via ctx.get().
            const storageDomain = this.ctx.get("storageDomain");
            const deleted = [];
            const errors = [];
            for (const id of sessionIds) {
                const header = headerById.get(id);
                if (header === undefined) {
                    errors.push({ id, error: "session not found in durable store" });
                    continue;
                }
                // Skip subagent sessions — they can't be deleted directly.
                if (header.origin === "subagent") {
                    errors.push({ id, error: "subagent sessions cannot be deleted directly" });
                    continue;
                }
                // Resolve the on-disk log path via the backend's locate method.
                // Call persistence.locate(header) directly — extracting the method
                // into a variable would lose `this` context and throw TypeError.
                let location;
                try {
                    if (typeof persistence.locate !== "function") {
                        errors.push({ id, error: "persistence backend does not support locate" });
                        continue;
                    }
                    location = persistence.locate(header);
                }
                catch (e) {
                    errors.push({ id, error: e instanceof Error ? e.message : String(e) });
                    continue;
                }
                if (location === undefined || location.path === undefined) {
                    errors.push({ id, error: "could not resolve session path" });
                    continue;
                }
                try {
                    // 1. Stop the running agent if any (cancel + wait for idle).
                    // Use agents?.get(id) not agents?.get?.(id) — the latter loses
                    // `this` context via optional-call syntax and throws TypeError.
                    const agent = agents?.get(id);
                    if (agent !== undefined) {
                        if (typeof agent.cancel === "function") {
                            try {
                                agent.cancel({ kind: "user" }, { keepInbox: true });
                            }
                            catch { /* best-effort */ }
                        }
                        if (typeof agent.whenIdle === "function") {
                            try {
                                await new Promise((resolve) => {
                                    const timer = setTimeout(resolve, 15_000);
                                    Promise.resolve(agent.whenIdle()).then(() => { clearTimeout(timer); resolve(); }, () => { clearTimeout(timer); resolve(); });
                                });
                            }
                            catch { /* best-effort */ }
                        }
                    }
                    // 2. Detach the live session from the session store.
                    const liveSession = sessions?.get(id);
                    if (liveSession !== undefined && sessions !== undefined) {
                        if (typeof sessions.flush === "function") {
                            try {
                                await sessions.flush(liveSession);
                            }
                            catch { /* best-effort */ }
                        }
                        const entry = sessions.store.get(id);
                        if (entry !== undefined) {
                            if (typeof sessions.detachEntered === "function")
                                sessions.detachEntered(entry);
                            else
                                sessions.store.delete(id);
                        }
                    }
                    // 3. Delete the session directory (parent of the log file).
                    const sessionDir = dirname(location.path);
                    await rm(sessionDir, { recursive: true, force: true });
                    // 4. Remove projection cache (best-effort).
                    try {
                        const projDomain = storageDomain?.get("session_projcache");
                        const projTable = projDomain?.table("sessions");
                        if (projTable?.get(id) !== undefined) {
                            await projTable.delete(id);
                        }
                    }
                    catch { /* best-effort */ }
                    // 5. Remove from workspace accounting (best-effort).
                    try {
                        if (registry?.list) {
                            for (const ws of registry.list()) {
                                if (ws.sessionIds.includes(id) && typeof ws.detachSession === "function") {
                                    await ws.detachSession(id);
                                }
                            }
                        }
                    }
                    catch { /* best-effort */ }
                    // 6. Remove from archivedSessionIds (best-effort).
                    try {
                        if (registry?.archivedSessionIds.includes(id)) {
                            if (typeof registry.enqueueOperation === "function" && typeof registry.requireState === "function" && typeof registry.setState === "function") {
                                await registry.enqueueOperation(async () => {
                                    const state = registry.requireState();
                                    const next = state.archivedSessionIds.filter((sid) => sid !== id);
                                    await registry.setState({ ...state, archivedSessionIds: next });
                                });
                            }
                        }
                    }
                    catch { /* best-effort */ }
                    // 7. Unpin if it was pinned.
                    await this.store.unpin(id);
                    deleted.push(id);
                }
                catch (e) {
                    errors.push({ id, error: e instanceof Error ? e.message : String(e) });
                }
            }
            return { deleted, errors };
        }
    };
})();
export { PinsRuntime };
