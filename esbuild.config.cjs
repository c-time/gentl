const esbuild = require('esbuild');
const { NodeGlobalsPolyfillPlugin } = require('@esbuild-plugins/node-globals-polyfill');
const { NodeModulesPolyfillPlugin } = require('@esbuild-plugins/node-modules-polyfill');

esbuild.build({
  entryPoints: ['src/Gentl.ts'],
  bundle: true,
  outfile: 'dist/Gentl.browser.js',
  platform: 'browser',
  plugins: [
    NodeGlobalsPolyfillPlugin({
      buffer: true,
      process: true,
    }),
    NodeModulesPolyfillPlugin(),
  ],
}).catch(() => process.exit(1));