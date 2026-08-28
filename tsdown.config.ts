import { defineConfig } from "tsdown";

/**
 * Client bundle build. tsdown emits a plain CJS file; `scripts/wrap-client.mjs`
 * then wraps it in the DSH browser module-loader handoff
 * (`window.__ModuleLoader__.load({ id, factory })`) so the client-modules
 * shell can register the plugin bundle.
 */
export default defineConfig({
	entry: {
		client: "src/client/index.ts",
	},
	format: ["cjs"],
	platform: "browser",
	target: "es2022",
	outDir: "lib",
	clean: false,
	sourcemap: false,
	minify: false,
	dts: false,
	outExtensions: () => ({ js: ".js" }),
	deps: {
		neverBundle: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/, /^@deepseek-ai\//],
		alwaysBundle: [/^zod$/],
	},
});
