/**
 * Host TYPERT face for the `pins` namespace. The `dsh-typert-loader` scans
 * loader entries that export `./typert`, registers this manifest, and the
 * host gateway dispatches `pins/*` endpoints to the `pins` service.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import { z } from "zod";
import { deleteResultSchema, pinListSchema, pinRecordSchema, toggleResultSchema } from "./schemas.js";
const PKG = "@opendsh/dsh-plugin-pin-sessions";
const direct = { kind: "direct" };
function jsonCodec(typeSymbol, schema) {
    return { mode: "strict", typeSymbol: `${PKG}/types#${typeSymbol}`, schema };
}
function result(typeSymbol, schema) {
    return { mode: "strict", typeSymbol: `${PKG}/types#${typeSymbol}`, schema };
}
/** Strict host contribution: `pins/*` endpoints dispatched to `ctx.pins`. */
export const TYPERT = {
    package: PKG,
    face: "host",
    schemas: [],
    model: {
        services: [
            {
                tags: [],
                key: "pins",
                exportName: "pins",
                members: [
                    { name: "list", kind: "method", signature: "(): PinRecord[]" },
                    { name: "pin", kind: "method", signature: "(sessionId: string): Promise<PinRecord>" },
                    { name: "unpin", kind: "method", signature: "(sessionId: string): Promise<boolean>" },
                    { name: "toggle", kind: "method", signature: "(sessionId: string): Promise<ToggleResult>" },
                    { name: "isPinned", kind: "method", signature: "(sessionId: string): boolean" },
                    { name: "deleteSessions", kind: "method", signature: "(sessionIds: string[]): Promise<DeleteResult>" },
                    { name: "listArchived", kind: "method", signature: "(): string[]" },
                    { name: "unarchiveSession", kind: "method", signature: "(sessionId: string): Promise<boolean>" },
                ],
                types: [
                    { name: "SessionId", declaration: "export type SessionId = string;" },
                    {
                        name: "PinRecord",
                        declaration: "export interface PinRecord { id: string; pinnedAt: number; }",
                    },
                    {
                        name: "ToggleResult",
                        declaration: "export interface ToggleResult { id: string; pinned: boolean; }",
                    },
                    {
                        name: "DeleteResult",
                        declaration: "export interface DeleteResult { deleted: string[]; errors: { id: string; error: string }[]; }",
                    },
                ],
            },
        ],
        events: [],
        objects: [],
    },
    invocations: [
        {
            id: `${PKG}#pins/list`,
            service: "pins",
            namespace: "pins",
            method: "list",
            invocation: direct,
            parameters: [],
            result: result("PinRecord[]", pinListSchema),
        },
        {
            id: `${PKG}#pins/pin`,
            service: "pins",
            namespace: "pins",
            method: "pin",
            invocation: direct,
            parameters: [
                {
                    name: "sessionId",
                    wire: "sessionId",
                    source: "json",
                    codec: jsonCodec("SessionId", z.string()),
                },
            ],
            result: result("PinRecord", pinRecordSchema),
        },
        {
            id: `${PKG}#pins/unpin`,
            service: "pins",
            namespace: "pins",
            method: "unpin",
            invocation: direct,
            parameters: [
                {
                    name: "sessionId",
                    wire: "sessionId",
                    source: "json",
                    codec: jsonCodec("SessionId", z.string()),
                },
            ],
            result: result("boolean", z.boolean()),
        },
        {
            id: `${PKG}#pins/toggle`,
            service: "pins",
            namespace: "pins",
            method: "toggle",
            invocation: direct,
            parameters: [
                {
                    name: "sessionId",
                    wire: "sessionId",
                    source: "json",
                    codec: jsonCodec("SessionId", z.string()),
                },
            ],
            result: result("ToggleResult", toggleResultSchema),
        },
        {
            id: `${PKG}#pins/isPinned`,
            service: "pins",
            namespace: "pins",
            method: "isPinned",
            invocation: direct,
            parameters: [
                {
                    name: "sessionId",
                    wire: "sessionId",
                    source: "json",
                    codec: jsonCodec("SessionId", z.string()),
                },
            ],
            result: result("boolean", z.boolean()),
        },
        {
            id: `${PKG}#pins/deleteSessions`,
            service: "pins",
            namespace: "pins",
            method: "deleteSessions",
            invocation: direct,
            parameters: [
                {
                    name: "sessionIds",
                    wire: "sessionIds",
                    source: "json",
                    codec: jsonCodec("SessionId[]", z.array(z.string())),
                },
            ],
            result: result("DeleteResult", deleteResultSchema),
        },
        {
            id: `${PKG}#pins/listArchived`,
            service: "pins",
            namespace: "pins",
            method: "listArchived",
            invocation: direct,
            parameters: [],
            result: result("SessionId[]", z.array(z.string())),
        },
        {
            id: `${PKG}#pins/unarchiveSession`,
            service: "pins",
            namespace: "pins",
            method: "unarchiveSession",
            invocation: direct,
            parameters: [
                {
                    name: "sessionId",
                    wire: "sessionId",
                    source: "json",
                    codec: jsonCodec("SessionId", z.string()),
                },
            ],
            result: result("boolean", z.boolean()),
        },
    ],
};
