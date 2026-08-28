import { type PinRecord } from "./types.js";
/** The `pin_sessions` domain declaration. */
export declare const pinDomain: {
    name: string;
    version: number;
    tables: {
        pins: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<string, PinRecord>;
    };
};
/** Type of the opened `pin-sessions` domain spec. */
export type PinDomain = typeof pinDomain;
