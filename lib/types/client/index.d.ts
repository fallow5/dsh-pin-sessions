import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
import { type PinSessionsKey } from "./locales.js";
declare module "@deepseek-ai/dsh-client-ui-slots" {
    interface LocaleNamespaceMap {
        /** Pin-sessions panel copy. */
        "pin-sessions": PinSessionsKey;
    }
    interface SlotMap {
        /** Settings panel section (declared by dsh-client-ui-settings at runtime). */
        "settings.section": {
            kind: "list";
            scope: "root";
            owner: {
                close: () => void;
            };
        };
    }
}
/** Services required before this plugin mounts. */
export declare const inject: string[];
/** Mount the browser half. */
export declare function apply(ctx: ClientContext): Promise<void>;
