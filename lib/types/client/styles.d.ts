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
export declare const C: {
    readonly section: "dshps-section";
    readonly sectionHeader: "dshps-section-header";
    readonly sectionTitle: "dshps-section-title";
    readonly sectionIcon: "dshps-section-icon";
    readonly sectionCount: "dshps-section-count";
    readonly sectionBody: "dshps-section-body";
    readonly row: "dshps-sessionRow";
    readonly rowSelected: "dshps-selected";
    readonly rowMenuOpen: "dshps-menuOpen";
    readonly rowSlot: "dshps-slot";
    readonly rowTitle: "dshps-title";
    readonly rowTime: "dshps-time";
    readonly rowActions: "dshps-rowActions";
    readonly unpinBtn: "dshps-iconButton";
    readonly iconBtn: "dshps-iconButton";
    readonly archive: "dshps-archive";
    readonly archiveHeader: "dshps-archive-header";
    readonly archiveDesc: "dshps-archive-desc";
    readonly archiveToolbar: "dshps-archive-toolbar";
    readonly archiveSearch: "dshps-archive-search";
    readonly archiveSelectAll: "dshps-archive-select-all";
    readonly archiveDeleteBtn: "dshps-archive-delete-btn";
    readonly archiveDeleteBtnDanger: "dshps-archive-delete-btn-danger";
    readonly archiveTable: "dshps-archive-table";
    readonly archiveRow: "dshps-archive-row";
    readonly archiveCheckbox: "dshps-archive-checkbox";
    readonly archiveColTitle: "dshps-archive-col-title";
    readonly archiveColCwd: "dshps-archive-col-cwd";
    readonly archiveColTime: "dshps-archive-col-time";
    readonly archiveMessage: "dshps-archive-message";
    readonly archiveGroups: "dshps-archive-groups";
    readonly archiveGroup: "dshps-archive-group";
    readonly archiveGroupHeader: "dshps-archive-group-header";
    readonly archiveGroupIcon: "dshps-archive-group-icon";
    readonly archiveGroupTitle: "dshps-archive-group-title";
    readonly archiveGroupCount: "dshps-archive-group-count";
    readonly archivePager: "dshps-archive-pager";
    readonly archivePageBtn: "dshps-archive-page-btn";
    readonly archivePageInfo: "dshps-archive-page-info";
    readonly archiveRestoreBtn: "dshps-archive-restore-btn";
    readonly archiveDeleteDialog: "dshps-archive-delete-dialog";
    readonly archiveDeleteConfirm: "dshps-archive-delete-confirm";
};
/** Inject the stylesheet once. */
export declare function injectStyles(): void;
