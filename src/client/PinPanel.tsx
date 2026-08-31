/**
 * Pinned-sessions section UI. A hidden sentinel div is registered into the
 * sidebar footer action seat purely to get a DOM anchor; from there we
 * portal the pinned-sessions section to the top of the sidebar's session-list
 * area so pinned sessions appear above the workspace groups.
 *
 * The section matches the native sidebar session-row styling exactly:
 * same height, font sizes, colors, hover states, time labels, and
 * three-dot quick menu.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */

import type { SessionId, SessionListState } from "@deepseek-ai/dsh-client-runtime/client";
import { IconEllipsisOutline16, Menu, StateDot } from "@deepseek-ai/dsh-client-ui-primitives";
import type { MenuEntry } from "@deepseek-ai/dsh-client-ui-primitives";
import type { SnapshotSelectorHook, TranslateNS } from "@deepseek-ai/dsh-client-ui-slots";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PinRecord } from "../types.js";
import type { PinsRemote } from "./remote.js";
import { C } from "./styles.js";

/** The translate seat of this plugin's `pin-sessions` locale namespace. */
export type PanelTranslate = TranslateNS<"pin-sessions">;

/** Owner + injected + framework standard props for the footer action entry. */
export interface PinnedSectionProps {
	/** Sidebar column state: wide row vs collapsed rail icon. */
	wide: boolean;
	/** Injected `remote.pins` handle. */
	pins: PinsRemote;
	/** Injected `open(sessionId)` callback (from ctx.sessions.open). */
	open: (sessionId: string) => void;
	/** Framework standard kit (scope `root`): sessions list snapshot hook. */
	useSessions: SnapshotSelectorHook<SessionListState>;
	/** Framework-injected translate seat (namespace `pin-sessions`). */
	t: PanelTranslate;
}

/** Relative time matching the native sidebar's timeLabel buckets. */
function timeLabel(epochMs: number, now: number): string {
	const MIN = 60_000;
	const HOUR = 3_600_000;
	const DAY = 86_400_000;
	const diff = Math.max(0, now - epochMs);
	if (diff < MIN) return "now";
	if (diff < HOUR) return `${Math.floor(diff / MIN)}m`;
	if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
	if (diff < 30 * DAY) return `${Math.floor(diff / DAY)}d`;
	if (diff < 365 * DAY) return `${Math.floor(diff / (30 * DAY))}mo`;
	return `${Math.floor(diff / (365 * DAY))}y`;
}

/** Resolve the portal target: the first child of the sidebar's region area. */
function usePortalTarget(footerRef: React.RefObject<HTMLDivElement | null>): {
	target: HTMLElement | null;
} {
	const [target, setTarget] = useState<HTMLElement | null>(null);

	useEffect(() => {
		if (!footerRef.current) return;
		let cancelled = false;

		const findAndMount = () => {
			if (cancelled) return;
			let el: HTMLElement | null = footerRef.current;
			while (el) {
				const region = el.querySelector('[class*="regionArea"]') as HTMLElement | null;
				if (region) {
					let portal = region.querySelector(
						"[data-pin-sessions-portal]",
					) as HTMLElement | null;
					if (!portal) {
						portal = document.createElement("div");
						portal.setAttribute("data-pin-sessions-portal", "");
						portal.style.cssText = "flex:none;order:-1";
						region.insertBefore(portal, region.firstChild);
					}
					if (!cancelled) setTarget(portal);
					return;
				}
				el = el.parentElement;
			}
		};

		findAndMount();
		const timer = window.setTimeout(findAndMount, 100);
		const observer = new MutationObserver(() => findAndMount());
		observer.observe(document.body, { childList: true, subtree: true });

		return () => {
			cancelled = true;
			window.clearTimeout(timer);
			observer.disconnect();
		};
	}, [footerRef]);

	return { target };
}

