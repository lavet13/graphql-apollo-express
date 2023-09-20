import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import codegen from 'vite-plugin-graphql-codegen';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  server: {
    port: 4000,
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/app.ts',
      tsCompiler: 'esbuild',
    }),
    codegen({
      matchOnSchemas: true,
      debug: true,
    }),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: '__tla',
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: i => `__tla_${i}`,
    }),
  ],
});
