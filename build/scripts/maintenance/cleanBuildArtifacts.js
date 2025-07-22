const fs = require('fs/promises');
const path = require('path');

const rootDir = process.cwd();
const foldersToDelete = [];

async function getFoldersToDelete(folder) {
    try {
        const files = await fs.readdir(folder);

        // Printando o diretório atual
        console.log(`Checking folder: ${folder}`);

        const promises = files.map(async file => {
            const filePath = path.join(folder, file);

            if (file === 'node_modules') {
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
                if (Array.from(['dist', '.turbo']).includes(path.basename(filePath))) {
                    foldersToDelete.push(filePath);
                } else {
                    await getFoldersToDelete(filePath); // recursão
                }
            }
        });

        await Promise.all(promises);
    } catch (err) {
        console.error(`Erro lendo pasta ${folder}:`, err.message);
    }
}

(async () => {
    await getFoldersToDelete(rootDir);

    for (const folder of foldersToDelete) {
        console.log(`Deleting folder: ${folder}`);
        try {
            await fs.rm(folder, { recursive: true, force: true });
        } catch (err) {
            console.error(`Erro deletando ${folder}:`, err.message);
        }
    }

    console.log(`✅ Done. Deleted ${foldersToDelete.length} build artifact folder(s).`);
})();
