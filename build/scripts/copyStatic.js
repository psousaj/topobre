const fs = require('fs');
const path = require('path');


const IGNORED_FILES = new Set([
    'package.json',
    'tsconfig.json',
    'tsconfig.build.json',
    'README.md',
    'README',
    '.DS_Store',
]);

export async function copyRecursiveSync(srcPath, baseDir, outDir, extensions) {
    if (!fs.existsSync(srcPath)) return;

    const stats = fs.statSync(srcPath);
    const name = path.basename(srcPath);

    if (IGNORED_FILES.has(name)) return;

    if (stats.isDirectory()) {
        for (const entry of fs.readdirSync(srcPath)) {
            copyRecursiveSync(path.join(srcPath, entry), baseDir, outDir, extensions);
        }
    } else {
        const shouldCopy = extensions.some(ext => srcPath.endsWith(ext));
        if (!shouldCopy) return;

        const relPath = path.relative(baseDir, srcPath);
        const destPath = path.join(outDir, relPath);
        const destDir = path.dirname(destPath);

        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(srcPath, destPath);
    }
}

// ---------------------------

const srcDir = process.argv[2];
const distDir = process.argv[3];
const extArg = process.argv[4] || '.hbs';

const extensions = extArg
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
    .map(ext => (ext.startsWith('.') ? ext : `.${ext}`));

if (!srcDir || !distDir) {
    console.error('Uso: node copyStatic.js srcDir distDir [.hbs,.html,.json]');
    process.exit(1);
}

copyRecursiveSync(srcDir, srcDir, distDir, extensions);
