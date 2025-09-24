/* eslint-disable sort-keys-fix/sort-keys-fix */
import { doGlob } from 'doglob';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
const entry = await doGlob(['src/**/*.ts'], { absolute: true });

const dtsPlugin = dts({
  entryRoot: 'src',
  outDir: 'dist',
  tsconfigPath: './tsconfig.json',
  exclude: ['vite.config.ts', 'src/cli.ts', 'src/scripts/postinstall.ts'],
});

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry,
    },
    target: 'esnext',
    reportCompressedSize: true,
    minify: 'esbuild',
    emptyOutDir: true,

    rollupOptions: {
      external: ['*'],
      output: [
        {
          format: 'esm',
          dir: 'dist',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
        },
      ],
    },
  },
  plugins: [dtsPlugin],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