/** Pinned-sessions section rendered into the portal target. */
function PinnedSectionContent({
	pinnedRecords,
	sessions,
	current,
	onOpen,
	onUnpin,
	t,
}: {
	pinnedRecords: PinRecord[];
	sessions: SessionListState;
	current: string | undefined;
	onOpen: (id: string) => void;
	onUnpin: (id: string) => void;
	t: PanelTranslate;
}) {
	const now = Date.now();
	const [tick, setTick] = useState(0);
	const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

	useEffect(() => {
		const timer = window.setInterval(() => setTick((v) => v + 1), 30_000);
		return () => window.clearInterval(timer);
	}, []);

	const pinned = useMemo(() => {
		const byId = sessions.byId;
		return pinnedRecords
			.map((rec) => {
				const summary = byId[rec.id as SessionId];
				if (!summary) return null;
				return {
					id: rec.id,
					title: summary.blank ? t("newSession") : summary.displayTitle,
					updatedAt: summary.updatedAt,
					isCurrent: rec.id === current,
					blank: summary.blank,
					running: summary.running,
					pendingInteraction: summary.pendingInteraction,
					completed: summary.completed,
				};
			})
			.filter((s): s is NonNullable<typeof s> => s !== null);
	}, [pinnedRecords, sessions.byId, current, t]);

	void tick;

	const [collapsed, setCollapsed] = useState(false);

	if (pinned.length === 0) return null;

	return (
		<div className={C.section} role="group" aria-label={t("section.aria")}>
			<div
				className={C.sectionHeader}
				onClick={() => setCollapsed((c) => !c)}
				role="treeitem"
				aria-expanded={!collapsed}
			>
				<span className={C.sectionIcon}>
					<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 1.5C7.4 1.5 6.5 2.4 6.5 3.5V5L4 7.5C3.6 7.9 3.6 8.5 4 8.9L5.1 10L3.2 11.9C2.9 12.2 2.9 12.7 3.2 13C3.5 13.3 4 13.3 4.3 13L6.2 11.1L7.3 12.2C7.7 12.6 8.3 12.6 8.7 12.2L11.2 9.7C11.6 9.3 11.6 8.7 11.2 8.3L9.5 6.6V3.5C9.5 2.4 9.1 1.5 8.5 1.5Z" fill="currentColor"/>
						<path d="M8 12.5V15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
					</svg>
				</span>
				<span className={C.sectionTitle}>{t("title")}</span>
				<span className={C.sectionCount}>{pinned.length}</span>
			</div>
			{!collapsed && (
			<div className={C.sectionBody}>
				{pinned.map((s) => {
					// Compute status dot state, matching the native sessionStatuses logic.
					const showStatus = !s.blank || s.isCurrent;
					let dotState: "ongoing" | "warning" | "done" | undefined;
					if (showStatus) {
						if (s.pendingInteraction) {
							dotState = "warning";
						} else if (s.running) {
							dotState = "ongoing";
						} else if (s.completed) {
							dotState = "done";
						}
					}
					return (
					<div
						key={s.id}
						className={`${C.row} ${s.isCurrent ? C.rowSelected : ""} ${menuOpenId === s.id ? C.rowMenuOpen : ""}`}
						role="treeitem"
						aria-selected={s.isCurrent}
						onClick={() => onOpen(s.id)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onOpen(s.id);
							}
						}}
					>
						<span className={C.rowSlot}>
							{dotState !== undefined && <StateDot state={dotState} />}
						</span>
						<span className={C.rowTitle}>{s.title}</span>
						{!s.blank && (
							<span className={C.rowTime}>
								{timeLabel(s.updatedAt, now)}
							</span>
						)}
						<span className={C.rowActions}>
							<Menu
								open={menuOpenId === s.id}
								anchor={
									<button
										type="button"
										className={C.iconBtn}
										aria-label={t("actions.session.aria", { name: s.title })}
										onClick={(e) => {
											e.stopPropagation();
											setMenuOpenId((prev) => (prev === s.id ? null : s.id));
										}}
									>
										<IconEllipsisOutline16 />
									</button>
								}
								items={[
									{ id: "unpin", label: t("unpin") },
								] as readonly MenuEntry[]}
								onSelect={(itemId) => {
									setMenuOpenId(null);
									if (itemId === "unpin") onUnpin(s.id);
								}}
								onClose={() => setMenuOpenId(null)}
								portal
								closeOnPointerLeave
							/>
						</span>
					</div>
				);
			})}
		</div>
			)}
		</div>
	);
}

/**
 * Hidden sentinel component: renders nothing visible in the footer, but
 * provides a DOM ref for portaling the pinned section to the top of the
 * sidebar.
 */
export function PinnedSection(props: PinnedSectionProps) {
	const { pins, open, useSessions, t } = props;
	const footerRef = useRef<HTMLDivElement>(null);
	const sessions = useSessions((state) => state);
	const current = sessions.current;
	const [pinnedRecords, setPinnedRecords] = useState<PinRecord[]>([]);
	const { target } = usePortalTarget(footerRef);

	const refresh = useCallback(async () => {
		const result = await pins.list();
		if (result.ok) {
			setPinnedRecords(result.value);
		}
	}, [pins]);

	useEffect(() => {
		void refresh();
		const timer = window.setInterval(() => void refresh(), 10_000);
		const onChanged = () => void refresh();
		globalThis.addEventListener("pin-sessions:changed", onChanged);
		return () => {
			window.clearInterval(timer);
			globalThis.removeEventListener("pin-sessions:changed", onChanged);
		};
	}, [refresh]);

	const unpin = useCallback(
		async (id: string) => {
			const result = await pins.unpin(id);
			if (result.ok) {
				void refresh();
				globalThis.dispatchEvent(new CustomEvent("pin-sessions:changed"));
			}
		},
		[pins, refresh],
	);

	// NOTE: Pinned sessions are shown in the dedicated section above. We do NOT
	// hide them from the workspace browser's session list. DSH exposes no
	// data-source filter hook for the sidebar list (SessionListState.ids is
	// host-owned; ui-workspace renders rows internally), and a DOM-based hide
	// (MutationObserver + class toggling) self-excites into an infinite loop
	// because toggling the class re-triggers the observer — that froze the app.
	// The duplication is cosmetic; the freeze was fatal, so we leave the list alone.

	return (
		<>
			<div ref={footerRef} style={{ display: "none" }} />
			{target
				? createPortal(
						<PinnedSectionContent
							pinnedRecords={pinnedRecords}
							sessions={sessions}
							current={current}
							onOpen={open}
							onUnpin={unpin}
							t={t}
						/>,
						target,
					)
				: null}
		</>
	);
}
