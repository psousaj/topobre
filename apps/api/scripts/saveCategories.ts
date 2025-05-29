import { REPOSITORIES } from "../src/shared/constant";
import { AppDataSource } from "../src/db";
import { logger } from "../src/shared/logger";

const categories = [
    { displayName: "Empréstimo", name: "Loan", color: "#FFCC00" },
    { displayName: "Cartoes", name: "Cards", color: "#FF5733" },
    { displayName: "Terreno", name: "Land", color: "#33FF57" },
    { displayName: "Agua", name: "Water", color: "#3399FF" },
    { displayName: "Energia", name: "Energy", color: "#FF33A1" },
    { displayName: "Moradia", name: "Housing", color: "#FF33D4" },
    { displayName: "Outros", name: "Others", color: "#FF8C00" },
    { displayName: "Evento", name: "Event", color: "#8C00FF" },
    { displayName: "Eletronicos", name: "Electronics", color: "#00FF8C" },
    { displayName: "Viagem", name: "Travel", color: "#00A1FF" },
    { displayName: "Roupas", name: "Clothing", color: "#FF00A1" },
    { displayName: "Streams", name: "Streaming", color: "#A100FF" },
    { displayName: "Educação", name: "Education", color: "#00FF00" },
    { displayName: "Saúde", name: "Health", color: "#00FF33" },
    { displayName: "Transporte", name: "Transport", color: "#FF3300" }
];

export async function saveCategories() {
    try {
        logger.info("Inicializando datasource...");
        const dataSource = await AppDataSource.initialize();
        const categoryRepo = dataSource.getRepository(REPOSITORIES.CATEGORY);
        logger.info("Datasource conectado com sucesso.");

        for (const category of categories) {
            const exists = await categoryRepo.findOneBy({ name: category.name });
            if (exists) {
                logger.debug(`Categoria '${category.name}' já existe. Pulando...`);
            } else {
                const cat = categoryRepo.create({ ...category, isDefault: true });
                await categoryRepo.save(cat);
                logger.info(`Categoria '${category.name}' criada.`);
            }
        }

        logger.info("Seed finalizado.");
    } catch (error) {
        logger.error("Erro ao salvar categorias:", error);
    } finally {
        await AppDataSource.destroy();
        logger.info("Datasource encerrado.");
    }
}
