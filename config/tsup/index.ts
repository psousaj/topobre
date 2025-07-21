import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts', 'index.ts'],
    format: ['esm', 'cjs'],
    target: 'es2020',
    sourcemap: true,
    clean: true,
    dts: true,
    outDir: 'dist',
    skipNodeModulesBundle: true,
})
