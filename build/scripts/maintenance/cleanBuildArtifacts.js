import fs from 'fs/promises'
import path from 'path'
import process from 'process';

const rootDir = process.cwd();
const foldersToDelete = [];

async function getFoldersToDelete(folder, deleteNodeModules = false) {
    try {
        const files = await fs.readdir(folder);

        // Printando o diretório atual
        console.log(`Checking folder: ${folder}`);

        const promises = files.map(async file => {
            const filePath = path.join(folder, file);

            if (file === 'node_modules' && !deleteNodeModules) {
                // pula node_modules completamente
                return;
            }

            let stats;
            try {
                stats = await fs.stat(filePath);
            } catch (err) {
                console.error(`Erro ao acessar ${filePath}:`, err.message);
                return;
            }

            if (stats.isDirectory()) {
                if (Array.from(['dist', '.turbo', 'node_modules']).includes(path.basename(filePath))) {
                    foldersToDelete.push(filePath);
                } else {
                    await getFoldersToDelete(filePath); // recursão
                }
            } else if (stats.isFile()) {
                if (path.basename(filePath) === 'tsconfig.tsbuildinfo') {
                    foldersToDelete.push(filePath);
                }
            }
        });

        await Promise.all(promises);
    } catch (err) {
        console.error(`Erro lendo pasta ${folder}:`, err.message);
    }
}

(async () => {
    const deleteNodeModules = process.argv.includes('-D');
    await getFoldersToDelete(rootDir, deleteNodeModules);

    for (const folder of foldersToDelete) {
        console.log(`\n\n\nDeleting folder: ${folder}`);
        try {
            await fs.rm(folder, { recursive: true, force: true });
        } catch (err) {
            console.error(`\n\nErro deletando ${folder}: \n\n`, err.message);
        }
    }

    console.log(`\n\n✅ Done. Deleted ${foldersToDelete.length} build artifact folder(s).`);
})();
