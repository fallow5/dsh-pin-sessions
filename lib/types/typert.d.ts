/**
 * Host TYPERT face for the `pins` namespace. The `dsh-typert-loader` scans
 * loader entries that export `./typert`, registers this manifest, and the
 * host gateway dispatches `pins/*` endpoints to the `pins` service.
 *
 * @module @opendsh/dsh-plugin-pin-sessions
 */
import { z } from "zod";
/** Strict host contribution: `pins/*` endpoints dispatched to `ctx.pins`. */
export declare const TYPERT: {
    package: string;
    face: string;
    schemas: never[];
    model: {
        services: {
            tags: never[];
            key: string;
            exportName: string;
            members: {
                name: string;
                kind: string;
                signature: string;
            }[];
            types: {
                name: string;
                declaration: string;
            }[];
        }[];
        events: never[];
        objects: never[];
    };
    invocations: {
        id: string;
        service: string;
        namespace: string;
        method: string;
        invocation: {
            kind: "direct";
        };
        parameters: {
            name: string;
            wire: string;
            source: string;
            codec: {
                mode: "strict";
                typeSymbol: string;
                schema: z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
            };
        }[];
        result: {
            mode: "strict";
            typeSymbol: string;
            schema: z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
        };
    }[];
};
