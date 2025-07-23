import { defineConfig } from 'tsup'
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { Options } from 'tsup'

function generateAliases() {
    const aliases = {}
    const dirs = ['packages', 'apps']

    dirs.forEach((dir) => {
        const dirPath = join(__dirname, dir)
        try {
            const packages = readdirSync(dirPath, { withFileTypes: true })
                .filter((entry) => entry.isDirectory())
                .map((entry) => entry.name)

            packages.forEach((pkg) => {
                const distPath = join(__dirname, dir, pkg, 'dist')
                if (existsSync(distPath)) {
                    aliases[`@topobre/${pkg}`] = distPath
                }
            })
        } catch (error) {
            console.warn(`Não foi possível ler o diretório ${dir}: ${error.message}`)
        }
    })

    // Aliases específicos
    aliases['@topobre/typeorm/types'] = join(__dirname, 'packages', 'typeorm', 'dist', 'types')

    return aliases
}

export default defineConfig((options: Options) => {
    const defaultEntries = ['dist/index.js', 'dist/server.js']
    const entries = options.entry as string[] || defaultEntries
    const validEntries = entries.filter((entry) => existsSync(join(process.cwd(), entry)))

    if (validEntries.length === 0) {
        console.warn(`Nenhuma entrada válida encontrada. Tentando: ${entries.join(', ')}`)
        return {} // Evita falha total
    }

    return {
        entry: validEntries,
        format: ['cjs'],
        target: 'es2020',
        sourcemap: true,
        clean: false,
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
            console.log(config)
        }
    }
}
)