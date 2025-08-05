const fs = require('fs');
const path = require('path');

const IGNORED_FILES = new Set([
    'package.json',
    'tsconfig.json',
    'node_modules',
    'dist',
    'tsconfig.build.json',
    'README.md',
    'README',
    '.DS_Store',
]);

function copyMatchingFilesFromRoot(rootDir, extensions) {
    let copiedCount = 0;

    function walk(currentPath) {
        const stats = fs.statSync(currentPath);
        const name = path.basename(currentPath);

        if (IGNORED_FILES.has(name)) return;

        if (stats.isDirectory()) {
            for (const entry of fs.readdirSync(currentPath)) {
                walk(path.join(currentPath, entry));
            }
        } else {
            const shouldCopy = extensions.some(ext => currentPath.endsWith(ext));
            if (!shouldCopy) return;

            // Ex: apps/api/src/templates/email.hbs
            const relativeParts = path.relative(rootDir, currentPath).split(path.sep);
            const appsIndex = relativeParts.indexOf('apps');

            if (appsIndex === -1 || appsIndex + 2 >= relativeParts.length) return;

            const appName = relativeParts[appsIndex + 1];
            let subPathParts = relativeParts.slice(appsIndex + 2);

            // Se a primeira parte após o app for "src", removemos
            if (subPathParts[0] === 'src') {
                subPathParts = subPathParts.slice(1);
            }

            const destPath = path.join(rootDir, 'apps', appName, 'dist', ...subPathParts);
            const destDir = path.dirname(destPath);

            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

            fs.copyFileSync(currentPath, destPath);
            console.log(`✓ Copiado: ${currentPath} -> ${destPath}`);
            copiedCount++;
        }
    }

    console.log(`🔍 Procurando arquivos com extensões [${extensions.join(', ')}] em ${rootDir}...\n`);
    walk(rootDir);
    console.log(`\n✅ Total de arquivos copiados: ${copiedCount}`);
}

// ---------------------------

const rootDir = process.argv[2]; // Ex: . (raiz do monorepo)
const extArg = process.argv[3] || '.hbs';

const extensions = extArg
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
    .map(ext => (ext.startsWith('.') ? ext : `.${ext}`));

if (!rootDir) {
    console.error('Uso: node copyStatic.js rootDir [.hbs,.html,.json]');
    process.exit(1);
}

copyMatchingFilesFromRoot(rootDir, extensions);
