/**
 * Client plugin body: mounts the `pins` remote namespace, registers the
 * `pin-sessions` locale dictionaries, then:
 *  1. Injects "Pin"/"Unpin" items into the native session three-dot menu
 *     (after "Rename") via MutationObserver + React-fiber session-id lookup.
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

/** Services required before this plugin mounts. */
export const inject = ["slots", "remote", "locale", "sessions"];

/** Mount the browser half. */
export async function apply(ctx: ClientContext) {
	injectStyles();
	ctx.effect(() => ctx.locale.register(NS, { zh, en }), "pin-sessions: dictionaries");
	await ctx.remote.$mount(TYPERT_REMOTE);
	const t = ctx.locale.bind(NS);

	const pins = ctx.get("remote.pins") as PinnedSectionProps["pins"];

	// Cache pinned session IDs for menu item label checks.
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

	// Pin/unpin SVG icons — iOS 26 SF Symbol "pushpin" style:
	// rounded pushpin head + needle, fill=currentColor to match native icons.
	const PIN_SVG =
		'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 1.5C7.4 1.5 6.5 2.4 6.5 3.5V5L4 7.5C3.6 7.9 3.6 8.5 4 8.9L5.1 10L3.2 11.9C2.9 12.2 2.9 12.7 3.2 13C3.5 13.3 4 13.3 4.3 13L6.2 11.1L7.3 12.2C7.7 12.6 8.3 12.6 8.7 12.2L11.2 9.7C11.6 9.3 11.6 8.7 11.2 8.3L9.5 6.6V3.5C9.5 2.4 9.1 1.5 8.5 1.5Z" fill="currentColor"/><path d="M8 12.5V15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
	const UNPIN_SVG =
		'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 1.5C7.4 1.5 6.5 2.4 6.5 3.5V5L4 7.5C3.6 7.9 3.6 8.5 4 8.9L5.1 10L3.2 11.9C2.9 12.2 2.9 12.7 3.2 13C3.5 13.3 4 13.3 4.3 13L6.2 11.1L7.3 12.2C7.7 12.6 8.3 12.6 8.7 12.2L11.2 9.7C11.6 9.3 11.6 8.7 11.2 8.3L9.5 6.6V3.5C9.5 2.4 9.1 1.5 8.5 1.5Z" fill="currentColor"/><path d="M8 12.5V15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M2.5 2.5L13.5 13.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

	// 1. Inject "Pin"/"Unpin" items into the native session three-dot menu.
	//    DSH's session menu is hardcoded in dsh-client-ui-workspace with no
	//    extension slot, so we use a capture-phase click listener to grab the
	//    session ID from the three-dot button's session row, then a
	//    MutationObserver to inject our item after "Rename" when the portaled
	//    menu appears in document.body.
	ctx.effect(() => {
		let disposed = false;

		/** Read the session id from a session-row element via its React fiber. */
		const getSessionId = (row: HTMLElement): string | null => {
			const key = Object.keys(row).find(
				(k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"),
			);
			if (!key) return null;
			let fiber = (row as unknown as Record<string, unknown>)[key] as {
				memoizedProps?: { node?: { id?: string } };
				return?: unknown;
			} | null;
			while (fiber) {
				const props = fiber.memoizedProps;
				if (props?.node?.id && typeof props.node.id === "string") return props.node.id;
				fiber = fiber.return as typeof fiber;
			}
			return null;
		};

		// The session ID of the three-dot button that was last clicked.
		// The native menu uses portal:true, so the menu DOM is in document.body,
		// not inside the session row. We capture the ID here before the menu opens.
		let activeSessionId: string | null = null;

		// Capture-phase listener: fires before React's onClick opens the menu.
		const onPointerDown = (e: PointerEvent): void => {
			if (disposed) return;
			const target = e.target as HTMLElement | null;
			if (!target) return;
			// Find the three-dot button — it's a <button> with an aria-label
			// like `会话"xxx"的操作` (zh) or `Session actions for xxx` (en).
			const btn = target.closest("button");
			if (!btn) return;
			const aria = btn.getAttribute("aria-label") ?? "";
			// Match both zh (会话…的操作) and en (Session actions for …).
			if (!aria.includes("会话") && !aria.toLowerCase().includes("session action")) return;
			// Walk up to the session row and read the session ID from the fiber.
			const row = btn.closest<HTMLElement>("[class*='sessionRow']");
			if (!row) return;
			activeSessionId = getSessionId(row);
		};

		const observer = new MutationObserver((): void => {
			if (disposed) return;
			for (const menu of document.querySelectorAll('div[role="menu"]')) {
				// Skip if already injected.
				if (menu.querySelector("[data-pin-sessions-menu-item]")) continue;

				// Identify a session menu by looking for "rename" + "fork"/"archive".
				// zh: 重命名 / 分叉会话 / 归档会话
				// en: Rename / Fork session / Archive session
				const buttons =
					menu.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');
				let renameWrap: HTMLElement | null = null;
				let isSessionMenu = false;
				for (const btn of buttons) {
					const text = (btn.textContent ?? "").trim();
					if (text === "重命名" || text === "Rename") {
						renameWrap = btn.parentElement;
					}
					if (
						text === "分叉会话" ||
						text === "Fork session" ||
						text === "归档会话" ||
						text === "Archive session"
					) {
						isSessionMenu = true;
					}
				}
				if (!renameWrap || !isSessionMenu) continue;

				// Use the session ID captured from the three-dot button click.
				const sessionId = activeSessionId;
				if (!sessionId) continue;

				const isPinned = pinnedIds.has(sessionId);
				const label = isPinned ? t("ctx.unpin") : t("ctx.pin");

				// Clone the rename item for native styling, then modify it.
				const clone = renameWrap.cloneNode(true) as HTMLElement;
				clone.setAttribute("data-pin-sessions-menu-item", "");

				const cloneBtn = clone.querySelector("button");
				if (!cloneBtn) continue;

				// Replace label text.
				const labelSpan = cloneBtn.querySelector("span:last-child");
				if (labelSpan) labelSpan.textContent = label;

				// Replace icon.
				const iconSpan = cloneBtn.querySelector("span:first-child");
				if (iconSpan) iconSpan.innerHTML = isPinned ? UNPIN_SVG : PIN_SVG;

				// Wire up the click handler.
				cloneBtn.addEventListener("click", (e: Event) => {
					e.stopPropagation();
					const action = isPinned ? pins.unpin(sessionId) : pins.pin(sessionId);
					void action.then(() => {
						void refreshPinnedIds();
						globalThis.dispatchEvent(new CustomEvent("pin-sessions:changed"));
					});
					// Close the menu.
					document.dispatchEvent(
						new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
					);
				});

				// Insert after the rename item.
				renameWrap.insertAdjacentElement("afterend", clone);
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });
		document.addEventListener("pointerdown", onPointerDown, true);

		return () => {
			disposed = true;
			observer.disconnect();
			document.removeEventListener("pointerdown", onPointerDown, true);
		};
	}, "pin-sessions: session menu injection");

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
