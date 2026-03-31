import esbuild from "esbuild";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/index.browser.js',
  platform: 'browser',
  plugins: [
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      process: true,
    }),
    NodeModulesPolyfillPlugin(),
  ],
}).catch(() => process.exit(1));

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/index.js',
  platform: 'node',
  plugins: [],
}).catch(() => process.exit(1));

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'cjs',
  outfile: 'dist/index.cjs',
  platform: 'node',
  plugins: [],
}).catch(() => process.exit(1));