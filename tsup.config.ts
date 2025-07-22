// tsup.config.ts na raiz do monorepo
import { defineConfig, Options } from 'tsup'
import path from 'path'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf-8'))

// Detecta se deve usar decorators
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json')
const usesDecorators = fs.existsSync(tsconfigPath)
    ? fs.readFileSync(tsconfigPath, 'utf-8').includes('experimentalDecorators')
    : false

export default defineConfig((options: Options) => {
    return {
        entry: [
            'src/index.ts',
            'src/main.ts',
            'src/server.ts',
            'index.ts',
        ],
        format: ['esm', 'cjs'],
        target: 'es2020',
        sourcemap: true,
        clean: true,
        dts: Boolean(pkg.types || pkg.typings),
        outDir: options.outDir ?? 'dist',
        skipNodeModulesBundle: true,
        splitting: false,
        minify: false,
        shims: false,
        esbuildOptions(options) {
            options.define ||= {}

            if (usesDecorators) {
                options.define['Reflect.decorate'] = 'Reflect.decorate'
            }
        },
    }
})

