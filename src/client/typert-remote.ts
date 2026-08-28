/**
 * Client TYPERT_REMOTE face: installs the `pins` namespace on the client
 * through `ctx.remote.$mount(...)`, mirroring the host TYPERT manifest
 * one-to-one so both directions validate with the same strict codecs.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */

import type { TypertRemoteContribution } from "@deepseek-ai/dsh-typert-protocol";
import { z } from "zod";
import { deleteResultSchema, pinListSchema, pinRecordSchema, toggleResultSchema } from "../schemas.js";

const PKG = "@opendsh/dsh-plugin-pin-sessions";

const direct: { kind: "direct" } = { kind: "direct" };

function jsonCodec(typeSymbol: string, schema: z.ZodType) {
	return { mode: "strict" as const, typeSymbol: `${PKG}/types#${typeSymbol}`, schema };
}

function result(typeSymbol: string, schema: z.ZodType) {
	return { mode: "strict" as const, typeSymbol: `${PKG}/types#${typeSymbol}`, schema };
}

/** Remote contribution consumed by `ctx.remote.$mount(...)`. */
export const TYPERT_REMOTE: TypertRemoteContribution = {
	package: PKG,
	descriptors: [
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
