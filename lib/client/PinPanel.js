import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconEllipsisOutline16, Menu, StateDot } from "@deepseek-ai/dsh-client-ui-primitives";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { C } from "./styles.js";
/** Relative time matching the native sidebar's timeLabel buckets. */
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
/** Resolve the portal target: the first child of the sidebar's region area. */
function usePortalTarget(footerRef) {
    const [target, setTarget] = useState(null);
    useEffect(() => {
        if (!footerRef.current)
            return;
        let cancelled = false;
        const findAndMount = () => {
            if (cancelled)
                return;
            let el = footerRef.current;
            while (el) {
                const region = el.querySelector('[class*="regionArea"]');
                if (region) {
                    let portal = region.querySelector("[data-pin-sessions-portal]");
                    if (!portal) {
                        portal = document.createElement("div");
                        portal.setAttribute("data-pin-sessions-portal", "");
                        portal.style.cssText = "flex:none;order:-1";
                        region.insertBefore(portal, region.firstChild);
                    }
                    if (!cancelled)
                        setTarget(portal);
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
function PinnedSectionContent({ pinnedRecords, sessions, current, onOpen, onUnpin, t, }) {
    const now = Date.now();
    const [tick, setTick] = useState(0);
    const [menuOpenId, setMenuOpenId] = useState(null);
    useEffect(() => {
        const timer = window.setInterval(() => setTick((v) => v + 1), 30_000);
        return () => window.clearInterval(timer);
    }, []);
    const pinned = useMemo(() => {
        const byId = sessions.byId;
        return pinnedRecords
            .map((rec) => {
            const summary = byId[rec.id];
            if (!summary)
                return null;
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
            .filter((s) => s !== null);
    }, [pinnedRecords, sessions.byId, current, t]);
    void tick;
    const [collapsed, setCollapsed] = useState(false);
    if (pinned.length === 0)
        return null;
    return (_jsxs("div", { className: C.section, role: "group", "aria-label": t("section.aria"), children: [_jsxs("div", { className: C.sectionHeader, onClick: () => setCollapsed((c) => !c), role: "treeitem", "aria-expanded": !collapsed, children: [_jsx("span", { className: C.sectionIcon, children: _jsx("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M9.828 0.172a.586.586 0 0 0-.828 0L8 1.172l.828.828L6.5 4.328 4.172 2a.586.586 0 0 0-.828 0L2 3.344a.586.586 0 0 0 0 .828L4.328 6.5 2.5 8.328a.586.586 0 0 0 0 .828l.672.672a.586.586 0 0 0 .828 0L5.828 8 9 11.172l-1 1a.586.586 0 0 0 0 .828l.672.672a.586.586 0 0 0 .828 0l4.5-4.5a.586.586 0 0 0 0-.828l-.672-.672a.586.586 0 0 0-.828 0l-1 1L9 5.828 11.328 3.5 12 4.172a.586.586 0 0 0 .828 0L14 2a.586.586 0 0 0 0-.828L9.828.172z" }) }) }), _jsx("span", { className: C.sectionTitle, children: t("title") }), _jsx("span", { className: C.sectionCount, children: pinned.length })] }), !collapsed && (_jsx("div", { className: C.sectionBody, children: pinned.map((s) => {
                    // Compute status dot state, matching the native sessionStatuses logic.
                    const showStatus = !s.blank || s.isCurrent;
                    let dotState;
                    if (showStatus) {
                        if (s.pendingInteraction) {
                            dotState = "warning";
                        }
                        else if (s.running) {
                            dotState = "ongoing";
                        }
                        else if (s.completed) {
                            dotState = "done";
                        }
                    }
                    return (_jsxs("div", { className: `${C.row} ${s.isCurrent ? C.rowSelected : ""} ${menuOpenId === s.id ? C.rowMenuOpen : ""}`, role: "treeitem", "aria-selected": s.isCurrent, onClick: () => onOpen(s.id), onContextMenu: (e) => {
                            // Allow the @baihejiangnan/dsh-session-context-menu plugin
                            // to intercept the right-click on this treeitem row.
                            // The event bubbles naturally; we just don't prevent it.
                        }, onKeyDown: (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onOpen(s.id);
                            }
                        }, children: [_jsx("span", { className: C.rowSlot, children: dotState !== undefined && _jsx(StateDot, { state: dotState }) }), _jsx("span", { className: C.rowTitle, children: s.title }), !s.blank && (_jsx("span", { className: C.rowTime, children: timeLabel(s.updatedAt, now) })), _jsx("span", { className: C.rowActions, children: _jsx(Menu, { open: menuOpenId === s.id, anchor: _jsx("button", { type: "button", className: C.iconBtn, "aria-label": t("actions.session.aria", { name: s.title }), onClick: (e) => {
                                            e.stopPropagation();
                                            setMenuOpenId((prev) => (prev === s.id ? null : s.id));
                                        }, children: _jsx(IconEllipsisOutline16, {}) }), items: [
                                        { id: "unpin", label: t("unpin") },
                                    ], onSelect: (itemId) => {
                                        setMenuOpenId(null);
                                        if (itemId === "unpin")
                                            onUnpin(s.id);
                                    }, onClose: () => setMenuOpenId(null), portal: true, closeOnPointerLeave: true }) })] }, s.id));
                }) }))] }));
}
/**
 * Hidden sentinel component: renders nothing visible in the footer, but
 * provides a DOM ref for portaling the pinned section to the top of the
 * sidebar.
 */
export function PinnedSection(props) {
    const { pins, open, useSessions, t } = props;
    const footerRef = useRef(null);
    const sessions = useSessions((state) => state);
    const current = sessions.current;
    const [pinnedRecords, setPinnedRecords] = useState([]);
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
    const unpin = useCallback(async (id) => {
        const result = await pins.unpin(id);
        if (result.ok) {
            void refresh();
            globalThis.dispatchEvent(new CustomEvent("pin-sessions:changed"));
        }
    }, [pins, refresh]);
    // NOTE: Pinned sessions are shown in the dedicated section above. We do NOT
    // hide them from the workspace browser's session list. DSH exposes no
    // data-source filter hook for the sidebar list (SessionListState.ids is
    // host-owned; ui-workspace renders rows internally), and a DOM-based hide
    // (MutationObserver + class toggling) self-excites into an infinite loop
    // because toggling the class re-triggers the observer — that froze the app.
    // The duplication is cosmetic; the freeze was fatal, so we leave the list alone.
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: footerRef, style: { display: "none" } }), target
                ? createPortal(_jsx(PinnedSectionContent, { pinnedRecords: pinnedRecords, sessions: sessions, current: current, onOpen: open, onUnpin: unpin, t: t }), target)
                : null] }));
}
