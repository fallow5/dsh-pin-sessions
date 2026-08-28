/**
 * Locale dictionaries for the pin-sessions panel.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    readonly title: "置顶会话";
    readonly empty: "暂无置顶会话";
    readonly unpin: "取消置顶";
    readonly pin: "置顶当前会话";
    readonly trigger: "置顶会话";
    readonly "section.aria": "置顶会话列表";
    readonly newSession: "新会话";
    readonly "ctx.pin": "置顶会话";
    readonly "ctx.unpin": "取消置顶";
    readonly "actions.session.aria": "会话操作: \"{name}\"";
    readonly "archive.title": "归档会话";
    readonly "archive.description": "在这里可以批量管理并删除会话。删除后不可恢复。";
    readonly "archive.select_all": "全选";
    readonly "archive.delete_selected": "删除选中";
    readonly "archive.confirm": "确定要删除选中的会话吗？此操作不可恢复。";
    readonly "archive.confirm_title": "确认删除";
    readonly "archive.cancel": "取消";
    readonly "archive.confirm_delete": "删除";
    readonly "archive.close": "关闭";
    readonly "archive.empty": "暂无会话";
    readonly "archive.deleted": "已删除 {count} 个会话";
    readonly "archive.errors": "{count} 个会话删除失败";
    readonly "archive.search": "搜索会话…";
    readonly "archive.col_title": "标题";
    readonly "archive.col_updated": "更新时间";
    readonly "archive.col_cwd": "工作区";
    readonly "archive.restore": "还原到工作区";
};
/** All keys used by the pin-sessions panel. */
export type PinSessionsKey = keyof typeof zh;
/** English dictionary, checked complete against the zh key set. */
export declare const en: Record<PinSessionsKey, string>;
