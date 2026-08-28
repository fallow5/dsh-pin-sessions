/**
 * Client plugin body: mounts the `pins` remote namespace, registers the
 * `pin-sessions` locale dictionaries, then:
 *  1. Registers "Pin session" / "Unpin session" items into the session
 *     context menu (via the @baihejiangnan/dsh-session-context-menu global
 *     registry), matching the native context-menu style.
 *  2. Portals a pinned-sessions section to the top of the sidebar.
 *  3. Registers an "Archived Sessions" section in the settings panel.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
// Load the locale service declarations (module augmentation for Context.locale).
import type {} from "@deepseek-ai/dsh-client-locale/client";
import type { SessionId } from "@deepseek-ai/dsh-client-runtime/client";
import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
// Load the sidebar slot declarations (module augmentation for the SlotMap).
import type {} from "@deepseek-ai/dsh-client-ui-sidebar/client";
import { ArchiveSection, type ArchiveSectionProps } from "./ArchivePanel.js";
import { en, type PinSessionsKey, zh } from "./locales.js";
import { PinnedSection, type PinnedSectionProps } from "./PinPanel.js";
import { injectStyles } from "./styles.js";
import { TYPERT_REMOTE } from "./typert-remote.js";

/** Dictionary namespace owned by this plugin (panel copy). */
const NS = "pin-sessions";

declare module "@deepseek-ai/dsh-client-ui-slots" {
	interface LocaleNamespaceMap {
		/** Pin-sessions panel copy. */
		"pin-sessions": PinSessionsKey;
	}
	interface SlotMap {
		/** Settings panel section (declared by dsh-client-ui-settings at runtime). */
		"settings.section": {
			kind: "list";
			scope: "root";
			owner: { close: () => void };
		};
	}
}

/** Symbol key for the session-context-menu extensions registry. */
const CTX_MENU_KEY = Symbol.for("dsh.session-context-menu.extensions");

/** One context-menu extension entry shape. */
interface CtxMenuExtension {
	id: string;
	label: string;
	order?: number;
	visible?: (ctx: { session: { id: string } | null; row: Element | null }) => boolean;
	run: (ctx: {
		session: { id: string; displayTitle: string; blank: boolean } | null;
		row: Element | null;
		close: () => void;
	}) => void;
}

/** Services required before this plugin mounts. */
export const inject = ["slots", "remote", "locale", "sessions"];

/** Mount the browser half. */
export async function apply(ctx: ClientContext) {
	injectStyles();
	ctx.effect(() => ctx.locale.register(NS, { zh, en }), "pin-sessions: dictionaries");
	await ctx.remote.$mount(TYPERT_REMOTE);
	const t = ctx.locale.bind(NS);

	const pins = ctx.get("remote.pins") as PinnedSectionProps["pins"];

	// Cache pinned session IDs for context-menu visibility checks.
	let pinnedIds = new Set<string>();
	const refreshPinnedIds = async () => {
		const result = await pins.list();
		if (result.ok) {
			pinnedIds = new Set(result.value.map((r) => r.id));
		}
	};
	void refreshPinnedIds();
	// Keep the cache fresh: poll + listen for our own change events.
	ctx.effect(() => {
		const timer = window.setInterval(() => void refreshPinnedIds(), 10_000);
		const onChanged = () => void refreshPinnedIds();
		globalThis.addEventListener("pin-sessions:changed", onChanged);
		return () => {
			window.clearInterval(timer);
			globalThis.removeEventListener("pin-sessions:changed", onChanged);
		};
	}, "pin-sessions: pinned-id cache");

	// 1. Register "Pin session" and "Unpin session" into the session context menu.
	//    The @baihejiangnan/dsh-session-context-menu plugin may load after us,
	//    so poll for the registry until it appears.
	ctx.effect(() => {
		let disposed = false;
		let disposers: (() => void)[] = [];

		const doRegister = () => {
			if (disposed) return;
			const registry = (globalThis as Record<symbol, {
				register: (entry: CtxMenuExtension) => () => void;
			}>)[CTX_MENU_KEY];
			if (registry === undefined) return false;

			disposers.push(registry.register({
				id: "pin-sessions.pin",
				label: t("ctx.pin"),
				order: -1,
				visible: ({ session }) => session !== null && !pinnedIds.has(session.id),
				run: async ({ session }) => {
					if (session === null) return;
					const result = await pins.pin(session.id);
					if (result.ok) {
						await refreshPinnedIds();
						globalThis.dispatchEvent(new CustomEvent("pin-sessions:changed"));
					}
				},
			}));

			disposers.push(registry.register({
				id: "pin-sessions.unpin",
				label: t("ctx.unpin"),
				order: -1,
				visible: ({ session }) => session !== null && pinnedIds.has(session.id),
				run: async ({ session }) => {
					if (session === null) return;
					const result = await pins.unpin(session.id);
					if (result.ok) {
						await refreshPinnedIds();
						globalThis.dispatchEvent(new CustomEvent("pin-sessions:changed"));
					}
				},
			}));

			return true;
		};

		if (doRegister()) return () => {
			disposed = true;
			for (const d of disposers) d();
		};

		// Poll until the registry appears (context-menu plugin loads late).
		const timer = window.setInterval(() => {
			if (doRegister()) {
				window.clearInterval(timer);
			}
		}, 500);

		return () => {
			disposed = true;
			window.clearInterval(timer);
			for (const d of disposers) d();
		};
	}, "pin-sessions: context-menu extensions");

	// 2. Portal the pinned-sessions section to the top of the sidebar.
	// A hidden sentinel component registered into sidebar.footer.action
	// provides a DOM anchor for the portal; the trigger itself is invisible.
	ctx.slots.inject("sidebar.footer.action", () =>
		ctx.slots.register(
			{
				name: "sidebar.footer.action",
				id: "pin-sessions-portal",
				locale: NS,
				inject: (): Pick<PinnedSectionProps, "pins" | "open"> => ({
					pins: pins,
					open: (sessionId: string) => {
						ctx.sessions.open(sessionId as SessionId);
					},
				}),
			},
			PinnedSection,
		),
	);

	// 3. "Archived Sessions" section in the settings panel.
	ctx.slots.inject("settings.section", () =>
		ctx.slots.register(
			{
				name: "settings.section",
				id: "pin-sessions-archive",
				order: 100,
				label: () => t("archive.title"),
				locale: NS,
				inject: (): Pick<ArchiveSectionProps, "pins"> => ({
					pins: ctx.get("remote.pins") as ArchiveSectionProps["pins"],
				}),
			},
			ArchiveSection,
		),
	);
}
