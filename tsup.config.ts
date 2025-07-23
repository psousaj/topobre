import { defineConfig } from 'tsup'
import { readdirSync } from 'fs'
import { join } from 'path'

function generateAliases() {
    const aliases = {}

    // Diretórios a serem escaneados
    const dirs = ['packages', 'apps']

    dirs.forEach((dir) => {
        const dirPath = join(__dirname, dir)
        try {
            // Lista todas as pastas em packages/* e apps/*
            const packages = readdirSync(dirPath, { withFileTypes: true })
                .filter((entry) => entry.isDirectory())
                .map((entry) => entry.name)

            // Cria aliases para cada pacote/app
            packages.forEach((pkg) => {
                aliases[`@topobre/${pkg}`] = join(__dirname, dir, pkg, 'dist')
            })
        } catch (error) {
            console.warn(`Não foi possível ler o diretório ${dir}: ${error.message}`)
        }
    })

    // Alias específico para typeorm/types e t3-oss/env-nextjs
    aliases['@topobre/typeorm/types'] = join(__dirname, 'packages', 'typeorm', 'dist', 'types')
    aliases['@t3-oss/env-nextjs'] = join(__dirname, 'packages', 'env', 'node_modules', '@t3-oss', 'env-nextjs')

    return aliases
}

export default defineConfig((options) => ({
    entry: options.entry || ['dist/index.js', 'dist/server.js'],
    format: ['cjs'],
    target: 'es2020',
    sourcemap: true,
    clean: false,
    dts: false,
    outDir: 'dist/bundle',
    skipNodeModulesBundle: false,
    splitting: false,
    minify: true,
    outExtension() {
        return {
            js: '.js'
        }
    },
    name: 'index',
    esbuildOptions(config) {
        config.alias = generateAliases()
    }
}))