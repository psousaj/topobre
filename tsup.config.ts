import { defineConfig } from 'tsup'
import { readdirSync, existsSync } from 'fs'
import * as path from 'path'
import { Options } from 'tsup'
import { copyRecursiveSync } from './build/scripts/copyStatic'

function generateAliases() {
    const aliases = {}
    const dirs = ['packages', 'apps']

    dirs.forEach((dir) => {
        const dirPath = path.join(__dirname, dir)
        try {
            const packages = readdirSync(dirPath, { withFileTypes: true })
                .filter((entry) => entry.isDirectory())
                .map((entry) => entry.name)

            packages.forEach((pkg) => {
                const distPath = path.join(__dirname, dir, pkg, 'dist', 'bundle', 'index.js')
                if (existsSync(distPath)) {
                    aliases[`@topobre/${pkg}`] = distPath
                }
            })
        } catch (error) {
            console.warn(`Não foi possível ler o diretório ${dir}: ${error.message}`)
        }
    })

    // Aliases específicos
    aliases['@topobre/typeorm/types'] = path.join(__dirname, 'packages', 'typeorm', 'dist', 'types')

    return aliases
}

export default defineConfig((options: Options) => {
    const defaultEntries = ['dist/index.js', 'dist/server.js']
    const entries = options.entry as string[] || defaultEntries
    const validEntries = entries.filter((entry) => existsSync(path.join(process.cwd(), entry)))

    const rootDir = path.resolve(__dirname)
    const srcRoot = path.join(rootDir, 'src')
    const distRoot = path.join(rootDir, 'dist', 'bundle')

    return {
        entry: validEntries,
        format: ['cjs'],
        target: 'es2020',
        sourcemap: true,
        clean: true,
        dts: false,
        outDir: 'dist/bundle',
        skipNodeModulesBundle: false,
        splitting: false,
        bundle: true,
        minify: true,
        external: [],
        outExtension() {
            return {
                js: '.js'
            }
        },
        name: 'index',
        esbuildOptions(config) {
            config.alias = generateAliases()
            config.platform = 'node'
            config.bundle = true
            config.mainFields = ['main', 'module']
        },
        async onSuccess() {
            await copyRecursiveSync(srcRoot, distRoot, ['.hbs', '.html'])
        }
    }
}
)