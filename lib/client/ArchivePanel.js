import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { C } from "./styles.js";
/** Sessions per page. */
const PAGE_SIZE = 20;
/** Compact relative time. */
function timeLabel(epochMs, now) {
    const MIN = 60_000;
    const HOUR = 3_600_000;
    const DAY = 86_400_000;
    const diff = Math.max(0, now - epochMs);
    if (diff < MIN)
        return "now";
    if (diff < HOUR)
        return `${Math.floor(diff / MIN)}m`;
    if (diff < DAY)
        return `${Math.floor(diff / HOUR)}h`;
    if (diff < 30 * DAY)
        return `${Math.floor(diff / DAY)}d`;
    if (diff < 365 * DAY)
        return `${Math.floor(diff / (30 * DAY))}mo`;
    return `${Math.floor(diff / (365 * DAY))}y`;
}
/** Archive-sessions settings section. */
export function ArchiveSection(props) {
    const { pins, useSessions, useWorkspaces, t } = props;
    const sessions = useSessions((state) => state);
    const workspaces = useWorkspaces((state) => state);
    const [archivedIds, setArchivedIds] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [page, setPage] = useState(0);
    const [message, setMessage] = useState(null);
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
        const map = new Map();
        for (const ws of workspaces.items) {
            for (const sid of ws.sessionIds) {
                map.set(sid, ws.title);
            }
        }
        return map;
    }, [workspaces.items]);
    // Build archived rows with metadata.
    const allRows = useMemo(() => {
        const byId = sessions.byId;
        return archivedIds
            .map((id) => {
            const summary = byId[id];
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
        const groups = new Map();
        for (const row of allRows) {
            const key = row.workspaceLabel;
            const arr = groups.get(key);
            if (arr)
                arr.push(row);
            else
                groups.set(key, [row]);
        }
        return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    }, [allRows]);
    // Pagination.
    const totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages - 1);
    const pageRows = allRows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
    const pageIds = new Set(pageRows.map((r) => r.id));
    const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
    const toggleSelect = useCallback((id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id))
                next.delete(id);
            else
                next.add(id);
            return next;
        });
    }, []);
    const toggleSelectAllOnPage = useCallback(() => {
        if (allOnPageSelected) {
            setSelected((prev) => {
                const next = new Set(prev);
                for (const id of pageIds)
                    next.delete(id);
                return next;
            });
        }
        else {
            setSelected((prev) => {
                const next = new Set(prev);
                for (const id of pageIds)
                    next.add(id);
                return next;
            });
        }
    }, [allOnPageSelected, pageIds]);
    const handleDelete = useCallback(async () => {
        const ids = [...selected];
        if (ids.length === 0)
            return;
        const confirmed = window.confirm(t("archive.confirm"));
        if (!confirmed)
            return;
        setDeleting(true);
        setMessage(null);
        try {
            const result = await pins.deleteSessions(ids);
            if (result.ok) {
                const value = result.value;
                const parts = [];
                if (value.deleted.length > 0)
                    parts.push(t("archive.deleted", { count: value.deleted.length }));
                if (value.errors.length > 0)
                    parts.push(t("archive.errors", { count: value.errors.length }));
                setMessage(parts.join(" · ") || "Done");
                setSelected(new Set());
                await refreshArchived();
            }
            else {
                setMessage(result.error.message);
            }
        }
        catch (e) {
            setMessage(e instanceof Error ? e.message : String(e));
        }
        finally {
            setDeleting(false);
        }
    }, [selected, pins, t, refreshArchived]);
    const handleRestore = useCallback(async (id) => {
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
    return (_jsxs("div", { className: C.archive, children: [_jsx("div", { className: C.archiveHeader, children: _jsx("div", { className: C.archiveDesc, children: t("archive.description") }) }), _jsxs("div", { className: C.archiveToolbar, children: [_jsxs("button", { type: "button", className: C.archiveSelectAll, onClick: toggleSelectAllOnPage, disabled: pageRows.length === 0, children: [_jsx("input", { type: "checkbox", className: C.archiveCheckbox, checked: allOnPageSelected, readOnly: true }), t("archive.select_all")] }), _jsxs("button", { type: "button", className: `${C.archiveDeleteBtn} ${C.archiveDeleteBtnDanger}`, onClick: handleDelete, disabled: selected.size === 0 || deleting, children: [t("archive.delete_selected"), " (", selected.size, ")"] }), totalPages > 1 && (_jsxs("div", { className: C.archivePager, children: [_jsx("button", { type: "button", className: C.archivePageBtn, onClick: () => setPage((p) => Math.max(0, p - 1)), disabled: currentPage === 0, children: "\u2039" }), _jsxs("span", { className: C.archivePageInfo, children: [currentPage + 1, " / ", totalPages] }), _jsx("button", { type: "button", className: C.archivePageBtn, onClick: () => setPage((p) => Math.min(totalPages - 1, p + 1)), disabled: currentPage >= totalPages - 1, children: "\u203A" })] }))] }), message !== null && _jsx("div", { className: C.archiveMessage, children: message }), allRows.length === 0 ? (_jsx("div", { className: C.archiveMessage, children: t("archive.empty") })) : (_jsx("div", { className: C.archiveGroups, children: grouped.map(([wsLabel, rows]) => {
                    const pageRowsInGroup = rows.filter((r) => pageIds.has(r.id));
                    if (pageRowsInGroup.length === 0)
                        return null;
                    return (_jsxs("div", { className: C.archiveGroup, children: [_jsxs("div", { className: C.archiveGroupHeader, children: [_jsx("span", { className: C.archiveGroupIcon, children: "\uD83D\uDCC1" }), _jsx("span", { className: C.archiveGroupTitle, children: wsLabel }), _jsx("span", { className: C.archiveGroupCount, children: rows.length })] }), _jsx("div", { className: C.archiveTable, children: pageRowsInGroup.map((s) => {
                                    const isSelected = selected.has(s.id);
                                    return (_jsxs("div", { className: C.archiveRow, onClick: () => toggleSelect(s.id), style: { cursor: "pointer" }, children: [_jsx("input", { type: "checkbox", className: C.archiveCheckbox, checked: isSelected, onChange: () => toggleSelect(s.id), onClick: (e) => e.stopPropagation() }), _jsx("span", { className: C.archiveColTitle, children: s.title }), _jsx("span", { className: C.archiveColTime, children: s.updatedAt > 0 ? timeLabel(s.updatedAt, now) : "—" }), _jsx("button", { type: "button", className: C.archiveRestoreBtn, title: t("archive.restore"), onClick: (e) => {
                                                    e.stopPropagation();
                                                    void handleRestore(s.id);
                                                }, children: "\u21A9" })] }, s.id));
                                }) })] }, wsLabel));
                }) }))] }));
}
