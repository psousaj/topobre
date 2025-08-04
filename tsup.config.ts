import { defineConfig } from 'tsup';
import { readdirSync, existsSync, readFileSync } from 'fs';
import * as path from 'path';
import { Options } from 'tsup';
import { copyRecursiveSync } from './build/scripts/copyStatic.js';

function generateAliases() {
  const aliases = {};
  const dirs = ['packages', 'apps'];

  dirs.forEach((dir) => {
    const dirPath = path.join(__dirname, dir);
    try {
      const packages = readdirSync(dirPath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      packages.forEach((pkg) => {
        const distPath = path.join(dirPath, pkg, 'dist', 'bundle', 'index.js');
        if (existsSync(distPath)) {
          aliases[`@topobre/${pkg}`] = distPath;
        }
      });
    } catch (error) {
      console.warn(`Não foi possível ler o diretório ${dir}: ${error.message}`);
    }
  });

  aliases['@topobre/typeorm/types'] = path.join(__dirname, 'packages', 'typeorm', 'dist', 'types');

  return aliases;
}

export default defineConfig((options: Options) => {
  const defaultEntries = ['dist/index.js', 'dist/server.js'];
  const entries = (options.entry as string[]) || defaultEntries;
  const validEntries = entries.filter((entry) => existsSync(path.join(process.cwd(), entry)));

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
        js: '.js',
      };
    },
    name: 'index',
    esbuildOptions(config) {
      config.alias = generateAliases();
      config.platform = 'node';
      config.bundle = true;
      config.mainFields = ['main', 'module'];
    },
    async onSuccess() {
      const packageRoot = process.cwd();
      const srcDir = path.join(packageRoot, 'src');
      const outDir = path.join(packageRoot, 'dist', 'bundle');

      const packageJsonPath = path.join(packageRoot, 'package.json');
      let extensionsToCopy = []; 
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        if (packageJson.copyStatic && Array.isArray(packageJson.copyStatic)) {
          extensionsToCopy = packageJson.copyStatic;
        }
      }

      if (existsSync(srcDir) && extensionsToCopy.length > 0) {
        console.log(`Copying static files with extensions: ${extensionsToCopy.join(', ')}`);
        copyRecursiveSync(srcDir, outDir, extensionsToCopy);
        console.log(`Static files copied for ${path.basename(packageRoot)}`);
      }
    },
  };
});
