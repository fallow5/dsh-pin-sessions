/**
 * Archive-sessions settings section. Registered into the `settings.section`
 * slot; shows archived sessions grouped by workspace with batch delete,
 * restore (unarchive), and pagination.
 *
 * Archived session IDs come from the `pins` typert remote (`listArchived`);
 * session metadata comes from the framework's `useSessions` standard hook;
 * workspace metadata comes from `useWorkspaces`.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */

import type { SessionId, SessionListState, SessionSummary } from "@deepseek-ai/dsh-client-runtime/client";
import type { WorkspaceListState } from "@deepseek-ai/dsh-client-runtime/client";
import type { SnapshotSelectorHook, TranslateNS } from "@deepseek-ai/dsh-client-ui-slots";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DeleteResult } from "../types.js";
import type { PinsRemote } from "./remote.js";
import { C } from "./styles.js";

/** The translate seat of this plugin's `pin-sessions` locale namespace. */
export type PanelTranslate = TranslateNS<"pin-sessions">;

/** Owner + injected + framework standard props for the settings section entry. */
export interface ArchiveSectionProps {
	/** Owner prop: close the settings modal. */
	close: () => void;
	/** Injected `remote.pins` handle. */
	pins: PinsRemote;
	/** Framework standard kit (scope `root`): sessions list snapshot hook. */
	useSessions: SnapshotSelectorHook<SessionListState>;
	/** Framework standard kit (scope `root`): workspaces list snapshot hook. */
	useWorkspaces: SnapshotSelectorHook<WorkspaceListState>;
	/** Framework-injected translate seat (namespace `pin-sessions`). */
	t: PanelTranslate;
}

/** Sessions per page. */
const PAGE_SIZE = 20;

/** Compact relative time. */
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

/** One archived session row with its workspace label. */
interface ArchivedRow {
	id: string;
	title: string;
	updatedAt: number;
	workspaceLabel: string;
}

