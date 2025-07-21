import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/main.ts', 'src/index.ts', 'index.ts'],
    format: ['cjs'],
    target: 'es2020',
    sourcemap: true,
    clean: true,
    dts: false,
    outDir: 'dist',
    esbuildOptions(options) {
        options.define ||= {}
        options.define['Reflect.decorate'] = 'Reflect.decorate'
    },
})
