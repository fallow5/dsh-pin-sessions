/**
 * Theme-aware stylesheet for the pin-sessions panel.
 *
 * Pinned-session rows mirror the native sidebar session-row CSS exactly
 * (same height, font sizes, colors, hover states, time-hide-on-hover).
 * Archive panel uses its own scoped classes.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
/** Scoped class names referenced by the panel components. */
export const C = {
    section: "dshps-section",
    sectionHeader: "dshps-section-header",
    sectionTitle: "dshps-section-title",
    sectionIcon: "dshps-section-icon",
    sectionCount: "dshps-section-count",
    sectionBody: "dshps-section-body",
    // Pinned session row — mirrors native YDXeBa_sessionRow
    row: "dshps-sessionRow",
    rowSelected: "dshps-selected",
    rowMenuOpen: "dshps-menuOpen",
    rowSlot: "dshps-slot",
    rowTitle: "dshps-title",
    rowTime: "dshps-time",
    rowActions: "dshps-rowActions",
    unpinBtn: "dshps-iconButton",
    iconBtn: "dshps-iconButton",
    // Archive panel classes
    archive: "dshps-archive",
    archiveHeader: "dshps-archive-header",
    archiveDesc: "dshps-archive-desc",
    archiveToolbar: "dshps-archive-toolbar",
    archiveSearch: "dshps-archive-search",
    archiveSelectAll: "dshps-archive-select-all",
    archiveDeleteBtn: "dshps-archive-delete-btn",
    archiveDeleteBtnDanger: "dshps-archive-delete-btn-danger",
    archiveTable: "dshps-archive-table",
    archiveRow: "dshps-archive-row",
    archiveCheckbox: "dshps-archive-checkbox",
    archiveColTitle: "dshps-archive-col-title",
    archiveColCwd: "dshps-archive-col-cwd",
    archiveColTime: "dshps-archive-col-time",
    archiveMessage: "dshps-archive-message",
    archiveGroups: "dshps-archive-groups",
    archiveGroup: "dshps-archive-group",
    archiveGroupHeader: "dshps-archive-group-header",
    archiveGroupIcon: "dshps-archive-group-icon",
    archiveGroupTitle: "dshps-archive-group-title",
    archiveGroupCount: "dshps-archive-group-count",
    archivePager: "dshps-archive-pager",
    archivePageBtn: "dshps-archive-page-btn",
    archivePageInfo: "dshps-archive-page-info",
    archiveRestoreBtn: "dshps-archive-restore-btn",
};
const css = `
/* ── Pinned section container ─────────────────────────────────────────── */
.dshps-section{box-sizing:border-box;flex:none;padding:0 0 4px;display:flex;flex-direction:column;gap:2px}
.dshps-section-header{box-sizing:border-box;cursor:pointer;user-select:none;color:var(--dsw-alias-label-primary);border-radius:8px;align-items:center;gap:6px;height:34px;padding:0 8px;display:flex}
.dshps-section-header:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dshps-section-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:20px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.dshps-section-icon{color:var(--dsw-alias-label-tertiary);flex:none;width:16px;height:20px;justify-content:center;align-items:center;display:inline-flex}
.dshps-section-count{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:20px;flex:none}
.dshps-section-body{flex-direction:column;gap:0;padding:0;display:flex}

/* ── Pinned session row — mirrors native YDXeBa_sessionRow exactly ────── */
.dshps-sessionRow{cursor:pointer;user-select:none;color:var(--dsw-alias-label-primary);border-radius:8px;align-items:center;height:32px;padding:0 8px;display:flex;overflow:hidden;gap:0;animation:dshps-row-in .15s var(--ds-ease-in-out)}
.dshps-sessionRow:hover,.dshps-sessionRow.dshps-selected,.dshps-sessionRow.dshps-menuOpen{background:var(--dsw-alias-interactive-bg-hover)}
.dshps-slot{width:16px;height:20px;color:var(--dsw-alias-label-tertiary);flex:none;justify-content:center;align-items:center;display:inline-flex}
.dshps-title{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-size:14px;line-height:20px;overflow:hidden;flex:1;margin:0 6px 0 4px}
.dshps-time{color:var(--dsw-alias-label-tertiary);flex:none;font-size:12px;line-height:20px}
.dshps-rowActions{flex:none;align-items:center;gap:12px;display:none}
.dshps-sessionRow:hover .dshps-rowActions,.dshps-sessionRow.dshps-menuOpen .dshps-rowActions{display:inline-flex}
.dshps-sessionRow:hover .dshps-time,.dshps-sessionRow.dshps-menuOpen .dshps-time{display:none}
.dshps-iconButton{cursor:pointer;width:16px;height:16px;color:var(--dsw-alias-label-tertiary);background:0 0;border:none;border-radius:4px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex}
.dshps-iconButton:hover{color:var(--dsw-alias-label-primary)}
@keyframes dshps-row-in{0%{opacity:0}}
@media (prefers-reduced-motion:reduce){.dshps-sessionRow{transition:none;animation:none}}

/* ── Archive panel ─────────────────────────────────────────────────────── */
.dshps-archive{display:flex;flex-direction:column;gap:12px}
.dshps-archive-header{display:flex;flex-direction:column;gap:4px}
.dshps-archive-desc{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}
.dshps-archive-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dshps-archive-search{flex:1;min-width:120px;height:32px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:0 10px;font-family:inherit;font-size:14px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}
.dshps-archive-search:focus{outline:none;border-color:var(--dsw-alias-state-business-primary)}
.dshps-archive-select-all{cursor:pointer;height:32px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:0 0;color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;display:inline-flex;align-items:center;gap:4px}
.dshps-archive-select-all:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dshps-archive-delete-btn{cursor:pointer;height:32px;padding:0 12px;border:none;border-radius:8px;background:var(--dsw-alias-state-danger);color:#fff;font-family:inherit;font-size:13px;display:inline-flex;align-items:center;gap:4px;transition:opacity .15s}
.dshps-archive-delete-btn:disabled{opacity:.4;cursor:not-allowed}
.dshps-archive-delete-btn-danger:not(:disabled):hover{opacity:.85}
.dshps-archive-table{display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;overflow:hidden}
.dshps-archive-row{display:flex;align-items:center;gap:8px;padding:0 10px;height:36px;border-bottom:1px solid var(--dsw-alias-border-l2);font-size:13px;color:var(--dsw-alias-label-primary)}
.dshps-archive-row:last-child{border-bottom:none}
.dshps-archive-row:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dshps-archive-checkbox{flex:none;width:16px;height:16px;cursor:pointer}
.dshps-archive-col-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshps-archive-col-cwd{flex:none;width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dshps-archive-col-time{flex:none;width:70px;text-align:right;color:var(--dsw-alias-label-tertiary);font-size:12px}
.dshps-archive-message{font-size:13px;color:var(--dsw-alias-label-secondary);padding:4px 0}
.dshps-archive-groups{display:flex;flex-direction:column;gap:12px}
.dshps-archive-group{display:flex;flex-direction:column;gap:4px}
.dshps-archive-group-header{display:flex;align-items:center;gap:6px;height:28px;padding:0 4px;color:var(--dsw-alias-label-secondary);font-size:13px;font-weight:500}
.dshps-archive-group-icon{color:var(--dsw-alias-label-tertiary);flex:none;display:inline-flex;align-items:center}
.dshps-archive-group-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshps-archive-group-count{color:var(--dsw-alias-label-tertiary);font-size:11px;background:var(--dsw-alias-interactive-bg-hover);border-radius:8px;padding:0 6px;min-width:18px;text-align:center}
.dshps-archive-pager{display:flex;align-items:center;gap:4px;margin-left:auto}
.dshps-archive-page-btn{cursor:pointer;width:28px;height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:0 0;color:var(--dsw-alias-label-primary);font-size:14px;display:inline-flex;align-items:center;justify-content:center}
.dshps-archive-page-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dshps-archive-page-btn:disabled{opacity:.4;cursor:not-allowed}
.dshps-archive-page-info{color:var(--dsw-alias-label-tertiary);font-size:12px;white-space:nowrap}
.dshps-archive-restore-btn{cursor:pointer;width:24px;height:24px;border:none;border-radius:4px;background:0 0;color:var(--dsw-alias-label-tertiary);font-size:14px;display:inline-flex;align-items:center;justify-content:center;flex:none}
.dshps-archive-restore-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}
`;
/** Inject the stylesheet once. */
export function injectStyles() {
    const tagId = "@opendsh/dsh-plugin-pin-sessions/styles";
    if (typeof document === "undefined")
        return;
    if (document.querySelector(`style[data-plugin-css=${JSON.stringify(tagId)}]`) !== null)
        return;
    const tag = document.createElement("style");
    tag.dataset.plugin = "@opendsh/dsh-plugin-pin-sessions";
    tag.dataset.pluginCss = tagId;
    tag.textContent = css;
    document.head.appendChild(tag);
}