/** Archive-sessions settings section. */
export function ArchiveSection(props: ArchiveSectionProps) {
	const { pins, useSessions, useWorkspaces, t } = props;
	const sessions = useSessions((state) => state);
	const workspaces = useWorkspaces((state) => state);
	const [archivedIds, setArchivedIds] = useState<string[]>([]);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [page, setPage] = useState(0);
	const [message, setMessage] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	const now = Date.now();

	// Fetch archived session IDs.
	const refreshArchived = useCallback(async () => {
		const result = await pins.listArchived();
		if (result.ok) {
			setArchivedIds(result.value);
		}
	}, [pins]);

	useEffect(() => {
		void refreshArchived();
	}, [refreshArchived]);

	// Build workspace label lookup: sessionId → workspace title.
	const workspaceBySession = useMemo(() => {
		const map = new Map<string, string>();
		for (const ws of workspaces.items) {
			for (const sid of ws.sessionIds) {
				map.set(sid, ws.title);
			}
		}
		return map;
	}, [workspaces.items]);

	// Build archived rows with metadata.
	const allRows = useMemo<ArchivedRow[]>(() => {
		const byId = sessions.byId;
		return archivedIds
			.map((id) => {
				const summary = byId[id as SessionId];
				if (!summary) {
					// Session exists in archive but not in the session list (may be cold).
					return {
						id,
						title: id.slice(0, 8),
						updatedAt: 0,
						workspaceLabel: workspaceBySession.get(id) ?? "—",
					};
				}
				return {
					id,
					title: summary.blank ? t("newSession") : summary.displayTitle,
					updatedAt: summary.updatedAt,
					workspaceLabel: workspaceBySession.get(id) ?? (summary.cwd ? summary.cwd.split("/").pop() ?? "—" : "—"),
				};
			})
			.sort((a, b) => b.updatedAt - a.updatedAt);
	}, [archivedIds, sessions.byId, workspaceBySession, t]);

	// Group by workspace label.
	const grouped = useMemo(() => {
		const groups = new Map<string, ArchivedRow[]>();
		for (const row of allRows) {
			const key = row.workspaceLabel;
			const arr = groups.get(key);
			if (arr) arr.push(row);
			else groups.set(key, [row]);
		}
		return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
	}, [allRows]);

	// Pagination.
	const totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages - 1);
	const pageRows = allRows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
	const pageIds = new Set(pageRows.map((r) => r.id));
	const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

	const toggleSelect = useCallback((id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const toggleSelectAllOnPage = useCallback(() => {
		if (allOnPageSelected) {
			setSelected((prev) => {
				const next = new Set(prev);
				for (const id of pageIds) next.delete(id);
				return next;
			});
		} else {
			setSelected((prev) => {
				const next = new Set(prev);
				for (const id of pageIds) next.add(id);
				return next;
			});
		}
	}, [allOnPageSelected, pageIds]);

	const handleDelete = useCallback(async () => {
		const ids = [...selected];
		if (ids.length === 0) return;
		const confirmed = window.confirm(t("archive.confirm"));
		if (!confirmed) return;

		setDeleting(true);
		setMessage(null);
		try {
			const result = await pins.deleteSessions(ids);
			if (result.ok) {
				const value: DeleteResult = result.value;
				const parts: string[] = [];
				if (value.deleted.length > 0) parts.push(t("archive.deleted", { count: value.deleted.length }));
				if (value.errors.length > 0) parts.push(t("archive.errors", { count: value.errors.length }));
				setMessage(parts.join(" · ") || "Done");
				setSelected(new Set());
				await refreshArchived();
			} else {
				setMessage(result.error.message);
			}
		} catch (e) {
			setMessage(e instanceof Error ? e.message : String(e));
		} finally {
			setDeleting(false);
		}
	}, [selected, pins, t, refreshArchived]);

	const handleRestore = useCallback(async (id: string) => {
		const result = await pins.unarchiveSession(id);
		if (result.ok && result.value) {
			setSelected((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
			await refreshArchived();
		}
	}, [pins, refreshArchived]);

	return (
		<div className={C.archive}>
			<div className={C.archiveHeader}>
				<div className={C.archiveDesc}>{t("archive.description")}</div>
			</div>
			<div className={C.archiveToolbar}>
				<button
					type="button"
					className={C.archiveSelectAll}
					onClick={toggleSelectAllOnPage}
					disabled={pageRows.length === 0}
				>
					<input type="checkbox" className={C.archiveCheckbox} checked={allOnPageSelected} readOnly />
					{t("archive.select_all")}
				</button>
				<button
					type="button"
					className={`${C.archiveDeleteBtn} ${C.archiveDeleteBtnDanger}`}
					onClick={handleDelete}
					disabled={selected.size === 0 || deleting}
				>
					{t("archive.delete_selected")} ({selected.size})
				</button>
				{totalPages > 1 && (
					<div className={C.archivePager}>
						<button
							type="button"
							className={C.archivePageBtn}
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							disabled={currentPage === 0}
						>
							‹
						</button>
						<span className={C.archivePageInfo}>
							{currentPage + 1} / {totalPages}
						</span>
						<button
							type="button"
							className={C.archivePageBtn}
							onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
							disabled={currentPage >= totalPages - 1}
						>
							›
						</button>
					</div>
				)}
			</div>
			{message !== null && <div className={C.archiveMessage}>{message}</div>}
			{allRows.length === 0 ? (
				<div className={C.archiveMessage}>{t("archive.empty")}</div>
			) : (
				<div className={C.archiveGroups}>
					{grouped.map(([wsLabel, rows]) => {
						const pageRowsInGroup = rows.filter((r) => pageIds.has(r.id));
						if (pageRowsInGroup.length === 0) return null;
						return (
							<div key={wsLabel} className={C.archiveGroup}>
								<div className={C.archiveGroupHeader}>
									<span className={C.archiveGroupIcon}>📁</span>
									<span className={C.archiveGroupTitle}>{wsLabel}</span>
									<span className={C.archiveGroupCount}>{rows.length}</span>
								</div>
								<div className={C.archiveTable}>
									{pageRowsInGroup.map((s) => {
										const isSelected = selected.has(s.id);
										return (
							<div
								key={s.id}
								className={C.archiveRow}
								onClick={() => toggleSelect(s.id)}
								style={{ cursor: "pointer" }}
							>
								<input
									type="checkbox"
									className={C.archiveCheckbox}
									checked={isSelected}
									onChange={() => toggleSelect(s.id)}
									onClick={(e) => e.stopPropagation()}
								/>
								<span className={C.archiveColTitle}>{s.title}</span>
								<span className={C.archiveColTime}>
									{s.updatedAt > 0 ? timeLabel(s.updatedAt, now) : "—"}
								</span>
								<button
									type="button"
									className={C.archiveRestoreBtn}
									title={t("archive.restore")}
									onClick={(e) => {
										e.stopPropagation();
										void handleRestore(s.id);
									}}
								>
									↩
								</button>
							</div>
						);
					})}
				</div>
					</div>
					);
				})}
			</div>
			)}
		</div>
	);
}
