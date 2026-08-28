/**
 * Locale dictionaries for the pin-sessions panel.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
	"title": "置顶会话",
	"empty": "暂无置顶会话",
	"unpin": "取消置顶",
	"pin": "置顶当前会话",
	"trigger": "置顶会话",
	"section.aria": "置顶会话列表",
	"newSession": "新会话",
	"ctx.pin": "置顶会话",
	"ctx.unpin": "取消置顶",
	"actions.session.aria": "会话操作: \"{name}\"",
	"archive.title": "归档会话",
	"archive.description": "在这里可以批量管理并删除会话。删除后不可恢复。",
	"archive.select_all": "全选",
	"archive.delete_selected": "删除选中",
	"archive.confirm": "确定要删除选中的会话吗？此操作不可恢复。",
	"archive.empty": "暂无会话",
	"archive.deleted": "已删除 {count} 个会话",
	"archive.errors": "{count} 个会话删除失败",
	"archive.search": "搜索会话…",
	"archive.col_title": "标题",
	"archive.col_updated": "更新时间",
	"archive.col_cwd": "工作区",
	"archive.restore": "还原到工作区",
} as const;

/** All keys used by the pin-sessions panel. */
export type PinSessionsKey = keyof typeof zh;

/** English dictionary, checked complete against the zh key set. */
export const en: Record<PinSessionsKey, string> = {
	"title": "Pinned",
	"empty": "No pinned sessions",
	"unpin": "Unpin",
	"pin": "Pin current session",
	"trigger": "Pinned Sessions",
	"section.aria": "Pinned sessions list",
	"newSession": "New Session",
	"ctx.pin": "Pin session",
	"ctx.unpin": "Unpin session",
	"actions.session.aria": "Session actions: \"{name}\"",
	"archive.title": "Archived Sessions",
	"archive.description": "Batch-manage and delete sessions here. Deletion is irreversible.",
	"archive.select_all": "Select all",
	"archive.delete_selected": "Delete selected",
	"archive.confirm": "Delete the selected sessions? This cannot be undone.",
	"archive.empty": "No sessions",
	"archive.deleted": "Deleted {count} session(s)",
	"archive.errors": "{count} session(s) failed to delete",
	"archive.search": "Search sessions…",
	"archive.col_title": "Title",
	"archive.col_updated": "Updated",
	"archive.col_cwd": "Workspace",
	"archive.restore": "Restore to workspace",
};
