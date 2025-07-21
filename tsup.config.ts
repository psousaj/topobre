// tsup.config.ts na raiz do monorepo
import { defineConfig } from 'tsup'
import path from 'path'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'))

// Detecta se deve usar decorators
const usesDecorators = fs.existsSync('tsconfig.json')
    ? fs.readFileSync('tsconfig.json', 'utf-8').includes('experimentalDecorators')
    : false

export default defineConfig({
    entry: [
        'src/index.ts',
        'src/main.ts',
        'index.ts',
    ],
    format: ['esm', 'cjs'],
    target: 'es2020',
    sourcemap: true,
    clean: true,
    dts: Boolean(pkg.types || pkg.typings),
    outDir: 'dist',
    skipNodeModulesBundle: true,
    esbuildOptions(options) {
        options.define ||= {}

        if (usesDecorators) {
            options.define['Reflect.decorate'] = 'Reflect.decorate'
        }
    },
})
