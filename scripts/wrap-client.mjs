#!/usr/bin/env node
/**
 * Wrap the tsdown client bundle in the DSH browser module-loader handoff.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PKG = "@opendsh/dsh-plugin-pin-sessions";
const TARGET = new URL("../lib/client.js", import.meta.url);

const code = readFileSync(TARGET, "utf8");
const indented = code
	.split("\n")
	.map((line) => `\t${line}`)
	.join("\n");

const wrapped = `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(PKG)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${indented}
\t\treturn module.exports;
\t}
});
`;

writeFileSync(TARGET, wrapped);
console.log(`wrapped ${TARGET.pathname}`);
